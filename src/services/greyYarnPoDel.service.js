import { getConnection } from "../constants/db.connection.js";
import { getCurrentFinancialYearId } from "../queries/financialYear.js";
import { STOREID, COMPCODE, COMPNAME, PROJECTID, GY_INWARD_PTRANSACTION, TCODE, TTYPE, LOCID, POTYPE, TRANSTYPE } from "../constants/defaultQueryValues.js"
import { getNextGreyYarnPoInwardNo } from "../queries/sequences.js";
import { getSupplierName } from "../queries/supplier.js";
import moment from "moment";
import { getRemovedItems, substract } from "../Helpers/helper.js";

export async function getDocId(req, res) {
    const connection = await getConnection(res)
    const yPoIno = await getNextGreyYarnPoInwardNo(connection);
    connection.close()
    return res.json({ statusCode: 0, docId: yPoIno })
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
        const YPOINDATE = moment(new Date()).format("DD-MM-YYYY");
        const FINYEAR = await getCurrentFinancialYearId(connection);
        const YPOINO = await getNextGreyYarnPoInwardNo(connection);
        const SUPPLIER = await getSupplierName(connection, gtCompMastId);
        const TOTALQTY = deliveryDetails.reduce((a, c) => a + parseFloat(c.delQty), 0);
        const nonGridSql = `
        INSERT INTO GTYARNPOINWARD (GTYARNPOINWARDID, STOREDID, FINYEAR, COMPCODE, TCODE, TTYPE, PTRANSACTION, COMPNAME,REMARKS, VEHICLENO, LOCID, SUPPLIER, DCDATE, SUPPDCNO, YPOINDATE, YPOINO,PROJECTID,TOTQTY, ENTRYTYPE ) 
        VALUES ( supplierseq.nextVal, '${STOREID}', '${FINYEAR}' , '${COMPCODE}' , '${TCODE}' , '${TTYPE}' , '${GY_INWARD_PTRANSACTION}' , '${COMPNAME}' ,'${REMARKS}' ,
             '${VEHICLENO}' , '${LOCID}' , '${SUPPLIER}', TO_DATE('${DCDATE}', 'DD/MM/YY'), '${SUPPDCNO}', TO_DATE('${YPOINDATE}','DD/MM/YY'), '${YPOINO}',
             '${PROJECTID}','${TOTALQTY}', 'SP')
        `;
      
        const nonGridResult = await connection.execute(nonGridSql)
        const lastRowData = await connection.execute(`
        select gtyarnpoinwardid from gtyarnpoinward where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTYARNPOINWARDID = lastRowData.rows[0][0]
        await (async function createGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {
          
                let gtYarnPoDetResult = await connection.execute(`
                select yarnname, color, buyercode, uom, processname, price, tax, orderno, poQty, noofbags , po.gtyarnpoid, po.docdate,
                totalgrnqty
                from gtyarnpodet det
                join gtYarnPo po on det.GTYARNPOID = po.gtyarnpoid
                    where gtyarnpodetid = ${deliveryItem.poDetId}
                `)
                const [yarnname, color, buyercode, uom, processname, price, tax, orderNo, poQty, poBags, gtyarnpoid, poDate, aGrnQty] = gtYarnPoDetResult.rows[0]
                const taxRate = price + (price / 100 * tax)
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
                INSERT INTO GTYARNPOINWARDDET (GTYARNPOINWARDDETID,GTYARNPOINWARDID,YARNPROCESS,BUYERCODE, YARNNAME, COLORNAME, PONO, 
                    UOM,AGRNQTY, TAXRATE, GTYARNPODETID, ORDERNO, GRNQTY, 
                    BALQTY, POPRICE, POQTY, GRNBAGS, TOTALGRNQTY, LOTNO, POBAGS, POTYPE, PODATE, TRANSTYPE, EXCESSQTY)
                    VALUES(supplierseq.nextVal, ${GTYARNPOINWARDID},'${processname}','${buyercode}', '${yarnname}', '${color}', '${gtyarnpoid}', 
                    '${uom}', ${aGrnQty}, ${taxRate}, '${deliveryItem.poDetId}', '${orderNo}', ${grnQty}, 
                    ${balQty}, ${price}, ${poQty}, ${deliveryItem.delBags}, ${totalGrnQty}, '${deliveryItem.lotNo}', ${poBags}, '${POTYPE}', 
                    TO_DATE('${convertedPoDate}', 'DD-MM-YYYY'), '${TRANSTYPE}', ${excessQty}  )
                `
                console.log(gridSql);
                await connection.execute(gridSql)
                const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                const updatePoDetSql = `
                UPDATE GTYARNPODET 
                SET totalGrnQty = ${accumulatedGrnQty},
                    excessQty = ${excessQty},
                    grnQty = ${substract(accumulatedGrnQty, excessQty)}
                WHERE GTYARNPODETID = ${deliveryItem.poDetId}
                `
                await connection.execute(updatePoDetSql)
            })
            return Promise.all(promises)
        })()
        connection.commit()
        return res.json({ statusCode: 0, data: GTYARNPOINWARDID })
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
        SELECT gtYarnPoInward.compname,
        gtYarnPoInward.remarks,
        gtYarnPoInward.vehicleno,
        gtYarnPoInward.supplier,
        gtYarnPoInward.dcdate,
        gtYarnPoInward.suppdcno,
        gtYarnPoInward.ypoinDate,
        gtYarnPoInward.ypoino,
        gtYarnPoInward.totqty,
        gtYarnPo.delTo
 FROM   GTYARNPOINWARD
 JOIN   gtCompMast ON gtCompMast.compName1 = gtYarnPoInward.supplier
 JOIN gtYarnpoInwardDet ON gtYarnpoInwardDet.gtYarnpoInwardId = gtYarnpoInward.gtYarnpoInwardId
  JOIN gtYarnPo ON gtYarnPoInwardDet.poNo = gtYarnPo.gtYarnPoid
