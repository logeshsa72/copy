import { getConnection } from "../constants/db.connection.js";
import { getCurrentFinancialYearId } from "../queries/financialYear.js";
import { STOREID,STORES, COMPCODE, COMPNAME, PROJECTID, GY_INWARD_PTRANSACTION, TCODE, TTYPE, LOCID, POTYPE, TRANSTYPE, DF_INWARD_PTRANSACTION } from "../constants/defaultQueryValues.js"
import { getNextDyedFabpurInwardNo } from "../queries/sequences.js";
import { getSupplierName } from "../queries/supplier.js";
import moment from "moment";
import { getRemovedItems, substract } from "../Helpers/helper.js";

export async function getDocId(req, res) {
    const connection = await getConnection(res)
    const fpIno = await getNextDyedFabpurInwardNo(connection);
    connection.close()
    return res.json({ statusCode: 0, docId: fpIno })
}

export async function create(req, res) {
    const connection = await getConnection(res)
    const { supplierId: gtCompMastId,  remarks: REMARKS,  supplierDcDate: SUPPDCDATE, supplierDcNo: SUPPDCNO, deliveryDetails } = req.body;
    try {
        if (!gtCompMastId) {
            return res.json({ statusCode: 1, message: 'Required Fields: supplierId, deliveryDetails' });
        }
        console.log("Calling")
        if (deliveryDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Delivery Details Cannot be Empty' });
        }
        const FPIDATE = moment(new Date()).format("DD-MM-YYYY");
        const FINYEAR = await getCurrentFinancialYearId(connection);
        const FPINO = await getNextDyedFabpurInwardNo(connection);
        console.log(FPINO, "inwardno")
        const SUPPLIER = await getSupplierName(connection, gtCompMastId);
        const TOTALQTY = deliveryDetails.reduce((a, c) => a + parseFloat(c.grnQty), 0);
        const nonGridSql = `
        INSERT INTO GTDFABPURINWARD (GTDFABPURINWARDID, FINYEAR,REMARKS, COMPCODE,TOTALQTY,  TCODE, TTYPE, PTRANSACTION, COMPNAME, FPINO, LOCID,STORES, SUPPLIER,  SUPPDCDATE, SUPPDCNO, FPIDATE,PROJECTID ) 
        VALUES ( supplierseq.nextVal,  '${FINYEAR}' , '${REMARKS}' , '${COMPCODE}' ,'${TOTALQTY}', '${TCODE}' , '${TTYPE}' , '${DF_INWARD_PTRANSACTION}' , '${COMPNAME}' ,'${FPINO}',
            '${LOCID}' ,'${STORES}', '${SUPPLIER}',   TO_DATE('${SUPPDCDATE}', 'DD/MM/YY'), '${SUPPDCNO}', TO_DATE('${FPIDATE}','DD/MM/YY'), 
             '${PROJECTID}')
        `;
        console.log(nonGridSql);
        const nonGridResult = await connection.execute(nonGridSql)
        const lastRowData = await connection.execute(`
        select gtdfabpurinwardid from gtdfabpurinward where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTDFABPURINWARDID = lastRowData.rows[0][0]
        await (async function createGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {
        
                let gtdFabricPoDetResult = await connection.execute(`
                select aliasname,uom,fabdesign, fabcolor,fabrictype,fabric,fdia,kdia,ll,gg,gsm, buyercode,  processname, porate, tax, orderno, poQty,
                  po.gtdfabricpoid, po.docdate,
                totalgrnqty
                from gtdfabricpodet det
                join gtdfabricpo po on det.GTDFABRICPOID = po.gtdfabricpoid
                    where gtdfabricpodetid = ${deliveryItem.poDetId}
                `)
                const [aliasName,uom,fabdesign, fabcolor,fabrictype,fabric,fDia,kDia,ll,gg,gsm, buyerCode,  processName, porate, tax, orderNo, poQty, poNo, poDate,
                    aGrnQty] = gtdFabricPoDetResult.rows[0]
                const taxRate = porate + (porate / 100 * tax)
                const balQty = parseFloat(poQty) - parseFloat(aGrnQty ? aGrnQty : 0)
                const totalGrnQty = parseFloat(deliveryItem.grnQty);
                let grnQty = totalGrnQty;
                let excessQty = 0;
                if (grnQty > balQty) {
                    grnQty = balQty
                    excessQty = totalGrnQty - balQty
                }
                const convertedPoDate = moment(poDate).format("DD-MM-YYYY")
                const gridSql = `
                INSERT INTO GTDFABPURINWARDDET (GTDFABPURINWARDDETID,GTDFABPURINWARDID,PROCESSNAME,KDIA,DESIGN,UOM,FDIA,LL,GG,GSM,COLOR, FABTYPE,FABRIC,ALIASNAME,PONO,TAXRATE,BUYERCODE,ORDERNO,PORATE,AGRNQTY,GRNQTY,BALQTY,POQTY,TOTALGRNQTY,EXCESSQTY,POID,GRNROLLS,LOTNO)                   
                    VALUES(supplierseq.nextVal,'${GTDFABPURINWARDID}','${processName}','${kDia}', '${fabdesign}', '${uom}', '${fDia}', 
                    '${ll}', '${gg}', '${gsm}','${fabcolor}','${fabrictype}','${fabric}','${aliasName}','${poNo}','${taxRate}','${buyerCode}','${orderNo}','${porate}','${aGrnQty}','${grnQty}','${balQty}','${poQty}','${totalGrnQty}', '${excessQty}', '${deliveryItem.poDetId}', 
                      '${deliveryItem.grnRolls}','${deliveryItem.lotNo}' )               
                `
                console.log(gridSql,"GRIDSQLLL");
                await connection.execute(gridSql)
                const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                const updatePoDetSql = `
                UPDATE GTDFABRICPODET 
                SET totalGrnQty = ${accumulatedGrnQty},
                    excessQty = ${excessQty},
                    grnQty = ${substract(accumulatedGrnQty, excessQty)}
                WHERE GTDFABRICPODETID = ${deliveryItem.poDetId}
                `
                await connection.execute(updatePoDetSql)
            })
            return Promise.all(promises)
        })()
        connection.commit()
        return res.json({ statusCode: 0, data: GTDFABPURINWARDID })
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
        SELECT gtdFabpurInward.compname,
        gtdFabpurInward.remarks,
        gtdFabpurInward.supplier,
        gtdFabpurInward.suppdcdate,
        gtdFabpurInward.suppdcno,
        gtdFabpurInward.fpidate,
        gtdFabpurInward.fpino,
        gtdFabpurInward.totalqty     
 FROM   GTDFABPURINWARD
 JOIN   gtCompMast ON gtCompMast.compName1 = gtdFabpurInward.supplier
 JOIN gtdFabpurInwardDet ON gtdFabpurInwardDet.gtdFabpurInwardId = gtdFabpurInward.gtdFabpurInwardId
  JOIN gtdFabricPo ON gtdFabpurInwardDet.poNo = gtdFabricPo.gtdFabricPoid
 WHERE  gtCompMast.gtCompMastId = :gtCompMastId 
 
    `, { gtCompMastId })
        const resp = result.rows.map(del => ({
            fabpurInwardNo: del[6], compName: del[0], remarks: del[1],  supplier: del[2], dcDate: del[3], supplierDcNo: del[4],
            dFInwardDate: del[5], totalQty: del[7]
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
        const { fpino } = req.query
        console.log(fpino,"fpinofpinofpinofpino")
        const result = await connection.execute(`
        SELECT
        gtFabricMast.fabaliasName,
        gtColorMast.colorName,
        gtUnitMast.unitName,
        gtDiaMast.fDia,
        gtDiaMast.kDia,
        gtLoopMast.ll,
        gtGgMast.gg,
        gtGsmMast.gsm,
        gtDesignMast.design,
        gtFabTypeMast.fabType,
        gtProcessMast.processName,
        gtdfabpurinwarddet.poNo,
        gtdfabpurinwarddet.orderNo,
        gtdfabpurinwarddet.totalgrnQty,
        gtdfabpurinwarddet.poRate,
        gtdfabpurinwarddet.balQty,
        gtdfabpurinwarddet.poQty,
        gtdfabpurinwarddet.grnRolls,
        gtdfabpurinwarddet.lotNo,
        gtdfabpurinwarddet.agrnQty,
        gtdfabpurinwarddet.gtdfabpurinwarddetId,
    gtdFabricPoDet.gtdFabricpoDetId,
    gtdfabricPo.docid
        FROM
        gtdFabpurInwardDet
        JOIN gtFabricMast ON gtFabricMast.gtfabricMastId = gtdFabpurInwardDet.aliasName
        JOIN gtUnitMast ON gtUnitMast.gtUnitMastId =gtdFabpurInwardDet.uom
        JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtdFabpurInwardDet.fDia
        JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtdFabpurInwardDet.kDia
        JOIN gtLoopMast ON gtLoopMast.gtLoopMastId =gtdFabpurInwardDet.ll
        JOIN gtGgMast ON gtGgMast.gtGgMastId =gtdFabpurInwardDet.gg
        JOIN gtGsmMast ON gtGsmMast.gtGsmMastId =gtdFabpurInwardDet.gsm
        JOIN gtDesignMast ON gtDesignMast.gtDesignMastId =gtdFabpurInwardDet.design
        JOIN gtFabTypeMast ON gtFabTypeMast.gtfabTypeMastId =gtdFabpurInwardDet.fabType
        JOIN gtColorMast ON gtColorMast.gtColorMastId = gtdFabpurInwardDet.color
        JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtdFabpurInwardDet.processName
JOIN
    gtdFabricPoDet ON gtdFabricPoDet.gtdFabricPoDetId = gtdfabpurinwarddet.poId
JOIN                  
gtdFabpurInward ON gtdFabpurInward.gtdFabpurInwardId = gtdfabpurinwarddet.gtdFabpurInwardId
JOIN 
    gtdFabricPo ON gtdFabricPo.gtdFabricPoID = gtdFabricPoDet.gtdFabricPoID
WHERE
     gtdFabpurInward.fpino = :fpino
        `, { fpino })
        
        const resp = result.rows.map(del => ({
            fabric: del[0], color: del[1], uom: del[2], fDia: del[3], kDia: del[4],
            ll: del[5], gg: del[6], gsm: del[7], fabricDesign: del[8],
            fabType: del[9], processName: del[10], poId: del[11], orderNo: del[12], grnQty: del[13],poRate: del[14],balQty: del[15],poQty: del[16],grnRolls: del[17],lotNo: del[18],aDelQty: del[19],gtdfabpurinwarddetId:del[20],poDetId: del[21],poNo:del[22]
        }))

        const result1 = await connection.execute(`
        SELECT
        gtdFabpurInward.supplier,
        gtdFabpurInward.suppdcdate,
        gtdFabpurInward.suppdcno,
        gtdFabpurInward.fpino,
        gtdFabpurInward.fpidate,
        gtdFabpurInward.totalqty,
        gtdFabpurInward.gtdFabpurInwardId,           
        gtdFabpurInward.remarks,  
        gtdFabpurInward.compname
    FROM
    gtdFabpurInward
    JOIN
    gtdFabpurInwardDet ON gtdFabpurInwardDet.gtdFabpurInwardId = gtdFabpurInward.gtdFabpurInwardId
    WHERE
    gtdFabpurInward.fpino = :fpino
        `, {fpino})
     
        const po = result1.rows[0]
        const poId = resp[0] ? resp[0].poId : ""
        console.log(poId,"poId",resp[0],"resp[0]")
        let fromToData = await connection.execute(`
        SELECT
        gtdfabricpo.docid AS poNo,
        gtcompmast.phoneno,
        gtcompmast.citystate,
        gtcompmast.compname,
        gtcompmast.pincode,
        gtcompmast.panno,
        gtcompmast.gstno,
        gtcompmast.email,
        gtcompmast.address        
    FROM
        gtdfabricpo
    JOIN
        gtcompmast ON gtdfabricpo.supplier = gtcompmast.compname1   
    WHERE
    gtdfabricpo.gtdfabricpoid = ${poId}
        `)
        fromToData = fromToData.rows[0]
        const delNonGridDetails = {
            supplier: po[0], dcDate: po[1], suppDcNo: po[2], fpino: po[3],
            fPIDate: po[4], totalQty: po[5], gtdfabpurInward: po[6],  remarks: po[7], compName: po[8],
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
    const {  remarks, supplierDcDate, supplierDcNo, fabpurInwardNo, deliveryDetails } = req.body;
   console.log(fabpurInwardNo,"fabpurInwardNo",deliveryDetails,"deliveryDetails",supplierDcDate,"supplierDcDate")
    const connection = await getConnection(res);
    try {
        if (!fabpurInwardNo || !deliveryDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: fabpurInwardNo , deliveryDetails' });
        }
        if (deliveryDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Delivery Details Cannot be Empty' });
        }
        const TOTALQTY = deliveryDetails.reduce((a, c) => a + parseFloat(c.grnQty), 0);

        const nonGridSql = `
            UPDATE gtdFabpurInWard
            SET 
                remarks = '${remarks}',
                suppDcDate = TO_DATE('${supplierDcDate}', 'DD-MM-YYYY'),
                suppDcNo = '${supplierDcNo}',
                totalQty = '${TOTALQTY}'
            WHERE fpino= '${fabpurInwardNo}'
        `;
        console.log(nonGridSql,"nonGridSql")
        const nonGridResult = await connection.execute(nonGridSql);
        const lastRowData = await connection.execute(`
        select gtdfabpurinwardid from gtdfabpurinward where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTDFABPURINWARDID = lastRowData.rows[0][0]

        let oldDeliveryDetailsItems = await connection.execute(`SELECT gtdFabpurinwarddetid from GTDFABPURINWARDDET 
        WHERE gtdFabpurinwardid = ${GTDFABPURINWARDID}`)
        oldDeliveryDetailsItems = oldDeliveryDetailsItems.rows.map(item => item[0])

        const newUpdateDeliveryItemsIds = deliveryDetails.filter(item => item?.gtdFabpurInwardDetId).map(item => item?.gtdFabpurInwardDetId)

        const removedItems = getRemovedItems(oldDeliveryDetailsItems, newUpdateDeliveryItemsIds);

        if (removedItems.length > 0) {
            await connection.execute(`DELETE FROM gtdFabpurinwarddet WHERE GTDFABPURINWARDDETID IN (${removedItems}) `)
        }
        await (async function updateGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {
                const alreadyGrnResult = await connection.execute(`
                    select COALESCE(sum(totalgrnqty),0 ) as alreadyGrnQty 
                    from gtdfabpurinwarddet 
                    where POID = ${deliveryItem.poDetId} and GTDFABPURINWARDID < ${GTDFABPURINWARDID}
                    `)
                const [aGrnQty] = alreadyGrnResult.rows[0]
               
                let gtdFabricPoDetResult = await connection.execute(`
                select aliasname,uom,fabdesign,fabcolor,fabrictype,fabric,fdia,kdia,ll,gg,gsm, buyercode,processname,porate,tax,orderno, poQty, roll, po.gtdfabricpoid, po.docdate               
                from gtdfabricpodet det
                join gtdfabricpo po on det.GTDFABRICPOID = po.gtdfabricpoid
                    where gtdfabricpodetid = ${deliveryItem.poDetId}
                `)
                const [aliasName,uom,fabdesign, fabcolor,fabrictype,fabric,fDia,kDia,ll,gg,gsm, buyerCode,  processName, porate, tax, orderNo, poQty,roll, poNo, poDate] = gtdFabricPoDetResult.rows[0]
                 
                const taxRate = porate + (porate / 100 * tax)
                const balQty = parseFloat(poQty) - parseFloat(aGrnQty ? aGrnQty : 0)
                const totalGrnQty = parseFloat(deliveryItem.grnQty);
                let grnQty = totalGrnQty;
                let excessQty = 0;
                if (grnQty > balQty) {
                    grnQty = balQty
                    excessQty = totalGrnQty - balQty
                }
               
                if (deliveryItem?.gtdFabpurInwardDetId) {
                    const gridSql = `
                                UPDATE gtdFabpurInwardDet
                                SET totalGrnQty = '${totalGrnQty}',
                                grnBags = '${deliveryItem.delRolls}',
                                lotNo = '${deliveryItem.lotNo}' 
                                WHERE gtdFabpurInwardDetId = '${deliveryItem?.gtdFabpurInwardDetId}'
                            `;
                    await connection.execute(gridSql)
                } else {
                    const convertedPoDate = moment(poDate).format("DD-MM-YYYY")
                    const gridSql = `
                    INSERT INTO GTDFABPURINWARDDET (GTDFABPURINWARDDETID,GTDFABPURINWARDID,PROCESSNAME,KDIA,DESIGN,UOM,FDIA,LL,GG,GSM,COLOR,FABTYPE,FABRIC,ALIASNAME,PONO,TAXRATE,BUYERCODE,ORDERNO,PORATE,AGRNQTY,GRNQTY,BALQTY,POQTY,TOTALGRNQTY,EXCESSQTY,POID,GRNROLLS,LOTNO)                   
                        VALUES(supplierseq.nextVal,'${GTDFABPURINWARDID}','${processName}','${kDia}', '${fabdesign}', '${uom}', '${fDia}', 
                        '${ll}', '${gg}', '${gsm}','${fabcolor}','${fabrictype}','${fabric}','${aliasName}','${poNo}','${taxRate}','${buyerCode}','${orderNo}','${porate}','${aGrnQty}','${grnQty}','${balQty}','${poQty}','${totalGrnQty}', '${excessQty}', '${deliveryItem.poDetId}', 
                          '${deliveryItem.grnRolls}','${deliveryItem.lotNo}' )               
                    `
             
                await connection.execute(gridSql)
                }
                const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                const updatePoDetSql = `
                UPDATE GTDFABRICPODET 
                SET totalGrnQty = ${accumulatedGrnQty},
                    excessQty = ${excessQty},
                    grnQty = ${substract(accumulatedGrnQty, excessQty)}
                WHERE GTDFABRICPODETID = ${deliveryItem.poDetId}
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






