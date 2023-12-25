import { getConnection } from "../constants/db.connection.js";
import { getCurrentFinancialYearId } from "../queries/financialYear.js";
import { STOREID, COMPCODE, COMPNAME, PROJECTID, GF_INWARD_PTRANSACTION, TCODE, TTYPE, LOCID, POTYPE, TRANSTYPE } from "../constants/defaultQueryValues.js"
import { getNextGreyFabPurInwardNo } from "../queries/sequences.js";
import { getSupplierName } from "../queries/supplier.js";
import moment from "moment";
import { getRemovedItems, substract } from "../Helpers/helper.js";

export async function getDocId(req, res) {
    const connection = await getConnection(res)
    const fPoIno = await getNextGreyFabPurInwardNo(connection);
    connection.close()
    return res.json({ statusCode: 0, docId: fPoIno })
}

export async function create(req, res) {
    const connection = await getConnection(res)
    const { supplierId: gtCompMastId, remarks: REMARKS, vehicleNo: VEHICLENO, supplierDcDate: DCDATE, supplierDcNo: SUPPDCNO, deliveryDetails } = req.body;
    try {
        if (!gtCompMastId) {
            return res.json({ statusCode: 1, message: 'Required Fields: supplierId, deliveryDetails' });
        }

        if (deliveryDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Delivery Details Cannot be Empty' });
        }
        const GFPOINDATE = moment(new Date()).format("DD-MM-YYYY");
        const FINYEAR = await getCurrentFinancialYearId(connection);
        const GFPOINO = await getNextGreyFabPurInwardNo(connection);
        const SUPPLIER = await getSupplierName(connection, gtCompMastId);
        const TOTALQTY = deliveryDetails.reduce((a, c) => a + parseFloat(c.delQty), 0);
        const nonGridSql = `
        INSERT INTO gtFabPurInward (gtFabPurInwardId, STOREDID, FINYEAR, COMPCODE, TCODE, TTYPE, PTRANSACTION, COMPNAME,REMARKS, VEHICLENO, LOCID, SUPPLIER, DCDATE, SUPPDCNO, GFPOINDATE, GFPOINO,PROJECTID,TOTQTY, ENTRYTYPE ) 
        VALUES ( supplierseq.nextVal, '${STOREID}', '${FINYEAR}' , '${COMPCODE}' , '${TCODE}' , '${TTYPE}' , '${GF_INWARD_PTRANSACTION}' , '${COMPNAME}' ,'${REMARKS}' ,
             '${VEHICLENO}' , '${LOCID}' , '${SUPPLIER}', TO_DATE('${DCDATE}', 'DD/MM/YY'), '${SUPPDCNO}', TO_DATE('${GFPOINDATE}','DD/MM/YY'), '${GFPOINO}',
             '${PROJECTID}','${TOTALQTY}', 'SP')
        `;
        console.log(nonGridSql, 'ngs');
        const nonGridResult = await connection.execute(nonGridSql)
        const lastRowData = await connection.execute(`
        select gtFabPurInwardId from gtFabPurInward where rowid = '${nonGridResult.lastRowid}'
        `)
        const gtFabPurInwardId = lastRowData.rows[0][0]
        await (async function createGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {

                let gtFabricPoDetResult = await connection.execute(`
                select aliasname, uom,fabdesign, fabcolor,fdia,kdia,ll,gg,gsm, buyercode, tax, orderno, poQty , po.gtFabricpoid, po.docdate, porate, 
                totalgrnqty
                from gtFabricpoDet det
                join gtfabricPo po on det.GTFABRICPOID = po.gtfabricpoid
                    where gtfabricpoid = ${deliveryItem.poDetId}
                `)
                const [aliasname, uom, fabdesign, fabcolor, fdia, kdia, ll, gg, gsm, buyercode, tax, orderNo, poQty, gtFabricpoid, poDate, porate, aGrnQty] = gtFabricPoDetResult.rows[0]
                const taxRate = porate + (porate / 100 * tax)
                const balQty = parseFloat(poQty) - parseFloat(aGrnQty ? aGrnQty : 0)
                const totalGrnQty = parseFloat(deliveryItem.delQty);
                let grnQty = totalGrnQty;
                let excessQty = 0;
                if (grnQty > balQty) {
                    grnQty = balQty
                    excessQty = totalGrnQty - balQty
                }
                const convertedPoDate = moment(poDate).format("DD-MM-YYYY")
                const gridSql = `
                INSERT INTO gtfabpurinwardDET (gtfabpurinwardDETID,gtFabPurInwardId,PROCESSNAME,BUYERCODE, ALIASNAME, COLOR, PONO, 
                    UOM,AGRNQTY, TAXRATE, gtfabricpodetid, ORDERNO, GRNQTY, 
                    BALQTY, POPRICE, POQTY, GRNROLLS, TOTALGRNQTY, LOTNO, POTYPE, PODATE, TRANSTYPE, EXCESSQTY)
                    VALUES(supplierseq.nextVal, ${gtFabPurInwardId},'${fdia}','${fabdesign}','${kdia}','${ll}','${gg}','${gsm}','${kdia}','${buyercode}', '${aliasname}', '${fabcolor}', '${gtFabricpoid}', 
                    '${uom}', ${aGrnQty}, ${taxRate}, '${deliveryItem.poDetId}', '${orderNo}', ${grnQty}, 
                    ${balQty}, ${porate}, ${poQty}, ${deliveryItem.delBags}, ${totalGrnQty}, '${deliveryItem.lotNo}', '${POTYPE}', 
                    TO_DATE('${convertedPoDate}', 'DD-MM-YYYY'), '${TRANSTYPE}', ${excessQty}  )
                `
                console.log(gridSql);
                await connection.execute(gridSql)
                const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                const updatePoDetSql = `
                UPDATE  gtfabricpodet
                SET totalGrnQty = ${accumulatedGrnQty},
                    excessQty = ${excessQty},
                    grnQty = ${substract(accumulatedGrnQty, excessQty)}
                WHERE GTFABRICPODETID = ${deliveryItem.poDetId}
                `
                await connection.execute(updatePoDetSql)
            })
            return Promise.all(promises)
        })()
        connection.commit()
        return res.json({ statusCode: 0, data: gtFabPurInwardId })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: err })
    } finally {
        await connection.close()
    }

}