JOIN gtYarnPoInwardDet ON gtYarnPoInwardDet.gtYarnPoInwardId = gtYarnPoInward.gtYarnPoInwardId
 WHERE  gtCompMast.gtCompMastId = :gtCompMastId and gtYarnPoInward.ENTRYTYPE = 'SP'
 
    `, { gtCompMastId })
        console.log(result.rows, "result")
        const resp = result.rows.map(del => ({
            yarnPoInwardNo: del[7], compName: del[0], remarks: del[1], vehicleNo: del[2], supplier: del[3], dcDate: del[4], supplierDcNo: del[5],
            yPoInwardDate: del[6], totalQty: del[8], delTo: del[9]
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
        const { ypoIno } = req.query
        console.log(ypoIno,"ypoIno")
        const result = await connection.execute(`
        SELECT
    gtYarnMaster.yarnName,
    gtColorMast.colorName,
    gtyarnPoInwardDet.poNo,
    gtyarnPoInwardDet.orderNo,
    gtyarnPoInwardDet.totalgrnQty,
    gtyarnPoInwardDet.poPrice,
    gtyarnPoInwardDet.balQty,
    gtyarnPoInwardDet.poQty,
    gtyarnPoInwardDet.grnBags,
    gtyarnPoInwardDet.lotNo,
    gtyarnPoInwardDet.agrnQty,
    gtyarnPoInwardDet.gtyarnPoInWardDetId,
    gtYarnPoDet.gtYarnpoDetId,
    gtYarnPo.docid,poBags,
    gtYarnPo.delTO
   
        FROM
    gtyarnPoInwardDet
JOIN
    gtYarnMaster ON gtYarnMaster.gtYarnMasterId = gtyarnPoInwardDet.YARNNAME
JOIN
    gtColorMast ON gtColorMast.gtColorMastId = gtyarnPoInwardDet.COLORNAME
JOIN
    gtYarnPoDet ON gtYarnPoDet.GTYARNPODETID = gtyarnPoInwardDet.GTYARNPODETID
JOIN                  
    gtYarnPoInward ON gtYarnPoInward.gtYarnPoInwardId = gtyarnPoInwardDet.gtYarnPoInwardId
JOIN 
    gtYarnPo ON gtYarnPo.GTYARNPOID = gtYarnPoDet.GTYARNPOID
