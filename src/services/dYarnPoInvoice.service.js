import { getConnection } from "../constants/db.connection.js"
import { getCurrentFinancialYearId } from "../queries/financialYear.js";
import { COMPCODE, PROJECTID, POTYPE, TRANSTYPE, TAXTEMP, DY_BILL_ENTRY_PTRANSACTION } from "../constants/defaultQueryValues.js"
import { getSupplierName } from "../queries/supplier.js";
import { getNextDyedYarnPoInvoiceNo } from "../queries/sequences.js";
import { partyState } from "../queries/supplier.js";
import { getRemovedItems } from "../Helpers/helper.js";

export async function getDocId(req, res) {
    const connection = await getConnection(res)
    const yPoIno = await getNextDyedYarnPoInvoiceNo(connection);
    connection.close()
    return res.json({ statusCode: 0, docId: yPoIno })
}
async function createTaxGridDetails(connection, taxGridDetails, gtdypBillEntryID) {
    const promises = taxGridDetails.map(async (tax) => {
        const taxCreate = `INSERT INTO gtdypbillentrytaxdet 
        (gtdypBillEntryTAXDETID,gtdypBillEntryID,NOTES1,
        SF,TAX1,
        REGISTERVALUE,ADVALUE,ADTEMPRND,ADSUGGESTIVE,ADFORMULA,ADID,
        ADORDER, ADPORM,ADNAME,gtDypBillEntryTAXDETROW)
        VALUES (supplierseq.nextVal,'${gtdypBillEntryID}', '${tax.notes}',
        '${tax.sf}', '${tax.numId}', 
        '${tax.adId === "RND" ? 0 : 1}', '${tax.adValue}', '${tax.adValue}', '${tax.adSuggestive}', '${tax.adFormula}', '${tax.adId}',
        0, '${tax.adPorm}','${tax.adType}', '${tax.gtAdddedDetailRow}' )`
        return await connection.execute(taxCreate)
    })
    return Promise.all(promises)
}
async function deleteTaxGridDetails(connection, gtDypBillEntryID) {
    return await connection.execute(`DELETE FROM gtdypbillentrytaxdet WHERE gtDypBillEntryID=${gtDypBillEntryID}`)
}

async function getTaxGridDetails(connection, gtDypBillEntryID) {
    const sql = `select sf, notes1, adname, adformula, adid, adporm, adsuggestive,gtDypBillEntryTAXDETROW, advalue,TAX1 FROM gtdypbillentrytaxdet where gtdypbillentryid = ${gtDypBillEntryID}`
    let result = await connection.execute(sql);
    result = result.rows.map(i => ({ sf: i[0], notes: i[1], adType: i[2], adFormula: i[3], adId: i[4], adPorm: i[5], adSuggestive: i[6], gtAdddedDetailRow: i[7], adValue: i[8], numId: i[9] }))
    return result
}

