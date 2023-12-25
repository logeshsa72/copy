import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
  const connection = await getConnection(res)

  try {
    const { gtCompMastId, searchPoNo, searchPosupplier, searchPoDate, searchPoduedate, searchPodelto, isAccepted, deliveryFilter } = req.query;


    const bindVar = {
      gtCompMastId,
      searchPoDate: `%${searchPoDate ? searchPoDate : ""}%`,
      searchPoNo: `%${searchPoNo ? searchPoNo.toUpperCase() : ""}%`,
      searchPosupplier: `%${searchPosupplier ? searchPosupplier.toUpperCase() : ""}%`,
      searchPoduedate: `%${searchPoduedate ? searchPoduedate : ""}%`,
      searchPodelto: `%${searchPodelto ? searchPodelto.toUpperCase() : ""}%`,
    }
    if (isAccepted) {
      bindVar["isAccepted"] = isAccepted
    }

    const result = await connection.execute(`
    SELECT
    gtyarnpo.docid AS poNo,
    gtyarnpo.docDate,
    gtyarnpo.supplier,
    gtyarnpo.delto,
    gtyarnpo.duedate,
    gtyarnpo.grossamount,
    gtyarnpo.netamount,
    gtyarnpo.appstatus,
    gtyarnpo.totalqty,
    gtyarnpo.purtype,
    gtpayterms.payterm,
    CASE WHEN gtyarnpo.isAccepted = 1 THEN 'true' ELSE 'false' END AS isAccepted,
    DENSE_RANK() OVER (ORDER BY gtyarnpo.gtyarnpoid) AS sno,
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
    gtyarnpodet 
JOIN
    gtyarnpo ON gtyarnpo.gtyarnpoid = gtyarnpodet.GTYARNPOID
JOIN
    gtpayterms ON gtpayterms.gtpaytermsid = gtyarnpo.payterms
JOIN
    gtcompmast ON gtyarnpo.supplier = gtcompmast.compname1
JOIN
    gtcompmast ON gtyarnpo.supplier = gtcompmast.compname
JOIN
    gtcompmast c ON gtyarnpo.delto = c.compname1
WHERE
    gtcompmast.gtcompmastid = :gtcompmastid
    AND upper(docId) LIKE :searchPoNo
    AND upper(delto) LIKE :searchPodelto
    AND TO_CHAR(docdate, 'dd-mm-yyyy') LIKE :searchPoDate 
    AND upper(supplier) LIKE :searchPosupplier
    AND TO_CHAR(duedate, 'dd-mm-yyyy') LIKE :searchPoduedate
    ${deliveryFilter ? `and gtyarnpo.docid in (select distinct po.docid
      from gtyarnpodet det
      join gtyarnpo po on det.gtyarnpoid = po.gtyarnpoid
      where det.TOTALGRNQTY < det.poQty)
      ` : ""}
    ${isAccepted ?
        `AND gtYarnPo.isAccepted = CASE WHEN :isAccepted = 'true' THEN 1 ELSE 0 END`
        :
        ""}
        GROUP BY gtyarnpo.docid ,
        gtyarnpo.docDate,
        gtyarnpo.supplier,
        gtyarnpo.delto,
        gtyarnpo.duedate,
        gtyarnpo.grossamount,
        gtyarnpo.netamount,
        gtyarnpo.appstatus,
        gtyarnpo.totalqty,
        gtyarnpo.purtype,
        gtpayterms.payterm,
        gtyarnpo.isAccepted,
        gtyarnpo.gtyarnpoid,
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
        c.compname1,
        c.pincode,
        c.panno,
        c.gstno,
        c.email, 
        c.address
        order by poNo
     `, { ...bindVar })


    let resp = result.rows.map(po => ({
      poNo: po[0], poDate: po[1], yarnAgentName: po[2], deliveryTo: po[3], expDate: po[4],
      grossAmount: po[5], netAmount: po[6], status: po[7], payterms: po[10], totalQty: po[8], purchaseType: po[9],
      isAccepted: JSON.parse(po[11]), data: po[12],
      from: {
        phoneNo: po[13], city: po[14].split("|")[0] ? po[14].split("|")[0].trim(" ") : "", state: po[14].split("|")[1] ? po[14].split("|")[1].trim(" ") : "", compName: po[15], pinCode: po[16], panNo: po[17], gstNo: po[18], email: po[19], address: po[20]
      },
      to: {
        phoneNo: po[21], city: po[22].split("|")[0].trim(" ") ? po[22].split("|")[0].trim(" ") : "", state: po[22].split("|")[1] ? po[22].split("|")[1].trim(" ") : "", compName: po[23],
        pinCode: po[24], panNo: po[25], gstNo: po[26], email: po[27], address: po[28]
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
    const response = await connection.execute(`update gtyarnpo a
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
      gtYarnPo.docId AS poNo,gtYarnMaster.yarnName,gtColorMast.colorName,gtProcessMast.processName,gtyarnpodet.orderNo,gtyarnpodet.noOfBags,gtyarnpodet.poQty,gtyarnpodet.bagWt,gtyarnpodet.price,gtyarnpodet.amount,
      SUM(gtYarnPoInwardDet.grnqty) AS totalGrnQty,
      SUM(gtYarnPoInwardDet.grnbags) AS totalGrnBags
      ,gtyarnpodet.gtYarnPodetId,
      SUM(gtYarnPoInwardDet.billQty) AS totalBillQty
    FROM gtyarnpodet
    JOIN gtYarnMaster ON gtYarnMaster.gtYarnMasterId = gtyarnpodet.yarnName
    JOIN gtColorMast ON gtColorMast.gtColorMastId = gtyarnpodet.color
    JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtyarnpodet.processName
    LEFT JOIN gtYarnPo ON gtYarnPo.gtyarnPoId = gtyarnpodet.gtyarnPoId
    LEFT JOIN gtYarnPoInwardDet ON gtyarnpodet.gtyarnpodetId = gtYarnPoInwardDet.gtyarnpodetId  
    where gtYarnPo.docId = :poNo
    GROUP BY
      gtYarnPo.docId, gtyarnpodet.gtYarnPodetId, gtYarnMaster.yarnName, gtColorMast.colorName, gtProcessMast.processName, gtyarnpodet.orderNo, gtyarnpodet.noOfBags, gtyarnpodet.poQty, gtyarnpodet.bagWt, gtyarnpodet.price,gtyarnpodet.amount
         `, { poNo },
    )
    console.log(result)
    const resp = result.rows.map(det => ({ poNo: det[0], yarn: det[1], color: det[2], processName: det[3], orderNo: det[4], poBags: det[5], poQty: det[6], bagWeight: det[7], price: det[8], totalAmt: det[9], agrnQty: det[10], agrnBag: det[11], poDetId: det[12], totalBillQty: det[13] }))

    const result1 = await connection.execute(`
    SELECT
    DOCID AS PONO,
    DOCDATE,
    SUPPLIER,
    DELTO,
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
    C.PHONENO,
    C.CITYSTATE,
    C.COMPNAME1 DELTO,
    C.PINCODE,
    C.PANNO,
    C.GSTNO,
    C.EMAIL,
    C.ADDRESS,
    COMP.COMPNAME,
    GTPAYTERMS.PAYTERM,
    CASE WHEN ISACCEPTED = 1 THEN 'true' ELSE 'false' END AS ISACCEPTED,
    DENSE_RANK() OVER (ORDER BY GTYARNPOID) SNO
    FROM
    GTYARNPO
  JOIN
    GTPAYTERMS ON GTPAYTERMS.GTPAYTERMSID = GTYARNPO.PAYTERMS
  JOIN
    GTCOMPMAST ON GTYARNPO.SUPPLIER = GTCOMPMAST.COMPNAME
  JOIN GTCOMPMAST C ON GTYARNPO.DELTO = C.COMPNAME1
  JOIN GTCOMPMAST COMP ON GTYARNPO.COMPCODE = COMP.GTCOMPMASTID
    WHERE
    GTYARNPO.DOCID = :poNo
    
  
   `, { poNo })

    const po = result1.rows[0];


    const poNonGridDetails = {

      poNo: po[0], poDate: po[1], yarnAgentName: po[2], delieveryTo: po[3], expDate: po[4],
      grossAmount: po[5], netAmount: po[6], status: po[7], payterms: po[10], totalQty: po[8], purchaseType: po[9], payTerm: po[27], compName: po[26],
      isAccepted: JSON.parse(po[28])
    };
    const poNonGridDetails1 = {
      phoneNo: po[10], city: po[11].split("|")[0].trim(" "), state: po[11].split("|")[1].trim(" "), compName: po[12], pinCode: po[13], panNo: po[14], gstNo: po[15], email: po[16], address: po[17]
    }
    const poNonGridDetails2 = {
      phoneNo: po[18], city: po[19].split("|")[0].trim(" "), state: po[19].split("|")[1].trim(" "), compName: po[20], pinCode: po[21], panNo: po[22], gstNo: po[23], email: po[24], address: po[25]
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
    const sql = `
    SELECT
    gtYarnPo.docId AS poNo,
    gtYarnMaster.yarnName,
     gtColorMast.colorName,
     gtProcessMast.processName,
     gtyarnpodet.orderNo,
     gtyarnpodet.noOfBags,
     gtyarnpodet.poQty,
     gtyarnpodet.bagWt,
     gtyarnpodet.price,
    gtyarnpodet.amount,
    SUM(gtYarnPoInwardDet.TOTALGRNQTY) AS totalGrnQty,
    SUM(billDet.billQty) AS totalBillQty,
    gtyarnpodet.gtYarnPodetId
  FROM gtyarnpodet
  JOIN gtYarnMaster ON gtYarnMaster.gtYarnMasterId = gtyarnpodet.yarnName
  JOIN gtColorMast ON gtColorMast.gtColorMastId = gtyarnpodet.color
  JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtyarnpodet.processName
  LEFT JOIN gtYarnPo ON gtYarnPo.gtyarnPoId = gtyarnpodet.gtyarnPoId
  LEFT JOIN gtYarnPoInwardDet ON gtyarnpodet.gtyarnpodetId = gtYarnPoInwardDet.gtyarnpodetId
  LEFT JOIN gtgrpBillEntryDet billDet ON billDet.DETAILID = gtYarnPoInwardDet.gtyarnpodetId
where docId IN (${filterPoItems})
  GROUP BY
    gtYarnPo.docId, gtyarnpodet.gtYarnPodetId, gtYarnMaster.yarnName, gtColorMast.colorName, gtProcessMast.processName, gtyarnpodet.orderNo, gtyarnpodet.noOfBags, gtyarnpodet.poQty, gtyarnpodet.bagWt, gtyarnpodet.price, gtyarnpodet.amount
    ${billEntryFilter && JSON.parse(billEntryFilter) ?
        'having COALESCE(SUM(gtYarnPoInwardDet.TOTALGRNQTY),0) > 0' : ""
      }
      ${deliveryFilter && JSON.parse(deliveryFilter) ?
        'having gtyarnpodet.poQty > COALESCE(SUM(gtYarnPoInwardDet.TOTALGRNQTY),0)' : ""
      }
 `
    console.log(sql)
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