export async function get(req, res) {
    const connection = await getConnection(res)

    try {
        const { gtCompMastId } = req.query
        const result = await connection.execute(`
        SELECT gtfabpurinward.compname,
        gtfabpurinward.remarks,
        gtfabpurinward.vehno,
        gtfabpurinward.supplier,
        gtfabpurinward.suppdcdate,
        gtfabpurinward.suppdcno,
        gtfabpurinward.fpiDate,
        gtfabpurinward.fpino,
        gtfabpurinward.totalqty,
    
 FROM   gtFabPurInward
 JOIN   gtCompMast ON gtCompMast.compName1 = gtfabpurinward.supplier
 JOIN gtfabpurinwardDet ON gtfabpurinwardDet.gtFabPurInwardId = gtfabpurinward.gtFabPurInwardId
  JOIN gtFabricPo ON gtfabpurinwardDet.poNo = gtFabricPo.gtFabricPoid
JOIN gtfabpurinwardDet ON gtfabpurinwardDet.gtFabPurInwardId = gtfabpurinward.gtFabPurInwardId
 WHERE  gtCompMast.gtCompMastId = :gtCompMastId 
 
    `, { gtCompMastId })
        const resp = result.rows.map(del => ({
            gfPoInwardNo: del[7], compName: del[0], remarks: del[1], vehicleNo: del[2], supplier: del[3], dcDate: del[4], supplierDcNo: del[5],
            gfPoInwardDate: del[6], totalQty: del[8],
        }))
        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}


export async function getDelDetails(req, res) {
    const connection = await getConnection(res)

    try {
        const { fpIno } = req.query
        console.log(fpIno);
        const result = await connection.execute(`
        SELECT
    gtFabricMast.fabAliasName,
    gtColorMast.colorName,
    gtfabpurinwardDet.poNo,
    gtfabpurinwardDet.orderNo,
    gtfabpurinwardDet.totalgrnQty,
    gtfabpurinwardDet.porate,
    gtfabpurinwardDet.balQty,
    gtfabpurinwardDet.poQty,
    gtfabpurinwardDet.lotNo,
    gtfabpurinwardDet.agrnQty,
    gtfabpurinwardDet.gtfabpurinwardDetId,
    gtfabricpodet. gtfabricpodetId
        FROM
    gtfabpurinwardDet
JOIN
    gtFabricMast ON gtFabricMast.gtFabricMastId = gtfabpurinwardDet.aliasNAME
JOIN
    gtColorMast ON gtColorMast.gtColorMastId = gtfabpurinwardDet.COLOR
JOIN
  gtfabricpodet ON gtfabricpodet.GTFABRICPODETID = gtfabpurinwardDet.gtfabpurinwardDetID
JOIN                  
    gtfabpurinward ON gtfabpurinward.gtFabPurInwardId = gtfabpurinwardDet.gtFabPurInwardId
JOIN 
    gtFabricPo ON gtFabricPo.GTFABRICPOID = gtfabricpodet.GTFABRICPOID
WHERE
    gtfabpurinward.fpIno = :fpIno
        `, { fpIno })

        const resp = result.rows.map(del => ({
            fabric: del[0], fabcolor: del[1], poId: del[2], poNo: del[13], orderNo: del[3],
            delQty: del[4], poPrice: del[5], balQty: del[6], poQty: del[7],
            delBags: del[8], lotNo: del[9], aDelQty: del[10], gtfabpurinwardDetId: del[11], poDetId: del[12], delTO: del[14]
        }))

        const result1 = await connection.execute(`
        SELECT
        gtfabpurinward.supplier,
        gtfabpurinward.suppdcdate,
        gtfabpurinward.suppDcNo,
        gtfabpurinward.fpIno,
        gtfabpurinward.fPIDate,
        gtfabpurinward.totalQty,
        gtfabpurinward.gtFabPurInwardId,
        gtfabpurinward.vehNo,
        gtfabpurinward.remarks,
        gtfabpurinward.compName
    FROM
    gtfabpurinward
    JOIN
        gtfabpurinwardDet ON gtfabpurinwardDet.gtFabPurInwardId = gtfabpurinward.gtFabPurInwardId
    WHERE
        gtfabpurinward.fpIno = :fpIno
        `, { fpIno })

        const po = result1.rows[0]
        const poId = resp[0] ? resp[0].poId : ""

        let fromToData = await connection.execute(`
        SELECT
        gtFabricpo.docid AS poNo,
        gtcompmast.phoneno,
        gtcompmast.citystate,
        gtcompmast.compname,
        gtcompmast.pincode,
        gtcompmast.panno,
        gtcompmast.gstno,
        gtcompmast.email,
        gtcompmast.address        
    FROM
        gtFabricpo
    JOIN
        gtcompmast ON gtFabricpo.supplier = gtcompmast.compname1
  
        `)
        fromToData = fromToData.rows[0]
        const delNonGridDetails = {
            supplier: po[0], dcDate: po[1], suppDcNo: po[2], fPoIno: po[3],
            yPoInDate: po[4], totQty: po[5], gtfabpurinward: po[6], vehicleNo: po[7], remarks: po[8], compName: po[9],
            from: {
                phoneNo: fromToData[1], city: fromToData[2].split("|")[0] ? fromToData[2].split("|")[0].trim(" ") : "", state: fromToData[2].split("|")[1] ? fromToData[2].split("|")[1].trim(" ") : "",
                compName: fromToData[3], pinCode: fromToData[4], panNo: fromToData[5], gstNo: fromToData[6], email: fromToData[7], address: fromToData[8]
            },
            to: {
                phoneNo: fromToData[1], city: fromToData[2].split("|")[0] ? fromToData[2].split("|")[0].trim(" ") : "", state: fromToData[2].split("|")[1] ? fromToData[2].split("|")[1].trim(" ") : "",
                compName: fromToData[3], pinCode: fromToData[4], panNo: fromToData[5], gstNo: fromToData[6], email: fromToData[7], address: fromToData[8]
            }
        }
        return res.json({ statusCode: 0, data: { ...delNonGridDetails, deliveryDetails: resp } })
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close()
    }
}
export async function upDate(req, res) {
    const { vehicleNo, remarks, supplierDcDate, supplierDcNo, fabricPoInwardNo, deliveryDetails } = req.body;
    const connection = await getConnection(res);
    try {
        if (!fabricPoInwardNo || !deliveryDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: fabricPoInwardNo , deliveryDetails' });
        }
        if (deliveryDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Delivery Details Cannot be Empty' });
        }
        const TOTALQTY = deliveryDetails.reduce((a, c) => a + parseFloat(c.delQty), 0);

        const nonGridSql = `
            UPDATE gtfabpurinward
            SET vehicleNo = '${vehicleNo}',
                remarks = '${remarks}',
                dcDate = TO_DATE('${supplierDcDate}', 'DD-MM-YYYY'),
                suppDcNo = '${supplierDcNo}',
                totQty = ${TOTALQTY}
            WHERE fpIno= '${fabricPoInwardNo}'
        `;
        const nonGridResult = await connection.execute(nonGridSql);
        const lastRowData = await connection.execute(`
        select gtFabPurInwardId from gtFabPurInward where rowid = '${nonGridResult.lastRowid}'
        `)
        const gtFabPurInwardId = lastRowData.rows[0][0]

        let oldDeliveryDetailsItems = await connection.execute(`SELECT gtfabpurinwarddetid from gtfabpurinwardDET 
        WHERE gtFabPurInwardId = ${gtFabPurInwardId}`)
        oldDeliveryDetailsItems = oldDeliveryDetailsItems.rows.map(item => item[0])

        const newUpdateDeliveryItemsIds = deliveryDetails.filter(item => item?.gtfabpurinwardDetId).map(item => item?.gtfabpurinwardDetId)

        const removedItems = getRemovedItems(oldDeliveryDetailsItems, newUpdateDeliveryItemsIds);

        if (removedItems.length > 0) {
            await connection.execute(`DELETE FROM gtfabpurinwarddet WHERE gtfabpurinwardDETID IN (${removedItems}) `)
        }
        await (async function updateGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {
                const alreadyGrnResult = await connection.execute(`
                    select COALESCE(sum(totalgrnqty),0 ) as alreadyGrnQty 
                    from gtfabpurinwarddet 
                    where gtfabricpodetid = ${deliveryItem.poDetId} and gtFabPurInwardId < ${gtFabPurInwardId}
                    `)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let gtFabricPoDetResult = await connection.execute(`
                    select aliasname, fabcolor, buyercode, uom, fdia, porate, tax, orderno, poQty, noofbags , po.gtFabricpoid, po.docdate
                    from gtfabricpodet det
                    join gtFabricPo po on det.gtfabricpo = po.gtFabricpoid
                    where gtfabricpodetid = ${deliveryItem.poDetId}
                    `)
                const [aliasname, fabcolor, buyercode, uom, fdia, porate, tax, orderNo, poQtytFabricpoid, poDate] = gtFabricPoDetResult.rows[0]
                const taxRate = porate + (porate / 100 * tax)
                const balQty = parseFloat(poQty) - parseFloat(aGrnQty)
                const totalGrnQty = parseFloat(deliveryItem.delQty);
                let grnQty = totalGrnQty;
                let excessQty = 0;
                if (grnQty > balQty) {
                    grnQty = balQty
                    excessQty = totalGrnQty - balQty
                }
                if (deliveryItem?.gtfabpurinwardDetId) {
                    const gridSql = `
                                UPDATE gtfabpurinwardDet
                                SET totalGrnQty = '${totalGrnQty}',
                                grnBags = '${deliveryItem.delBags}',
                                lotNo = '${deliveryItem.lotNo}' 
                                WHERE gtfabpurinwardDetId = '${deliveryItem?.gtfabpurinwardDetId}'
                            `;
                    await connection.execute(gridSql)
                } else {
                    const convertedPoDate = moment(poDate).format("DD-MM-YYYY")
                    const gridSql = `
                INSERT INTO gtfabpurinwardDET (gtfabpurinwardDETID,gtFabPurInwardId,PROCESSNAME,BUYERCODE, ALIASNAME, COLOR, PONO, 
                    UOM,AGRNQTY, TAXRATE, gtfabricpodetid, ORDERNO, GRNQTY, 
                    BALQTY, POPRICE, POQTY, GRNROLLS, TOTALGRNQTY, LOTNO, POTYPE, PODATE, TRANSTYPE, EXCESSQTY)
                    VALUES(supplierseq.nextVal, ${gtFabPurInwardId},'${fdia}','${buyercode}', '${aliasname}', '${fabcolor}', '${gtFabricpoid}', 
                    '${uom}', ${aGrnQty}, ${taxRate}, '${deliveryItem.poDetId}', '${orderNo}', ${grnQty}, 
                    ${balQty}, ${porate}, ${poQty}, ${deliveryItem.delBags}, ${totalGrnQty}, '${deliveryItem.lotNo}', '${POTYPE}', 
                    TO_DATE('${convertedPoDate}', 'DD-MM-YYYY'), '${TRANSTYPE}', ${excessQty}  )
                    `
                    await connection.execute(gridSql)
                }
                const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                const updatePoDetSql = `
                UPDATE GTFABRICPODET 
                SET totalGrnQty = ${accumulatedGrnQty},
                excessQty = ${excessQty},
                grnQty = ${substract(accumulatedGrnQty, excessQty)}
                WHERE gtfabricpodetid = ${deliveryItem.poDetId}
            `
                await connection.execute(updatePoDetSql)
            })
            return Promise.all(promises)
        })()
        connection.commit()
        return res.json({ statusCode: 0, message: "Updated Successfully" })
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close();
    }
}






