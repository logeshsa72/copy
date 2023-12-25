import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
  const connection = await getConnection(res)

  try {
    const { gtCompMastId, searchPoNo, searchPosupplier, searchPoDate, searchPoduedate, isAccepted, deliveryFilter } = req.query;

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
    SELECT docid AS poNo,
     docdate,
     supplier,
     duedate,
     grossamount,
     netamount,
     appstatus, 
     totalqty,
     purtype, 
     gtPayTerms.payterm,
     CASE WHEN gtdfabricpo.isAccepted = 1 THEN 'true' ELSE 'false' END AS isAccepted,
     DENSE_RANK() OVER (ORDER BY gtdfabricpo.gtdfabricpoid) AS sno, 
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
    join 
      GTPAYTERMS on gtPayTerms.GTPAYTERMSID = gtdFabricPo.PAYTERMS  
    join 
       GTCOMPMAST on gtdfabricpo.supplier = GTCOMPMAST.COMPNAME1 
    JOIN
    gtcompmast ON gtdfabricpo.supplier = gtcompmast.compname
   WHERE GTCOMPMAST.GTCOMPMASTID =:gtCompMastId
    AND upper(docId) LIKE :searchPoNo
    AND TO_CHAR(docdate, 'dd-mm-yyyy') LIKE :searchPoDate 
    AND upper(supplier) LIKE :searchPosupplier
    AND TO_CHAR(duedate, 'dd-mm-yyyy') LIKE :searchPoduedate
    ${deliveryFilter ? `and gtdfabricpo.docid in (select distinct po.docid
      from gtdfabricpodet det
      join gtdfabricpo po on det.gtdfabricpoid = po.gtdfabricpoid
      where det.TOTALGRNQTY < det.poQty)
      ` : ""}
    ${isAccepted ?
        `AND gtdfabricpo.isAccepted = CASE WHEN :isAccepted = 'true' THEN 1 ELSE 0 END`
        :
        ""}
        GROUP BY gtdfabricpo.docid ,
        gtdfabricpo.docDate,
        gtdfabricpo.supplier,
        gtdfabricpo.duedate,
        gtdfabricpo.grossamount,
        gtdfabricpo.netamount,
        gtdfabricpo.appstatus,
        gtdfabricpo.totalqty,
        gtdfabricpo.purtype,
        gtpayterms.payterm,
        gtdfabricpo.isAccepted,
        gtdfabricpo.gtdfabricpoid,
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

    const resp = result.rows.map(po => ({
      poNo: po[0], poDate: po[1], supplier: po[2], expDate: po[3], grossAmount: po[4], netAmount: po[5], status: po[6], totalQty: po[7], purType: po[8], payTerm: po[9], isAccepted: po[10], data: po[11],
      from: {
        phoneNo: po[12], city: po[13].split("|")[0] ? po[13].split("|")[0].trim(" ") : "", state: po[14].split("|")[1] ? po[14].split("|")[1].trim(" ") : "", compName: po[15], pinCode: po[16], panNo: po[17], gstNo: po[18], email: po[19], address: po[20]
      },
      to: {
        phoneNo: po[12], city: po[13].split("|")[0] ? po[13].split("|")[0].trim(" ") : "", state: po[14].split("|")[1] ? po[14].split("|")[1].trim(" ") : "", compName: po[15], pinCode: po[16], panNo: po[17], gstNo: po[18], email: po[19], address: po[20]
      }
    }))
    return res.json({ statuscode: 0, data: resp })
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
    const response = await connection.execute(`update gtdfabricpo a
    set  a.ISACCEPTED= 1
    where a.docid = :poNo`, { poNo })
    connection.commit()

    if (response.rowsAffected === 1) {
      res.json({ statusCode: 0, data: "Purchase Order Approved" })
    } else {
      res.json({ statusCode: 1, data: "PoNo Does not Exist" })
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
      gtdfabricpo.docId AS poNo,
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
      gtdfabricpodet.orderNo,
      gtdfabricpodet.counts,
      gtdfabricpodet.poQty,
      gtdfabricpodet.poRate,gtdfabricpodet.amount,gtdfabricpodet.roll,
      SUM(gtdFabpurInwardDet.grnqty) AS totalGrnQty, 
      gtdFabricpodet.gtdFabricPodetId,
      SUM(gtdFabpurInwardDet.billQty) AS totalBillQty,
      SUM(gtdFabpurInwardDet.balQty) AS totalBalQty
    FROM gtdfabricpodet
    JOIN gtfabricMast ON gtfabricMast.gtfabricMastId =gtdfabricpodet.aliasName
    JOIN gtUnitMast ON gtUnitMast.gtUnitMastId =gtdfabricpodet.uom
    JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtdfabricpodet.fDia
    JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtdfabricpodet.kDia
    JOIN gtLoopMast ON gtLoopMast.gtLoopMastId =gtdfabricpodet.ll
    JOIN gtGgMast ON gtGgMast.gtggMastId =gtdfabricpodet.gg
    JOIN gtGsmMast ON gtGsmMast.gtGsmMastId =gtdfabricpodet.gsm
    JOIN gtDesignMast ON gtDesignMast.gtDesignMastId =gtdfabricpodet.fabDesign
    JOIN gtFabTypeMast ON gtFabTypeMast.gtfabtypeMastId =gtdfabricpodet.fabricType   
    JOIN gtProcessMast ON gtProcessMast.gtProcessMastId =gtdfabricpodet.processName
    LEFT JOIN gtdFabricPo ON gtdFabricPo.gtdfabricPoId =gtdfabricpodet.gtdfabricPoId
    LEFT JOIN gtdFabPurInwardDet ON gtdfabricpodet.gtdfabricpodetId = gtdFabPurInwardDet.DETAILID
    LEFT JOIN gtColorMast ON gtdfabricpodet.fabColor = gtColorMast.gtColorMastId 
    where gtdFabricPo.docId = :poNo
    GROUP BY
  gtdFabricPo.docId,gtdfabricpodet.gtdFabricPodetId, gtFabricMast.fabaliasName, 
  gtColorMast.colorName, 
  gtUnitMast.unitName, gtDiaMast.fDia,  
  gtDiaMast.kDia, gtLoopMast.ll,gtGgMast.gg,    gtGsmMast.gsm,gtDesignMast.design, gtFabTypeMast.fabType,
  gtProcessMast.processName,gtdfabricpodet.orderNo,gtdfabricpodet.counts, gtdfabricpodet.porate,gtdfabricpodet.amount,gtdfabricpodet.roll,gtdFabpurInwardDet.grnqty,
  gtdFabricpodet.gtdFabricPodetId,gtdFabpurInwardDet.billQty,gtdFabpurInwardDet.balQty,
  gtdfabricpodet.poQty
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
    purType,
    GTCOMPMAST.PHONENO,
    GTCOMPMAST.CITYSTATE,
    GTCOMPMAST.COMPNAME1,
    GTCOMPMAST.PINCODE,
    GTCOMPMAST.PANNO,
    GTCOMPMAST.GSTNO,
    GTCOMPMAST.EMAIL,
    GTCOMPMAST.ADDRESS,
    GTCOMPMAST.COMPNAME,
    GTPAYTERMS.PAYTERM,
    CASE WHEN ISACCEPTED = 1 THEN 'true' ELSE 'false' END AS ISACCEPTED,
    DENSE_RANK() OVER (ORDER BY GTDFABRICPOID) SNO
    FROM
    GTDFABRICPO
  JOIN
    GTPAYTERMS ON GTPAYTERMS.GTPAYTERMSID = GTDFABRICPO.PAYTERMS
  JOIN
    GTCOMPMAST ON GTDFABRICPO.SUPPLIER = GTCOMPMAST.COMPNAME
  JOIN GTCOMPMAST COMP ON GTDFABRICPO.COMPCODE = COMP.GTCOMPMASTID
    WHERE
    GTDFABRICPO.DOCID = :poNo
    
  
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
    const poNonGridDetails2 = {
      phoneNo: po[9], city: po[10].split("|")[0] ? po[10].split("|")[0].trim(" ") : "", state: po[10].split("|")[1] ? po[10].split("|")[1].trim(" ") : "", compName: po[11], pinCode: po[12], panNo: po[13], gstNo: po[14], email: po[15], address: po[16]
    }

    return res.json({ statusCode: 0, data: { ...poNonGridDetails, from: { ...poNonGridDetails1 }, to: { ...poNonGridDetails2 }, poDetails: resp, } })
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
    gtdfabricpo.docId AS poNo,
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
     gtdFabricPodet.orderNo,
     gtdfabricpodet.counts,
     gtdFabricPodet.poQty,  
     gtdFabricPodet.poRate,
    gtdFabricPodet.amount,
    gtdfabricpodet.roll,
    SUM(gtdFabpurInwardDet.TOTALGRNQTY) AS totalGrnQty,  
    SUM(gtdFabpurInwardDet.billQty) AS totalBillQty,
    SUM(gtdFabpurInwardDet.balQty) AS totalBalQty,
    gtdFabricpodet.gtdFabricPodetId 
  FROM gtdFabricPodet
  JOIN gtFabricMast ON gtFabricMast.gtfabricMastId = gtdFabricPodet.aliasName
  JOIN gtUnitMast ON gtUnitMast.gtUnitMastId =gtdfabricpodet.uom
  JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtdfabricpodet.fDia
  JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtdfabricpodet.kDia
  JOIN gtLoopMast ON gtLoopMast.gtLoopMastId =gtdfabricpodet.ll
  JOIN gtGgMast ON gtGgMast.gtGgMastId =gtdfabricpodet.gg
  JOIN gtGsmMast ON gtGsmMast.gtGsmMastId =gtdfabricpodet.gsm
  JOIN gtDesignMast ON gtDesignMast.gtDesignMastId =gtdfabricpodet.fabDesign
  JOIN gtFabTypeMast ON gtFabTypeMast.gtfabTypeMastId =gtdfabricpodet.fabricType
  JOIN gtColorMast ON gtColorMast.gtColorMastId = gtdFabricPodet.fabColor
  JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtdFabricPodet.processName
  LEFT JOIN gtdFabricPo ON gtdFabricPo.gtdFabricPoId = gtdFabricPodet.gtdFabricPoId
  LEFT JOIN gtdFabpurInwardDet ON gtdFabricPodet.gtdFabricPodetId = gtdFabpurInwardDet.gtdFabpurInwardDetId
  LEFT JOIN gtgrpBillEntryDet billDet ON billDet.DETAILID = gtdFabpurInwardDet.gtdFabpurInwardDetId
where docId IN (${filterPoItems})
  GROUP BY
    gtdfabricPo.docId, gtdFabricPodet.gtdFabricPodetId, gtFabricMast.fabaliasName, gtColorMast.colorName, gtUnitMast.unitName, gtDiaMast.fDia,  gtDiaMast.kDia, gtLoopMast.ll,gtGgMast.gg,gtGsmMast.gsm,gtDesignMast.design,  gtdfabricpodet.roll, gtFabTypeMast.fabType,gtProcessMast.processName, gtdFabricPodet.orderNo, gtdFabricPodet.counts, gtdFabricPodet.poQty,  gtdFabricPodet.poRate, gtdFabricPodet.amount
    ${billEntryFilter && JSON.parse(billEntryFilter) ?
        'having COALESCE(SUM(gtdFabpurInwardDet.TOTALGRNQTY),0) > 0' : ""
      }
      ${deliveryFilter && JSON.parse(deliveryFilter) ?
        'having gtdFabricPodet.poQty > COALESCE(SUM(gtdFabpurInwardDet.TOTALGRNQTY),0)' : ""
      }
 `
    const result = await connection.execute(sql)

    const resp = result.rows.map(det => ({ poNo: det[0], fabric: det[1], color: det[2], uom: det[3], fDia: det[4], kDia: det[5], ll: det[6], gg: det[7], gsm: det[8], fabricDesign: det[9], fabricType: det[10], processName: det[11], orderNo: det[12], counts: det[13], poQty: det[14], price: det[15], totalAmt: det[16], roll: det[17], agrnQty: det[18], totalBillQty: det[19], totalBalQty: [20], poDetId: det[21], }))


    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await connection.close();
  }
}
