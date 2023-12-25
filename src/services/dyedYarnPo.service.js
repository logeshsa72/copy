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
    SELECT 
    docid AS poNo,
    docdate,
    supplier,
    duedate,
    grossamount,
    netamount,
    appstatus, 
    totalqty,
    purtype, 
    gtpayterms.payterm,
    CASE WHEN gtdyarnpo.isAccepted = 1 THEN 'true' ELSE 'false' END AS isAccepted,
    DENSE_RANK() OVER (ORDER BY gtdyarnpo.gtdyarnpoid) AS sno, 
    gtcompmast.phoneno,
    gtcompmast.citystate,
    gtcompmast.compname,
    gtcompmast.pincode,
    gtcompmast.panno,
    gtcompmast.gstno,
    gtcompmast.email,
    gtcompmast.address    
  FROM 
    gtdyarnpo
  JOIN 
    gtpayterms ON gtpayterms.gtpaytermsid = gtdyarnpo.payterms  
  JOIN 
    gtcompmast ON gtdyarnpo.supplier = gtcompmast.compname
  WHERE 
    gtcompmast.gtcompmastid = :gtCompMastId
    AND UPPER(docid) LIKE :searchPoNo
    AND TO_CHAR(docdate, 'dd-mm-yyyy') LIKE :searchPoDate 
    AND UPPER(supplier) LIKE :searchPosupplier
    AND TO_CHAR(duedate, 'dd-mm-yyyy') LIKE :searchPoduedate
    ${deliveryFilter ? `and gtdyarnpo.docid in (select distinct po.docid
      from gtdyarnpodet det
      join gtdyarnpo po on det.gtdyarnpoid = po.gtdyarnpoid
      where det.TOTALGRNQTY < det.poQty)
      ` : ""}
    ${isAccepted ?
      `AND gtdyarnpo.isAccepted = CASE WHEN :isAccepted = 'true' THEN 1 ELSE 0 END`
      :
      ""}  
  GROUP BY 
    gtdyarnpo.docid,
    gtdyarnpo.docdate,
    gtdyarnpo.supplier,
    gtdyarnpo.duedate,
    gtdyarnpo.grossamount,
    gtdyarnpo.netamount,
    gtdyarnpo.appstatus,
    gtdyarnpo.totalqty,
    gtdyarnpo.purtype,
    gtpayterms.payterm,
    gtdyarnpo.isAccepted,
    gtdyarnpo.gtdyarnpoid,
    gtcompmast.phoneno,
    gtcompmast.citystate,
    gtcompmast.compname,
    gtcompmast.pincode,
    gtcompmast.panno,
    gtcompmast.gstno,
    gtcompmast.email,
    gtcompmast.address
  ORDER BY 
    poNo
  
   `, { ...bindVar })
        console.log(result,'result')
    const resp = result.rows.map(po => ({ poNo: po[0], poDate: po[1], supplier: po[2], dueDate: po[3], grossAmount: po[4], netAmount: po[5], status: po[6], totalQty: po[7], purType: po[8],payTerm: po[9],isAccepted: po[10],
      from: {
        phoneNo: po[11], city: po[13].split("|")[0] ? po[13].split("|")[0].trim(" ") : "", state: po[13].split("|")[1] ? po[13].split("|")[1].trim(" ") : "", compName: po[14], pinCode: po[15], panNo: po[16], gstNo: po[17], email: po[18], address: po[19]
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
    const response = await connection.execute(`update gtdyarnpo a
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
      gtdYarnPo.docId AS poNo,
      gtYarnMaster.yarnName,
      gtColorMast.colorName,
      gtProcessMast.processName,
      gtdyarnpodet.orderNo,
      gtdyarnpodet.noOfBags,
      gtdyarnpodet.poQty,
     gtdyarnpodet.bagWt,gtdyarnpodet.price,gtdyarnpodet.amount,
      SUM(gtdYarnPoInwardDet.grnqty) AS totalGrnQty,
      SUM(gtdYarnPoInwardDet.grnbags) AS totalGrnBags
      ,gtdyarnpodet.gtdYarnPodetId,
      SUM(gtdYarnPoInwardDet.billQty) AS totalBillQty
    FROM gtdyarnpodet
    JOIN gtYarnMaster ON gtYarnMaster.gtYarnMasterId =gtdyarnpodet.yarnName
    JOIN gtColorMast ON gtColorMast.gtColorMastId =gtdyarnpodet.color
    JOIN gtProcessMast ON gtProcessMast.gtProcessMastId =gtdyarnpodet.processName
    LEFT JOIN gtdYarnPo ON gtdYarnPo.gtdyarnPoId =gtdyarnpodet.gtdyarnPoId
    LEFT JOIN gtdYarnPoInwardDet ON gtdyarnpodet.gtdyarnpodetId = gtdYarnPoInwardDet.gtdyarnpodetId  
    where gtdYarnPo.docId = :poNo
    GROUP BY
      gtdYarnPo.docId,gtdyarnpodet.gtdYarnPodetId, gtYarnMaster.yarnName, gtColorMast.colorName, gtProcessMast.processName,gtdyarnpodet.orderNo,gtdyarnpodet.noOfBags,gtdyarnpodet.poQty,gtdyarnpodet.bagWt,gtdyarnpodet.price,gtdyarnpodet.amount
         `, { poNo },
    )

    const resp = result.rows.map(det => ({ poNo: det[0], yarn: det[1], color: det[2], processName: det[3], orderNo: det[4], poBags: det[5], poQty: det[6], bagWeight: det[7], price: det[8], totalAmt: det[9], agrnQty: det[10], agrnBag: det[11], poDetId: det[12], totalBillQty: det[13] }))

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
    DENSE_RANK() OVER (ORDER BY GTDYARNPOID) SNO
    FROM
    GTDYARNPO
  JOIN
    GTPAYTERMS ON GTPAYTERMS.GTPAYTERMSID = GTDYARNPO.PAYTERMS
  JOIN
    GTCOMPMAST ON GTDYARNPO.SUPPLIER = GTCOMPMAST.COMPNAME
  JOIN GTCOMPMAST COMP ON GTDYARNPO.COMPCODE = COMP.GTCOMPMASTID
    WHERE
    GTDYARNPO.DOCID = :poNo
    
  
   `, { poNo })

    const po = result1.rows[0];


    const poNonGridDetails = {

      poNo: po[0], poDate: po[1], yarnAgentName: po[2],expDate: po[3],
      grossAmount: po[4], netAmount: po[5], status: po[6], totalQty: po[7], purchaseType: po[8], payTerm: po[18], compName: po[17],
      isAccepted: JSON.parse(po[19])
    };
    const poNonGridDetails1 = {
      phoneNo: po[9],  city: po[10].split("|")[0] ? po[10].split("|")[0].trim(" ") : "", state: po[10].split("|")[1] ? po[10].split("|")[1].trim(" ") : "", compName: po[11], pinCode: po[12], panNo: po[13], gstNo: po[14], email: po[15], address: po[16]
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
    const sql = `
    SELECT
    gtdYarnPo.docId AS poNo,
    gtYarnMaster.yarnName,
     gtColorMast.colorName,
     gtProcessMast.processName,
     gtdYarnPodet.orderNo,
     gtdYarnPodet.noOfBags,
     gtdYarnPodet.poQty,
     gtdYarnPodet.bagWt,
     gtdYarnPodet.price,
    gtdYarnPodet.amount,
    SUM(gtdYarnPoInwardDet.TOTALGRNQTY) AS totalGrnQty,
    SUM(billDet.billQty) AS totalBillQty,
    gtdYarnPodet.gtdYarnPodetId
  FROM gtdYarnPodet
  JOIN gtYarnMaster ON gtYarnMaster.gtYarnMasterId = gtdYarnPodet.yarnName
  JOIN gtColorMast ON gtColorMast.gtColorMastId = gtdYarnPodet.color
  JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtdYarnPodet.processName
  LEFT JOIN gtdYarnPo ON gtdYarnPo.gtdYarnPoId = gtdYarnPodet.gtdYarnPoId
  LEFT JOIN gtdYarnPoInwardDet ON gtdYarnPodet.gtdYarnPodetId = gtdYarnPoInwardDet.gtdYarnPodetId
  LEFT JOIN gtgrpBillEntryDet billDet ON billDet.DETAILID = gtdYarnPoInwardDet.gtdYarnPodetId
where docId IN (${filterPoItems})
  GROUP BY
    gtdYarnPo.docId, gtdYarnPodet.gtdYarnPodetId, gtYarnMaster.yarnName, gtColorMast.colorName, gtProcessMast.processName, gtdYarnPodet.orderNo, gtdYarnPodet.noOfBags, gtdYarnPodet.poQty, gtdYarnPodet.bagWt, gtdYarnPodet.price, gtdYarnPodet.amount
    ${billEntryFilter && JSON.parse(billEntryFilter) ?
      'having COALESCE(SUM(gtdYarnPoInwardDet.TOTALGRNQTY),0) > 0' : ""
    }
    ${deliveryFilter && JSON.parse(deliveryFilter) ?
      'having gtdyarnpodet.poQty > COALESCE(SUM(gtdYarnPoInwardDet.TOTALGRNQTY),0)' : ""
    }
    
 `
   
    const result = await connection.execute(sql)

    const resp = result.rows.map(det => ({
      poNo: det[0],
      yarn: det[1],
      color: det[2],
      processName: det[3],
      orderNo: det[4],
      poBags: det[5],
      poQty: det[6],
      bagWeight: det[7],
      price: det[8],
      totalAmt: det[9],
      aDelQty: det[10],
      aBillQty: det[11],
      poDetId: det[12]
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await connection.close();
  }
}
