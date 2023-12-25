import { getConnection } from "../constants/db.connection.js";
import { getCurrentFinancialYearId } from "../queries/financialYear.js";
import { STOREID, COMPCODE, COMPNAME, PROJECTID, DY_BILL_ENTRY_PTRANSACTION, TCODE, TTYPE, LOCID, POTYPE, TRANSTYPE } from "../constants/defaultQueryValues.js"
import { getNextDyeddYarnPoInwardNo } from "../queries/sequences.js";
import { getSupplierName } from "../queries/supplier.js";
import moment from "moment";
import { getRemovedItems, substract } from "../Helpers/helper.js";

export async function getDocId(req, res) {
    const connection = await getConnection(res)
    const yPoIno = await getNextDyeddYarnPoInwardNo(connection);
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
        const YPOINO = await getNextDyeddYarnPoInwardNo(connection);
        const SUPPLIER = await getSupplierName(connection, gtCompMastId);
        const nonGridSql = `
        INSERT INTO GTdYarnPoINWARD (GTdYarnPoINWARDID, STOREDID, FINYEAR, COMPCODE, TCODE, TTYPE, PTRANSACTION, COMPNAME,REMARKS, VEHICLENO, LOCID, SUPPLIER, DCDATE, SUPPDCNO, YPOINDATE, YPOINO,PROJECTID) 
        VALUES ( supplierseq.nextVal, '${STOREID}', '${FINYEAR}' , '${COMPCODE}' , '${TCODE}' , '${TTYPE}' , '${DY_BILL_ENTRY_PTRANSACTION}' , '${COMPNAME}' ,'${REMARKS}' ,
             '${VEHICLENO}' , '${LOCID}' , '${SUPPLIER}', TO_DATE('${DCDATE}', 'DD/MM/YY'), '${SUPPDCNO}', TO_DATE('${YPOINDATE}','DD/MM/YY'), '${YPOINO}',
             '${PROJECTID}')
        `
        const nonGridResult = await connection.execute(nonGridSql)
        const lastRowData = await connection.execute(`
        select gtdYarnPoinwardid from gtdYarnPoinward where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTdYarnPoINWARDID = lastRowData.rows[0][0]
        await (async function createGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {

                let gtdYarnPoDetResult = await connection.execute(`
                select yarnname, color, buyercode, uom, processname, price, tax, orderno, poQty, noofbags , po.gtdYarnPoid, po.docdate,
                totalgrnqty
                from gtdYarnPodet det
                join gtdYarnPo po on det.GTdYarnPoID = po.gtdYarnPoid 
                    where gtdYarnPodetid = ${deliveryItem.poDetId}
                `)

                const [yarnname, color, buyercode, uom, processname, price, tax, orderNo, poQty, poBags, gtdYarnPoid, poDate, aGrnQty] = gtdYarnPoDetResult.rows[0]
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
                INSERT INTO GTdYarnPoINWARDDET (GTdYarnPoINWARDDETID,GTdYarnPoINWARDID,YARNPROCESS,BUYERCODE, YARNNAME, COLORNAME, PONO, 
                    UOM, TAXRATE, GTdYarnPoDETID, ORDERNO, GRNQTY, 
                    BALQTY, POPRICE, POQTY, GRNBAGS, TOTALGRNQTY, LOTNO, POBAGS, POTYPE, PODATE, TRANSTYPE, EXCESSQTY)
                    VALUES(supplierseq.nextVal, ${GTdYarnPoINWARDID},'${processname}','${buyercode}', '${yarnname}', '${color}', '${gtdYarnPoid}', 
                    '${uom}',  ${taxRate}, '${deliveryItem.poDetId}', '${orderNo}', ${grnQty}, 
                    ${balQty}, ${price}, ${poQty}, ${deliveryItem.delBags}, ${totalGrnQty},'${deliveryItem.lotNo}', ${poBags}, '${POTYPE}', 
                    TO_DATE('${convertedPoDate}', 'DD-MM-YYYY'), '${TRANSTYPE}', ${excessQty}  )
               `
                console.log(gridSql)
                await connection.execute(gridSql)


            })
            return Promise.all(promises)
        })()
        connection.commit()
        return res.json({ statusCode: 0, data: GTdYarnPoINWARDID })
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
        SELECT gtaccPoInward.compName,
        gtaccPoInward.remarks,
        gtaccPoInward.vehicleNo,
        gtaccPoInward.supplier,
        gtaccPoInward.suppdcDate,
        gtaccPoInward.suppdcno,
        gtaccPoInward.agrnDate,
        gtaccPoInward.agrnNo
 FROM   gtaccPoInward
 JOIN   gtCompMast ON gtCompMast.compName1 = gtaccPoInward.supplier
 JOIN gtaccPoInwardDtl ON gtaccPoInwardDtl.gtaccPoInwardId = gtaccPoInward.gtaccPoInwardId
  JOIN  gtaccPo ON gtaccPoInwardDtl.poNo = gtaccPo.gtaccPoid
  WHERE  gtCompMast.gtCompMastId = :gtCompMastId 
 
    `, { gtCompMastId })
        const resp = result.rows.map(del => ({
            dYarnPoInwardNo: del[7], compName: del[0], remarks: del[1], vehicleNo: del[2], supplier: del[3], dcDate: del[4], supplierDcNo: del[5],
            yPoInwardDate: del[6]
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
        const { aGrnNo } = req.query
        const result = await connection.execute(`
        SELECT
        gtaccpoDet.gtaccpoDetId,
        gtaccmast.accname,
        gtColorMast.colorName,
        gtProcessMast.processName,
        gtsizeMast.sizeName,
        gtaccGrpMast.accGrp,
        gtaccpoInwardDtl.agrnQty,
        gtaccpoInwardDtl.balQty, 
        gtaccpoInwardDtl.totalgrnQty,
        gtaccpoInwardDtl.grnQty,
        gtaccpoInwardDtl.excessQty,
        gtaccpoInwardDtl.gtaccpoInwardDtlId,
        gtaccpoInwardDtl.poDate,
        gtaccpoInwardDtl.OrderNo,
        gtaccpoInwardDtl.poNo,
        gtaccPoInward.agrnNo
    FROM
        gtaccpoInwardDtl
    JOIN gtaccmast ON gtaccmast.gtaccmastId = gtaccpoInwardDtl.ACCNAME
    JOIN gtColorMast ON gtColorMast.gtColorMastId = gtaccpoInwardDtl.ACCCOLOR
    JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtaccpoInwardDtl.PURCHTYPE
    JOIN gtaccpoDet ON gtaccpoDet.gtaccpoDetId = gtaccpoInwardDtl.gtaccpoDetId
    JOIN gtsizeMast ON gtsizeMast.gtsizeMastId = gtaccpoInwardDtl.accSize
    JOIN gtAccGrpMast ON gtAccGrpMast.gtAccGrpMastId = gtaccpoInwardDtl.accGrp
    JOIN gtaccPoInward On gtaccPoInward.gtaccPoInwardId = gtaccPoInwardDtl.gtaccPoInwardId
    where gtaccPoInward.agrnNo = :agrnNo
    
        `, { aGrnNo })

        const resp = result.rows.map(det => ({
            gtaccpoDetId: det[0], accname: det[1], color: det[2], processName: det[3], sizeName: det[4],
            accGrp: det[5],agrnQty: det[6],balQty: det[7],totalgrnQty: det[8],
            grnQty: det[9],excessQty: det[10],gtaccpoInwardDtlId: det[11],poDate: det[12],OrderNo: det[13],poNo: det[14],aGrnNo: det[14] 
            }))
        console.log(resp)
        const result1 = await connection.execute(`

        SELECT gtaccPoInward.compName,
        gtaccPoInward.remarks,
        gtaccPoInward.vehicleNo,
        gtaccPoInward.supplier,
        gtaccPoInward.suppdcDate,
        gtaccPoInward.suppdcno,
        gtaccPoInward.agrnDate,
        gtaccPoInward.agrnNo
 FROM   gtaccPoInward
 JOIN   gtCompMast ON gtCompMast.compName1 = gtaccPoInward.supplier
 JOIN   gtaccPoInwardDtl ON gtaccPoInwardDtl.gtaccPoInwardId = gtaccPoInward.gtaccPoInwardId
 JOIN   gtaccPo ON gtaccPoInwardDtl.poNo = gtaccPo.gtaccPoid 
 WHERE  gtaccPoInward.aGrnNo = :aGrnNo
        `, { aGrnNo })
        const po = result1.rows[0]
        const poId = resp[0] ? resp[0].poNo : ""
        const sql = `
        SELECT
        gtdYarnPo.docid AS poNo,
        gtcompmast.phoneno,
        gtcompmast.citystate,
        gtcompmast.compname,
        gtcompmast.pincode,
        gtcompmast.panno,
        gtcompmast.gstno,
        gtcompmast.email,   
        gtcompmast.address
    FROM
        gtdYarnPo
    JOIN
        gtcompmast ON gtdYarnPo.supplier = gtcompmast.compname1
    WHERE
        gtdYarnPo.gtdYarnPoid = ${poNo}
        `
        console.log(sql)
        let fromToData = await connection.execute(sql)
        fromToData = fromToData.rows[0]
        const delNonGridDetails = {
            supplier: po[0], dcDate: po[1], suppDcNo: po[2], yPoIno: po[3],
            yPoInDate: po[4], totQty: po[5], gtaccPoInward: po[6], vehicleNo: po[7], remarks: po[8], compName: po[9],
            from: {
                phoneNo: fromToData[1], city: fromToData[2].split("|")[0] ? fromToData[2].split("|")[0].trim(" ") : "", state: fromToData[2].split("|")[1] ? fromToData[2].split("|")[1].trim(" ") : "",
                compName: fromToData[3], pinCode: fromToData[4], panNo: fromToData[5], gstNo: fromToData[6], email: fromToData[7], address: fromToData[8]
            },

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
            return res.json({ statusCode: 1, message: 'Required Fields: YarnPoInwardNo , deliveryDetails' });
        }
        if (deliveryDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Delivery Details Cannot be Empty' });
        }
        const nonGridSql = `
            UPDATE gtdYarnPoInWard
            SET vehicleNo = '${vehicleNo}',
            remarks = '${remarks}',
            dcDate = TO_DATE('${supplierDcDate}', 'DD-MM-YYYY'),
            suppDcNo = '${supplierDcNo}'
            WHERE ypoIno= '${yarnPoInwardNo}'
        `;
        // const nonGridResult = {}  ;
        console.log(nonGridSql)
        const nonGridResult = await connection.execute(nonGridSql);
        const lastRowData = await connection.execute(`
        select gtdYarnPoinwardid from gtdYarnPoinward where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTdYarnPoINWARDID = lastRowData.rows[0][0]

        let oldDeliveryDetailsItems = await connection.execute(`SELECT gtdYarnPoinwarddetid from GTdYarnPoINWARDDET 
        WHERE gtdYarnPoinwardid = ${GTdYarnPoINWARDID}`)
   
        oldDeliveryDetailsItems = oldDeliveryDetailsItems.rows.map(item => item[0])
        console.log(oldDeliveryDetailsItems,'oldDeliveryDetailsItems')


        const newUpdateDeliveryItemsIds = deliveryDetails.filter(item => item?.gtaccPoInwardDetId).map(item => item?.gtaccPoInwardDetId)
        console.log(newUpdateDeliveryItemsIds,'newUpdateDeliveryItemsIds')

        const removedItems = getRemovedItems(oldDeliveryDetailsItems, newUpdateDeliveryItemsIds);
   console.log(GTdYarnPoINWARDID,'GTdYarnPoINWARDID')
        if (removedItems.length > 0) {
            await connection.execute(`DELETE FROM gtdYarnPoinwarddet WHERE GTdYarnPoINWARDDETID IN (${removedItems}) `)
        }
        await (async function updateGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {
                const alreadyGrnResult = await connection.execute(`
                    select COALESCE(sum(totalgrnqty),0 ) as alreadyGrnQty 
                    from gtdYarnPoinwarddet 
                    where GTdYarnPoDETID = ${deliveryItem.poDetId} and GTdYarnPoINWARDID < ${GTdYarnPoINWARDID}
                    `)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let gtdYarnPoDetResult = await connection.execute(`
                    select yarnname, color, buyercode, uom, processname, price, tax, orderno, poQty, noofbags , po.gtdYarnPoid, po.docdate
                    from gtdYarnPodet det
                    join gtdYarnPo po on det.GTdYarnPoID = po.gtdYarnPoid
                    where gtdYarnPodetid = ${deliveryItem.poDetId}
                    `)
                const [yarnname, color, buyercode, uom, processname, price, tax, orderNo, poQty, poBags, gtdYarnPoid, poDate] = gtdYarnPoDetResult.rows[0]
                const taxRate = price + (price / 100 * tax)
                const balQty = parseFloat(poQty) - parseFloat(aGrnQty)
                const totalGrnQty = parseFloat(deliveryItem.delQty);
                let grnQty = totalGrnQty;
                let excessQty = 0;
                if (grnQty > balQty) {
                    grnQty = balQty
                    excessQty = totalGrnQty - balQty
                }
                if (deliveryItem?.gtaccPoInwardDetId) {
                    const gridSql = `
                                UPDATE gtaccPoInwardDet
                                SET totalGrnQty = '${totalGrnQty}',
                                grnBags = '${deliveryItem.delBags}',
                                lotNo = '${deliveryItem.lotNo}' 
                                WHERE gtaccPoInwardDetId = '${deliveryItem?.gtaccPoInwardDetId}'
                            `;
                    await connection.execute(gridSql)
                } else {
                    const convertedPoDate = moment(poDate).format("DD-MM-YYYY")
                    const gridSql = `
                INSERT INTO GTdYarnPoINWARDDET (GTdYarnPoINWARDDETID,GTdYarnPoINWARDID,YARNPROCESS,BUYERCODE, YARNNAME, COLORNAME, PONO, 
                    UOM,AGRNQTY, TAXRATE, GTdYarnPoDETID, ORDERNO, GRNQTY, 
                    BALQTY, POPRICE, POQTY, GRNBAGS, TOTALGRNQTY, LOTNO, POBAGS, POTYPE, PODATE, TRANSTYPE, EXCESSQTY)
                    VALUES(supplierseq.nextVal, ${GTdYarnPoINWARDID},'${processname}','${buyercode}', '${yarnname}', '${color}', '${gtdYarnPoid}', 
                    '${uom}', ${aGrnQty}, ${taxRate}, '${deliveryItem.poDetId}', '${orderNo}', ${grnQty}, 
                    ${balQty}, ${price}, ${poQty}, ${deliveryItem.delBags}, ${totalGrnQty}, '${deliveryItem.lotNo}', ${poBags}, '${POTYPE}', 
                    TO_DATE('${convertedPoDate}', 'DD-MM-YYYY'), '${TRANSTYPE}', ${excessQty}  )
                    `
                    await connection.execute(gridSql)
                    const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                    const updatePoDetSql = `
                    UPDATE GTdYarnPoDET 
                    SET totalGrnQty = ${accumulatedGrnQty},
                    excessQty = ${excessQty},
                    grnQty = ${substract(accumulatedGrnQty, excessQty)}
                    WHERE GTdYarnPoDETID = ${deliveryItem.poDetId}
                `
                    await connection.execute(updatePoDetSql)
                }
            })
            return Promise.all(promises)
        })()
        await connection.commit()
        return res.json({ statusCode: 0, message: "Updated Successfully" })
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close();
    }
}