WHERE
    gtYarnPoInward.ypoIno = :ypoIno
        `, { ypoIno })

        const resp = result.rows.map(del => ({
            yarn: del[0], color: del[1], poId: del[2], poNo: del[13], orderNo: del[3],
            delQty: del[4], poPrice: del[5], balQty: del[6], poQty: del[7],
            delBags: del[8], lotNo: del[9], aDelQty: del[10], gtyarnPoInwardDetId: del[11], poDetId: del[12], poBags: del[14], delTO: del[15]
        }))

        const result1 = await connection.execute(`
        SELECT
        gtYarnPoInward.supplier,
        gtYarnPoInward.dcdate,
        gtYarnPoInward.suppDcNo,
        gtYarnPoInward.ypoIno,
        gtYarnPoInward.yPoInDate,
        gtYarnPoInward.totQty,
        gtYarnPoInward.gtYarnPoInwardId,
        gtYarnPoInward.vehicleNo,
        gtYarnPoInward.remarks,
        gtYarnPoInward.compName
    FROM
        gtYarnPoInward
    JOIN
        gtYarnPoInwardDet ON gtYarnPoInwardDet.gtYarnPoInwardId = gtYarnPoInward.gtYarnPoInwardId
    WHERE
        gtYarnPoInward.ypoIno = :ypoIno
        `, { ypoIno })

        const po = result1.rows[0]
        const poId = resp[0] ? resp[0].poId : ""
           console.log(poId,"poidyarnnn",resp[0],"respppyarn")
        let fromToData = await connection.execute(`
        SELECT
        gtyarnpo.docid AS poNo,
        gtcompmast.phoneno,
        gtcompmast.citystate,
        gtcompmast.compname,
        gtcompmast.pincode,
        gtcompmast.panno,
        gtcompmast.gstno,
        gtcompmast.email,
        gtcompmast.address,
        c.phoneno,
        c.citystate,
        c.compname1 AS delto,
        c.pincode,
        c.panno,
        c.gstno,
        c.email, 
        c.address
        
    FROM
        gtyarnpo
    JOIN
        gtcompmast ON gtyarnpo.supplier = gtcompmast.compname1
    JOIN
        gtcompmast c ON gtyarnpo.delto = c.compname1
    WHERE
    gtyarnpo.gtyarnpoid = ${poId}
        `)
        fromToData = fromToData.rows[0]
        const delNonGridDetails = {
            supplier: po[0], dcDate: po[1], suppDcNo: po[2], yPoIno: po[3],
            yPoInDate: po[4], totQty: po[5], gtYarnPoInward: po[6], vehicleNo: po[7], remarks: po[8], compName: po[9],
            from: {
                phoneNo: fromToData[1], city: fromToData[2].split("|")[0] ? fromToData[2].split("|")[0].trim(" ") : "", state: fromToData[2].split("|")[1] ? fromToData[2].split("|")[1].trim(" ") : "",
                compName: fromToData[3], pinCode: fromToData[4], panNo: fromToData[5], gstNo: fromToData[6], email: fromToData[7], address: fromToData[8]
            },
            to: {
                phoneNo: fromToData[9], city: fromToData[10].split("|")[0] ? fromToData[10].split("|")[0].trim(" ") : "", state: fromToData[10].split("|")[1] ? fromToData[10].split("|")[1].trim(" ") : "", compName: fromToData[11],
                pinCode: fromToData[12], panNo: fromToData[13], gstNo: fromToData[14], email: fromToData[15], address: fromToData[16]
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
    const { vehicleNo, remarks, supplierDcDate, supplierDcNo, yarnPoInwardNo, deliveryDetails } = req.body;
    const connection = await getConnection(res);
    try {
        if (!yarnPoInwardNo || !deliveryDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: yarnPoInwardNo , deliveryDetails' });
        }
        if (deliveryDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Delivery Details Cannot be Empty' });
        }
        const TOTALQTY = deliveryDetails.reduce((a, c) => a + parseFloat(c.delQty), 0);

        const nonGridSql = `
            UPDATE gtYarnPoInWard
            SET vehicleNo = '${vehicleNo}',
                remarks = '${remarks}',
                dcDate = TO_DATE('${supplierDcDate}', 'DD-MM-YYYY'),
                suppDcNo = '${supplierDcNo}',
                totQty = ${TOTALQTY}
            WHERE ypoIno= '${yarnPoInwardNo}'
        `;
        console.log(nonGridSql,"nonGridSql")
        const nonGridResult = await connection.execute(nonGridSql);
        const lastRowData = await connection.execute(`
        select gtyarnpoinwardid from gtyarnpoinward where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTYARNPOINWARDID = lastRowData.rows[0][0]

        let oldDeliveryDetailsItems = await connection.execute(`SELECT gtyarnpoinwarddetid from GTYARNPOINWARDDET 
        WHERE gtyarnpoinwardid = ${GTYARNPOINWARDID}`)
        oldDeliveryDetailsItems = oldDeliveryDetailsItems.rows.map(item => item[0])

        const newUpdateDeliveryItemsIds = deliveryDetails.filter(item => item?.gtYarnPoInwardDetId).map(item => item?.gtYarnPoInwardDetId)

        const removedItems = getRemovedItems(oldDeliveryDetailsItems, newUpdateDeliveryItemsIds);

        if (removedItems.length > 0) {
            await connection.execute(`DELETE FROM gtyarnpoinwarddet WHERE GTYARNPOINWARDDETID IN (${removedItems}) `)
        }
        await (async function updateGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {
                const alreadyGrnResult = await connection.execute(`
                    select COALESCE(sum(totalgrnqty),0 ) as alreadyGrnQty 
                    from gtyarnpoinwarddet 
                    where GTYARNPODETID = ${deliveryItem.poDetId} and GTYARNPOINWARDID < ${GTYARNPOINWARDID}
                    `)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let gtYarnPoDetResult = await connection.execute(`
                    select yarnname, color, buyercode, uom, processname, price, tax, orderno, poQty, noofbags , po.gtyarnpoid, po.docdate
                    from gtyarnpodet det
                    join gtYarnPo po on det.GTYARNPOID = po.gtyarnpoid
                    where gtyarnpodetid = ${deliveryItem.poDetId}
                    `)
                const [yarnname, color, buyercode, uom, processname, price, tax, orderNo, poQty, poBags, gtyarnpoid, poDate] = gtYarnPoDetResult.rows[0]
                const taxRate = price + (price / 100 * tax)
                const balQty = parseFloat(poQty) - parseFloat(aGrnQty)
                const totalGrnQty = parseFloat(deliveryItem.delQty);
                let grnQty = totalGrnQty;
                let excessQty = 0;
                if (grnQty > balQty) {
                    grnQty = balQty
                    excessQty = totalGrnQty - balQty
                }
                if (deliveryItem?.gtYarnPoInwardDetId) {
                    const gridSql = `
                                UPDATE gtYarnPoInwardDet
                                SET totalGrnQty = '${totalGrnQty}',
                                grnBags = '${deliveryItem.delBags}',
                                lotNo = '${deliveryItem.lotNo}' 
                                WHERE gtYarnPoInwardDetId = '${deliveryItem?.gtYarnPoInwardDetId}'
                            `;
                    await connection.execute(gridSql)
                } else {
                    const convertedPoDate = moment(poDate).format("DD-MM-YYYY")
                    const gridSql = `
                INSERT INTO GTYARNPOINWARDDET (GTYARNPOINWARDDETID,GTYARNPOINWARDID,YARNPROCESS,BUYERCODE, YARNNAME, COLORNAME, PONO, 
                    UOM,AGRNQTY, TAXRATE, GTYARNPODETID, ORDERNO, GRNQTY, 
                    BALQTY, POPRICE, POQTY, GRNBAGS, TOTALGRNQTY, LOTNO, POBAGS, POTYPE, PODATE, TRANSTYPE, EXCESSQTY)
                    VALUES(supplierseq.nextVal, ${GTYARNPOINWARDID},'${processname}','${buyercode}', '${yarnname}', '${color}', '${gtyarnpoid}', 
                    '${uom}', ${aGrnQty}, ${taxRate}, '${deliveryItem.poDetId}', '${orderNo}', ${grnQty}, 
                    ${balQty}, ${price}, ${poQty}, ${deliveryItem.delBags}, ${totalGrnQty}, '${deliveryItem.lotNo}', ${poBags}, '${POTYPE}', 
                    TO_DATE('${convertedPoDate}', 'DD-MM-YYYY'), '${TRANSTYPE}', ${excessQty}  )
                    `
                    await connection.execute(gridSql)
                }
                const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                const updatePoDetSql = `
                UPDATE GTYARNPODET 
                SET totalGrnQty = ${accumulatedGrnQty},
                excessQty = ${excessQty},
                grnQty = ${substract(accumulatedGrnQty, excessQty)}
                WHERE GTYARNPODETID = ${deliveryItem.poDetId}
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