export async function create(req, res) {
    const connection = await getConnection(res)
    const { supplierId: gtCompMastId, remarks: REMARKS, netAmount: NETAMT, netBillValue: NETBILLVALUE, partyBillNo,
        partyBillDate: PARTYBILLDATE, invoiceDetails, taxGridDetails } = req.body;
    try {
        if (!gtCompMastId || !invoiceDetails || !taxGridDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: supplierId, invoiceDetails, taxGridDetails' });
        }
        if (invoiceDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Invoice Details Cannot be Empty' });
        }
        if (taxGridDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Tax Details Cannot be Empty' });
        }
        const FINYR = await getCurrentFinancialYearId(connection);
        const SUPPLIER = await getSupplierName(connection, gtCompMastId);
        const TOTALQTY = invoiceDetails.reduce((a, c) => a + parseFloat(c.billQty), 0);
        const GROSSAMT = invoiceDetails.reduce((a, c) => a + parseFloat(c.billQty * c.billRate), 0);
        const DOCID = await getNextDyedYarnPoInvoiceNo(connection)
        const PARTYSTATE = await partyState(connection, gtCompMastId)
        const nonGridSql =
            `INSERT INTO gtDypBillEntry(gtDypBillEntryID,TAXTEMP,FINYR,COMPCODE,NETAMT,REMARKS,GROSSAMT,TOTALQTY,NETBILLVALUE,
            PARTYBILLDATE,PARTYBILLNO,PARTYSTATE,SUPPLIER,PTRANSACTION,DOCDATE,DOCID,PROJECTID)
            VALUES ( supplierseq.nextVal,'${TAXTEMP}','${FINYR}','${COMPCODE}','${NETBILLVALUE}','${REMARKS}','${GROSSAMT}','${TOTALQTY}','${NETBILLVALUE}',
            TO_DATE('${PARTYBILLDATE}', 'DD/MM/YY'),'${partyBillNo}','${PARTYSTATE}','${SUPPLIER}','${DY_BILL_ENTRY_PTRANSACTION}', TO_DATE(CURRENT_DATE, 'DD/MM/YY'),'${DOCID}','${PROJECTID}')`
        
            const nonGridResult = await connection.execute(nonGridSql)
        const lastRowData = await connection.execute(`
        select gtDypBillEntryID from gtDypBillEntry where rowid = '${nonGridResult.lastRowid}'
        `)
        const gtDypBillEntryID = lastRowData.rows[0][0]
        await createTaxGridDetails(connection, taxGridDetails, gtDypBillEntryID)
        await (async function createGridDetails() {
            const promises = invoiceDetails.map(async (billItem) => {
                let aGrnSql = `
                select sum(totalgrnqty) as alreadyGrnQty from gtdyarnpoinwarddet 
                where GTDYARNPODETID = ${billItem.poDetId}
                `
                const alreadyGrnResult = await connection.execute(aGrnSql)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                console.log(aGrnQty,'aGrnQty')
                let aBillQtySql = `
                select sum(billQty) from gtDypBillEntryDET 
                where DETAILID = ${billItem.poDetId}
                `
                const alreadyBillQtyResult = await connection.execute(aBillQtySql)
                const aBillQty = alreadyBillQtyResult.rows[0][0] ? alreadyBillQtyResult.rows[0][0] : 0
              console.log(billItem.billQty,'billItem.billQty')
                const balQty = parseFloat(aGrnQty) - parseFloat(billItem.billQty)
                console.log(balQty,'balQty')

                const billAmount = billItem.billQty * billItem.billRate
                const discAmount = billItem.discountType === "Per" ? (billItem.discountValue / 100) * billAmount : billItem.discountValue;
                const amount = billAmount - discAmount;


                let gtdYarnPoDetResult = await connection.execute(`
                select det.yarnname, det.color, det.uom, det.processname, price, poQty, po.gtdyarnpoid, gtnorderentry.gtnorderentryid
                from gtdyarnpodet det
                join gtdYarnPo po on det.GTDYARNPOID = po.gtdyarnpoid
                join gtnorderentry on gtnorderentry.orderno = det.orderno
                where det.gtdyarnpodetid = ${billItem.poDetId}
                `)
                const [yarnname, color, uom, processname, poRate, poQty, gtdyarnpoid, orderid] =
                    gtdYarnPoDetResult.rows[0]

                const gridSql = `
                INSERT INTO gtDypBillEntryDET (gtDypBillEntryDETID, gtDypBillEntryID,UOM,COLOR, PROCESSNAME, YARNNAME,ORDERNO,PONO,
                    DISCAMT,AMOUNT,DVAL,DISCTYPE,DETAILID,NOTES,
                    TAX,BILLAMT, BILLRATE,BILLQTY,BALQTY,ABILLQTY,
                    PORATE,GRNQTY, POQTY, TRANSTYPE, POTYPE)
                    VALUES(supplierseq.nextVal, ${gtDypBillEntryID},${uom},${color},${processname}, ${yarnname},'${orderid}', '${gtdyarnpoid}',
                    ${discAmount}, ${amount}, ${billItem.discountValue}, '${billItem.discountType}', ${billItem.poDetId}, '${billItem.notes}',
                    ${billItem.tax},${billAmount},${billItem.billRate}, ${billItem.billQty}, ${balQty}, ${aBillQty},
                    ${poRate}, ${aGrnQty},${poQty},  '${TRANSTYPE}', '${POTYPE}' )`
               console.log(gridSql,"gridSql")
                    await connection.execute(gridSql)
                const accumulatedBillQty = parseFloat(aBillQty ? aBillQty : 0) + parseFloat(billItem.billQty);
                const updatePoBillSql = `
                UPDATE GTYARNPODET 
                SET billQty = ${accumulatedBillQty}
                WHERE GTYARNPODETID = ${billItem.poDetId}
                `
                await connection.execute(updatePoBillSql)
            })
            return Promise.all(promises)
        })()
        connection.commit()
        return res.json({ statusCode: 0, data: gtDypBillEntryID })
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
        SELECT 
        gtDypBillEntry.docid,
        gtDypBillEntry.docdate,
        gtDypBillEntry.supplier,
        gtDypBillEntry.remarks,
        gtDypBillEntry.partybilldate,
        gtDypBillEntry.partybillno,
        gtDypBillEntry.grossamt,
        gtDypBillEntry.netbillvalue
 FROM   gtDypBillEntry
 JOIN   gtCompMast ON gtCompMast.compName1 = gtDypBillEntry.supplier
 WHERE  gtCompMast.gtCompMastId = :gtCompMastId 
 `, { gtCompMastId })
        const resp = result.rows.map(billEntry => (
            {
                docId: billEntry[0], docDate: billEntry[1], compName: billEntry[2], remarks: billEntry[3],
                partyBillNo: billEntry[5], partyBillDate: billEntry[4], grossAmount: billEntry[6], netBillValue: billEntry[7]
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


export async function getInvoiceDetails(req, res) {
    const connection = await getConnection(res)

    try {
        const { billEntryNo } = req.query
        const result = await connection.execute(`
        SELECT
        gtYarnMaster.yarnName,
        gtColorMast.colorName,
        gtDypBillEntryDET.billqty,
        gtDypBillEntryDET.billRate,
        gtDypBillEntryDET.tax,
        gtDypBillEntryDET.poRate,
        gtDypBillEntryDET.balQty,
        gtDypBillEntryDET.poQty,
        gtDypBillEntryDET.ABILLQTY,
        gtDypBillEntryDET.gtDypBillEntryDETID,
        gtDYarnPoDet.gtDYarnpoDetId,
        gtDYarnPo.docid,
        gtDYarnPoDet.noofbags,
        gtDypBillEntryDET.grnQty,
        gtDypBillEntryDET.notes,
        gtDypBillEntryDET.dval,
        gtDypBillEntryDET.discType
        FROM
        gtDypBillEntryDET
    JOIN
        gtYarnMaster ON gtYarnMaster.gtYarnMasterId = gtDypBillEntryDET.YARNNAME
    JOIN
        gtColorMast ON gtColorMast.gtColorMastId = gtDypBillEntryDET.COLOR
    JOIN
        gtDYarnPoDet ON gtDYarnPoDet.GTDYARNPODETID = gtDypBillEntryDET.DETAILID
    JOIN                  
        gtDypBillEntry ON gtDypBillEntry.gtDypBillEntryID = gtDypBillEntryDET.gtDypBillEntryID
    JOIN 
        gtDYarnPo ON gtDYarnPo.GTDYARNPOID = gtDYarnPoDet.GTDYARNPOID
    WHERE
    gtDypBillEntry.docid = '${billEntryNo}' `)

        const resp = result.rows.map(del => ({
            yarn: del[0], color: del[1], billQty: del[2], billRate: del[3], tax: del[4],
            poRate: del[5], balQty: del[6], poQty: del[7],
            aBillQty: del[8], gtdypBillEntryDetId: del[9], poDetId: del[10], poNo: del[11],
            poBags: del[12], aDelQty: del[13], notes: del[14], discountValue: del[15], discountType: del[16]
        }))
        console.log(resp,'resp')

        const result1 = await connection.execute(`
        SELECT 
        gtDypBillEntry.docid,
        gtDypBillEntry.docdate,
        gtDypBillEntry.supplier,
        gtDypBillEntry.remarks,
        gtDypBillEntry.partybilldate,
        gtDypBillEntry.partybillno,
        gtDypBillEntry.grossamt,
        gtDypBillEntry.netbillvalue,
        gtDypBillEntry.gtdypbillentryid,
        gtaddded.ADSCHEME
 FROM   gtDypBillEntry
 JOIN   gtCompMast ON gtCompMast.compName1 = gtDypBillEntry.supplier
 JOIN gtaddded on gtaddded.GTADDDEDID = gtDypBillEntry.taxTemp
    WHERE
        gtDypBillEntry.docid = '${billEntryNo}' `)

        const billEntry = result1.rows[0]
        const delNonGridDetails = {
            docId: billEntry[0], docDate: billEntry[1], supplier: billEntry[2], remarks: billEntry[3],
            partyBillDate: billEntry[4], partyBillNo: billEntry[5], grossAmount: billEntry[6], netBillValue: billEntry[7], gtDypBillEntryId: billEntry[8], taxTemp: billEntry[9]
            // from: {
            //     phoneNo: fromToData[1], city: fromToData[2].split("|")[0].trim(" "), state: fromToData[2].split("|")[1].trim(" "),
            //     compName: fromToData[3], pinCode: fromToData[4], panNo: fromToData[5], gstNo: fromToData[6], email: fromToData[7], address: fromToData[8]
            // },
            // to: {
            //     phoneNo: fromToData[9], city: fromToData[10].split("|")[0].trim(" "), state: fromToData[10].split("|")[1].trim(" "), compName: fromToData[11],
            //     pinCode: fromToData[12], panNo: fromToData[13], gstNo: fromToData[14], email: fromToData[15], address: fromToData[16]
            // }
        }
        const taxDetails = await getTaxGridDetails(connection, billEntry[8])
        return res.json({ statusCode: 0, data: { ...delNonGridDetails, invoiceDetails: resp, taxDetails } })
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close()
    }
}
export async function upDate(req, res) {
    const { supplierId: gtCompMastId, remarks: REMARKS, netAmount: NETAMT, netBillValue: NETBILLVALUE, partyBillNo, taxGridDetails,
        partyBillDate: PARTYBILLDATE, invoiceDetails, yarnPoBillEntryNo } = req.body;
    const connection = await getConnection(res);
    try {
        if (!yarnPoBillEntryNo || !invoiceDetails || !taxGridDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: yarnPoBillEntryNo , invoiceDetails' });
        }
        if (invoiceDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Invoice Details Cannot be Empty' });
        }
        if (taxGridDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Tax Details Cannot be Empty' });
        }
        if (invoiceDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Invoice Details Cannot be Empty' });
        }
        const TOTALQTY = invoiceDetails.reduce((a, c) => a + parseFloat(c.billQty), 0);
        const GROSSAMT = invoiceDetails.reduce((a, c) => a + parseFloat(c.billQty * c.billRate), 0);
        const nonGridSql = `
            UPDATE gtDypBillEntry
            SET remarks = '${REMARKS}',
                PARTYBILLDATE = TO_DATE('${PARTYBILLDATE}', 'DD-MM-YYYY'),
                PARTYBILLNO = '${partyBillNo}',
                TOTALQTY = '${TOTALQTY}',
                GROSSAMT = '${GROSSAMT}',
                NETAMT = ${NETBILLVALUE},
                NETBILLVALUE = ${NETBILLVALUE}
            WHERE docid= '${yarnPoBillEntryNo}'
        `;
        const nonGridResult = await connection.execute(nonGridSql);
        const lastRowData = await connection.execute(`
        select gtDypBillEntryID from gtDypBillEntry where rowid = '${nonGridResult.lastRowid}'
        `)
        const gtDypBillEntryID = lastRowData.rows[0][0]

        let oldDeliveryDetailsItems = await connection.execute(`SELECT gtDypBillEntryDETID from gtDypBillEntryDET 
        WHERE gtDypBillEntryID = ${gtDypBillEntryID}`)
        oldDeliveryDetailsItems = oldDeliveryDetailsItems.rows.map(item => item[0])

        const newUpdateDeliveryItemsIds = invoiceDetails.filter(item => item?.gtDYarnBillEntryDetId).map(item => item?.gtDYarnBillEntryDetId)

        const removedItems = getRemovedItems(oldDeliveryDetailsItems, newUpdateDeliveryItemsIds);

        if (removedItems.length > 0) {
            await connection.execute(`DELETE FROM gtDypBillEntryDET WHERE gtDypBillEntryDETID IN (${removedItems}) `)
        }
        await deleteTaxGridDetails(connection, gtDypBillEntryID);
        await createTaxGridDetails(connection, taxGridDetails, gtDypBillEntryID);
        await (async function updateGridDetails() {
            const promises = invoiceDetails.map(async (billItem) => {
                let aGrnSql = `
                select sum(totalgrnqty) as alreadyGrnQty from gtdyarnpoinwarddet 
                where GTDYARNPODETID = ${billItem.poDetId} 
                `
                const alreadyGrnResult = await connection.execute(aGrnSql)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let aBillQtySql = `
                select sum(billQty) from gtDypBillEntryDET 
                where DETAILID = ${billItem.poDetId} and gtDypBillEntryID < ${gtDypBillEntryID}
                `
                const alreadyBillQtyResult = await connection.execute(aBillQtySql)
                const aBillQty = alreadyBillQtyResult.rows[0][0] ? alreadyBillQtyResult.rows[0][0] : 0

                const balQty = parseFloat(aGrnQty) - parseFloat(billItem.billQty)

                const billAmount = billItem.billQty * billItem.billRate
                const discAmount = billItem.discountType === "Per" ? (billItem.discountValue / 100) * billAmount : billItem.discountValue;
                const amount = billAmount - discAmount;

                let gtDYarnPoDetResult = await connection.execute(`
                select det.yarnname, det.color, det.uom, det.processname, price, poQty, po.gtDyarnpoid, gtnorderentry.gtnorderentryid
                from gtDyarnpodet det
                join gtDYarnPo po on det.GTDYARNPOID = po.gtdyarnpoid
                join gtnorderentry on gtnorderentry.orderno = det.orderno
                where det.gtdyarnpodetid = ${billItem.poDetId}
                `)
                const [yarnname, color, uom, processname, poRate, poQty, gtdyarnpoid, orderid] =
                gtDYarnPoDetResult.rows[0]
                if (billItem?.gtYarnBillEntryDetId) {
                    const gridSql = `
                    UPDATE gtDypBillEntryDET
                    SET DISCAMT = ${discAmount},
                    AMOUNT =  ${amount},
                    DVAL = ${billItem.discountValue},
                    DISCTYPE = '${billItem.discountType}',
                    NOTES = '${billItem.notes}',
                    TAX = ${billItem.tax},
                    BILLAMT = ${billAmount},
                    BILLRATE = ${billItem.billRate},
                    BILLQTY = ${billItem.billQty},
                    BALQTY = ${balQty},
                    ABILLQTY = ${aBillQty}
                    WHERE gtDypBillEntryDETID = '${billItem.gtYarnBillEntryDetId}'
                    `;
                    await connection.execute(gridSql)
                } else {
                    const gridSql = `
                INSERT INTO gtDypBillEntryDET (gtDypBillEntryDETID, gtDypBillEntryID,UOM,COLOR, PROCESSNAME, YARNNAME,ORDERNO,PONO,
                    DISCAMT,AMOUNT,DVAL,DISCTYPE,DETAILID,NOTES,
                    TAX,BILLAMT, BILLRATE,BILLQTY,BALQTY,ABILLQTY,
                    PORATE,GRNQTY, POQTY, TRANSTYPE, POTYPE)
                    VALUES(supplierseq.nextVal, ${gtDypBillEntryID},${uom},${color},${processname}, ${yarnname},'${orderid}', '${gtdyarnpoid}',
                    ${discAmount}, ${amount}, ${billItem.discountValue}, '${billItem.discountType}', ${billItem.poDetId}, '${billItem.notes}',
                    ${billItem.tax},${billAmount},${billItem.billRate}, ${billItem.billQty}, ${balQty}, ${aBillQty},
                    ${poRate}, ${aGrnQty}, ${poQty},  '${TRANSTYPE}', '${POTYPE}')`
                    await connection.execute(gridSql)
                }
                const accumulatedBillQty = parseFloat(aBillQty ? aBillQty : 0) + parseFloat(billItem.billQty);
                const updatePoBillSql = `
                UPDATE GTYARNPODET 
                SET billQty = ${accumulatedBillQty}
                WHERE GTYARNPODETID = ${billItem.poDetId}
                `
                await connection.execute(updatePoBillSql)
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






