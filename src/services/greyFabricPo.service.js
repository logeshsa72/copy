import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
    const connection = await getConnection(res)

    try {
        const { gtCompMastId, searchPoNo, searchPosupplier, searchPoDate, searchPoduedate, isAccepted, billEntryFilter } = req.query;


        const bindVar = {
            gtCompMastId,
            searchPoDate: `%${searchPoDate ? searchPoDate : ""}%`,
            searchPoNo: `%${searchPoNo ? searchPoNo.toUpperCase() : ""}%`,
            searchPosupplier: `%${searchPosupplier ? searchPosupplier.toUpperCase() : ""}%`,
            searchPoduedate: `%${searchPoduedate ? searchPoduedate : ""}%`,
        }
        if (isAccepted) {
            bindVar["isAccepted"] = isAccepted
        }

        const result = await connection.execute(`
        SELECT
        gtfabricpo.docid AS poNo,
        gtfabricpo.docDate,
        gtfabricpo.supplier,
        gtfabricpo.duedate,
        gtfabricpo.grossamount,
        gtfabricpo.netamount,
        gtfabricpo.compname,
        gtfabricpo.totalqty,
        gtfabricpo.purtype,
        gtpayterms.payterm,
        CASE WHEN gtfabricpo.isAccepted = 1 THEN 'true' ELSE 'false' END AS isAccepted,
        DENSE_RANK() OVER (ORDER BY gtfabricpo.gtFabricPoId) AS sno,
        gtcompmast.phoneno,
        gtcompmast.citystate,
        gtcompmast.compname,
        gtcompmast.pincode,
        gtcompmast.panno,
        gtcompmast.gstno,
        gtcompmast.email,
        gtcompmast.address
    FROM
        gtFabricPodet
    LEFT JOIN
        gtfabricpo ON gtfabricpo.gtFabricPoId = gtFabricPoDet.gtFabricPoId
    LEFT JOIN
        gtpayterms ON gtpayterms.gtpaytermsid = gtfabricpo.payterms
    LEFT JOIN
        gtcompmast ON gtfabricpo.supplier = gtcompmast.compname1
    WHERE
        gtcompmast.gtcompmastid = :gtCompMastId
    AND upper(docId) LIKE :searchPoNo
    AND TO_CHAR(docdate, 'dd-mm-yyyy') LIKE :searchPoDate 
    AND upper(supplier) LIKE :searchPosupplier
    AND TO_CHAR(duedate, 'dd-mm-yyyy') LIKE :searchPoduedate
    ${isAccepted ?
                `AND gtfabricpo.isAccepted = CASE WHEN :isAccepted = 'true' THEN 1 ELSE 0 END`
                :
                ""}
                GROUP BY gtfabricpo.docid,
                gtfabricpo.docDate,
                  gtfabricpo.supplier,
                  gtfabricpo.duedate,
                  gtfabricpo.grossamount,
                  gtfabricpo.netamount,
                  gtfabricpo.compname,
                  gtfabricpo.totalqty,
                  gtfabricpo.purtype,
                  gtpayterms.payterm,
                  gtfabricpo.isAccepted,
                  gtfabricpo.gtFabricPoId,
                  gtcompmast.phoneno,
                  gtcompmast.citystate,
                  gtcompmast.compname,
                  gtcompmast.pincode,
                  gtcompmast.panno,
                  gtcompmast.gstno,
                  gtcompmast.email,
                  gtcompmast.address
                  order by poNo
     `, { ...bindVar })


        let resp = result.rows.map(po => ({
            poNo: po[0], poDate: po[1], fabricAgentName: po[2], expDate: po[3],
            grossAmount: po[4], netAmount: po[5], compname: po[6], payterms: po[9], totalQty: po[7], purchaseType: po[8],
            isAccepted: JSON.parse(po[10]), data: po[11],
            from: {
                phoneNo: po[12], city: po[13].split("|")[0] ? po[13].split("|")[0].trim(" ") : "", state: po[13].split("|")[1] ? po[13].split("|")[1].trim(" ") : "", compName: po[14], pinCode: po[15], panNo: po[16], gstNo: po[17], email: po[18], address: po[19]
            },
            to: {
                phoneNo: po[12], city: po[13].split("|")[0] ? po[13].split("|")[0].trim(" ") : "", state: po[13].split("|")[1] ? po[13].split("|")[1].trim(" ") : "", compName: po[14], pinCode: po[15], panNo: po[16], gstNo: po[17], email: po[18], address: po[19]
            }
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
export async function acceptPo(req, res) {
    const connection = await getConnection(res)
    try {
        const { poNo } = req.query
        const response = await connection.execute(`update gtfabricpo a
    set  a.ISACCEPTED= 1
    where a.docid = :poNo`, { poNo })
        connection.commit()
        if (response.rowsAffected === 1) {
            return res.json({ statusCode: 0, data: "Purchase Order Accepted" });
        } else {
            return res.json({ statusCode: 1, data: "PoNo Does not Exist" });
        }
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }

}


export async function getPoDetails(req, res) {
    const connection = await getConnection(res);

    try {
        const { poNo } = req.query
        if (!poNo) {
            return res.status(400).json({ statusCode: 1, error: "poNo is required" });
        }

        const result = await connection.execute(
            `SELECT
            gtfabricpo.docId AS poNo,
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
            gtfabricpodet.orderNo,
            gtfabricpodet.counts,
            gtfabricpodet.poQty,
            gtfabricpodet.poRate,gtfabricpodet.amount,gtfabricpodet.roll,
            SUM(gtFabpurInwardDet.grnqty) AS totalGrnQty, 
            gtFabricpodet.gtFabricPodetId,
            SUM(gtFabpurInwardDet.billQty) AS totalBillQty,
            SUM(gtFabpurInwardDet.balQty) AS totalBalQty
          FROM gtfabricpodet
          JOIN gtfabricMast ON gtfabricMast.gtfabricMastId =gtfabricpodet.aliasName
          JOIN gtUnitMast ON gtUnitMast.gtUnitMastId =gtfabricpodet.uom
          JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtfabricpodet.fDia
          JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtfabricpodet.kDia
          JOIN gtLoopMast ON gtLoopMast.gtLoopMastId =gtfabricpodet.ll
          JOIN gtGgMast ON gtGgMast.gtggMastId =gtfabricpodet.gg
          JOIN gtGsmMast ON gtGsmMast.gtGsmMastId =gtfabricpodet.gsm
          JOIN gtDesignMast ON gtDesignMast.gtDesignMastId =gtfabricpodet.fabDesign
          JOIN gtFabTypeMast ON gtFabTypeMast.gtfabtypeMastId =gtfabricpodet.fabricType   
          JOIN gtProcessMast ON gtProcessMast.gtProcessMastId =gtfabricpodet.processName
          LEFT JOIN gtFabricPo ON gtFabricPo.gtfabricPoId =gtfabricpodet.gtfabricPoId
          LEFT JOIN gtFabPurInwardDet ON gtfabricpodet.gtfabricpodetId = gtFabPurInwardDet.DETAILID
          LEFT JOIN gtColorMast ON gtfabricpodet.fabColor = gtColorMast.gtColorMastId 
          where gtFabricPo.docId = :poNo
          GROUP BY
        gtFabricPo.docId,gtfabricpodet.gtFabricPodetId, gtFabricMast.fabaliasName, 
        gtColorMast.colorName, 
        gtUnitMast.unitName, gtDiaMast.fDia,  
        gtDiaMast.kDia, gtLoopMast.ll,gtGgMast.gg,    gtGsmMast.gsm,gtDesignMast.design, gtFabTypeMast.fabType,
        gtProcessMast.processName,gtfabricpodet.orderNo,gtfabricpodet.counts, gtfabricpodet.porate,gtfabricpodet.amount,gtfabricpodet.roll,
        gtFabpurInwardDet.grnqty,
        gtFabricpodet.gtFabricPodetId,gtFabpurInwardDet.billQty,gtFabpurInwardDet.balQty,
        gtfabricpodet.poQty
         `, { poNo },
        )
        const resp = result.rows.map(det => ({ poNo: det[0], fabric: det[1], color: det[2], uom: det[3], fDia: det[4], kDia: det[5], ll: det[6], gg: det[7], gsm: det[8], fabricDesign: det[9], fabricType: det[10], processName: det[11], orderNo: det[12], counts: det[13], poQty: det[14], price: det[15], totalAmt: det[16], roll: det[17], agrnQty: det[18], poDetId: det[19], totalBillQty: det[20], totalBalQty: [21] }))

        const result1 = await connection.execute(`
    SELECT
    DOCID AS PONO,
    DOCDATE,
    SUPPLIER,
    DUEDATE,
    GROSSAMOUNT,
    NETAMOUNT,
    APPSTATUS,
    TOTALQTY,
    PURTYPE,
     GTCOMPMAST.PHONENO,
    GTCOMPMAST.CITYSTATE,
    GTCOMPMAST.COMPNAME1,
    GTCOMPMAST.PINCODE,
    GTCOMPMAST.PANNO,
    GTCOMPMAST.GSTNO,
    GTCOMPMAST.EMAIL,
    GTCOMPMAST.ADDRESS,
    COMP.COMPNAME,
    GTPAYTERMS.PAYTERM,
    CASE WHEN ISACCEPTED = 1 THEN 'true' ELSE 'false' END AS ISACCEPTED,
    DENSE_RANK() OVER (ORDER BY GTFABRICPOID) SNO
    FROM
    GTFABRICPO
  JOIN
    GTPAYTERMS ON GTPAYTERMS.GTPAYTERMSID = GTFABRICPO.PAYTERMS
  JOIN
    GTCOMPMAST ON GTFABRICPO.SUPPLIER = GTCOMPMAST.COMPNAME
  JOIN GTCOMPMAST COMP ON GTFABRICPO.COMPCODE = COMP.GTCOMPMASTID
    WHERE
    GTFABRICPO.DOCID = :poNo
    
  
   `, { poNo })

        const po = result1.rows[0];


        const poNonGridDetails = {

            poNo: po[0], poDate: po[1], fabricAgentName: po[2], expDate: po[3],
            grossAmount: po[4], netAmount: po[5], status: po[6], totalQty: po[7], purchaseType: po[8], payTerm: po[18], compName: po[17],
            isAccepted: JSON.parse(po[19])
        };
        const poNonGridDetails1 = {
            phoneNo: po[9], city: po[10].split("|")[0] ? po[10].split("|")[0].trim(" ") : "", state: po[10].split("|")[1] ? po[10].split("|")[1].trim(" ") : "", compName: po[11], pinCode: po[12], panNo: po[13], gstNo: po[14], email: po[15], address: po[16]
        }


        return res.json({ statusCode: 0, data: { ...poNonGridDetails, from: { ...poNonGridDetails1 }, poDetails: resp, } })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getPoItem(req, res) {
    const connection = await getConnection(res);

    try {
        const { filterPoList, billEntryFilter, deliveryFilter } = req.query
        const filterPoItems = filterPoList ? JSON.parse(filterPoList).map(item => `'${item}'`) : []
        const sql =
            ` SELECT
      gtfabricpo.docId AS poNo,
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
       gtFabricPodet.orderNo,
       gtfabricpodet.counts,
       gtFabricPodet.poQty,  
       gtFabricPodet.poRate,
      gtFabricPodet.amount,
      gtfabricpodet.roll,
      SUM(gtFabpurInwardDet.TOTALGRNQTY) AS totalGrnQty,  
      SUM(gtFabpurInwardDet.billQty) AS totalBillQty,
      SUM(gtFabpurInwardDet.balQty) AS totalBalQty,
      gtFabricpodet.gtFabricPodetId 
    FROM gtFabricPodet
    JOIN gtFabricMast ON gtFabricMast.gtfabricMastId = gtFabricPodet.aliasName
    JOIN gtUnitMast ON gtUnitMast.gtUnitMastId =gtfabricpodet.uom
    JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtfabricpodet.fDia
    JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtfabricpodet.kDia
    JOIN gtLoopMast ON gtLoopMast.gtLoopMastId =gtfabricpodet.ll
    JOIN gtGgMast ON gtGgMast.gtGgMastId =gtfabricpodet.gg
    JOIN gtGsmMast ON gtGsmMast.gtGsmMastId =gtfabricpodet.gsm
    JOIN gtDesignMast ON gtDesignMast.gtDesignMastId =gtfabricpodet.fabDesign
    JOIN gtFabTypeMast ON gtFabTypeMast.gtfabTypeMastId =gtfabricpodet.fabricType
    JOIN gtColorMast ON gtColorMast.gtColorMastId = gtFabricPodet.fabColor
    JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtFabricPodet.processName
    LEFT JOIN gtFabricPo ON gtFabricPo.gtFabricPoId = gtFabricPodet.gtFabricPoId
    LEFT JOIN gtFabpurInwardDet ON gtFabricPodet.gtFabricPodetId = gtFabpurInwardDet.gtFabpurInwardDetId
    LEFT JOIN gtgrpBillEntryDet billDet ON billDet.DETAILID = gtFabpurInwardDet.gtFabpurInwardDetId
  where docId IN (${filterPoItems})
    GROUP BY
      gtfabricPo.docId, gtFabricPodet.gtFabricPodetId, gtFabricMast.fabaliasName, gtColorMast.colorName, gtUnitMast.unitName, gtDiaMast.fDia,  gtDiaMast.kDia, gtLoopMast.ll,gtGgMast.gg,gtGsmMast.gsm,gtDesignMast.design,  gtfabricpodet.roll, gtFabTypeMast.fabType,gtProcessMast.processName, gtFabricPodet.orderNo, gtFabricPodet.counts, gtFabricPodet.poQty,  gtFabricPodet.poRate, gtFabricPodet.amount
      ${billEntryFilter && JSON.parse(billEntryFilter) ?
                'having COALESCE(SUM(gtFabPurInwarddet.TOTALGRNQTY),0) > 0' : ""
            }
        ${deliveryFilter && JSON.parse(deliveryFilter) ?
                'having gtFabricPodet.poQty > COALESCE(SUM(gtFabPurInwarddet.TOTALGRNQTY),0)' : ""
            }
   `


        const result = await connection.execute(sql)

        const resp = result.rows.map(det => ({ poNo: det[0], fabric: det[1], color: det[2], uom: det[3], fDia: det[4], kDia: det[5], ll: det[6], gg: det[7], gsm: det[8], fabricDesign: det[9], fabricType: det[10], processName: det[11], orderNo: det[12], counts: det[13], poQty: det[14], price: det[15], totalAmt: det[16], roll: det[17], agrnQty: det[18], poDetId: det[19], totalBillQty: det[20], totalBalQty: [21] }))


        return res.json({ statusCode: 0, data: resp });
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close();
    }
}