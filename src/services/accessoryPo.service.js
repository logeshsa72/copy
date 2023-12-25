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
    const sql = `SELECT
    gtaccpo.ACCPONO AS poNo,
    gtaccpo.ACCPODate,
    gtaccpo.supplier,
    gtaccpo.delto,
    gtaccpo.duedate,
    gtaccpo.grossamount,
    gtaccpo.netamount,
    gtaccpo.appstatus,
    gtaccpo.totalqty,
    gtaccpo.PTYPE,
    gtpayterms.payterm,
    CASE WHEN gtaccpo.isAccepted = 1 THEN 'true' ELSE 'false' END AS isAccepted,
    DENSE_RANK() OVER (ORDER BY gtaccpo.gtaccpoid) AS sno,
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
    c.address,
    gtprocessmast.processName
FROM
    gtaccpodet 
JOIN
    gtaccpo ON gtaccpo.GTACCPOID = gtaccpodet.GTACCPOID
JOIN
    gtpayterms ON gtpayterms.gtpaytermsid = gtaccpo.payterms
JOIN
    gtcompmast ON gtaccpo.supplier = gtcompmast.compname1
JOIN
    gtcompmast ON gtaccpo.supplier = gtcompmast.compname
JOIN
    gtcompmast c ON gtaccpo.delto = c.compname1
JOIN 
    gtprocessmast ON gtprocessmast.GTPROCESSMASTID = gtaccpo.purchtype1  
WHERE
    gtcompmast.gtcompmastid = :gtCompMastId
    AND upper(ACCPONO) LIKE :searchPoNo
    AND upper(delto) LIKE :searchPodelto
    AND TO_CHAR(ACCPODATE, 'dd-mm-yyyy') LIKE :searchPoDate 
    AND upper(supplier) LIKE :searchPosupplier
    AND TO_CHAR(duedate, 'dd-mm-yyyy') LIKE :searchPoduedate
    ${deliveryFilter ? `and gtaccpo.accpoNo in (select distinct po.accpoNo
      from gtaccpodet det
      join gtaccpo po on det.gtaccpoid = po.gtaccpoid
      where det.TOTALGRNQTY < det.poQty)
      ` : ""}
    ${isAccepted ?
        `AND gtaccpo.isAccepted = CASE WHEN :isAccepted = 'true' THEN 1 ELSE 0 END`
        :
        ""}
        GROUP BY gtaccpo.ACCPONO ,
        gtaccpo.ACCPODATE,
        gtaccpo.supplier,
        gtaccpo.delto,
        gtaccpo.duedate,
        gtaccpo.grossamount,
        gtaccpo.netamount,
        gtaccpo.appstatus,
        gtaccpo.totalqty,
        gtaccpo.PTYPE,
        gtpayterms.payterm,
        gtaccpo.isAccepted,
        gtaccpo.gtaccpoid,
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
        c.address,
        gtprocessmast.processName
        order by poNo
     `
    const result = await connection.execute(sql, { ...bindVar })
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
      },
      purchaseGoodsType: po[29],
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
    const response = await connection.execute(`update gtaccpo a
    set  a.ISACCEPTED= 1
    where a.ACCPONO = :poNo`, { poNo })
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

    const sql = `SELECT
    gtaccpo.accpoNo AS poNo,
    gtaccmast.accname,
    gtColorMast.colorName,
    gtProcessMast.processName,
    gtaccpodet.orderNo,
    gtaccpodet.poQty,
    gtaccpodet.porate,
    gtaccpodet.amount,
    SUM(gtaccpoInwardDtl.grnqty) AS totalGrnQty,
    SUM(gtaccpoInwardDtl.billQty) AS totalBillQty,
    gtaccpodet.gtaccpodetid
    FROM gtaccpodet
    JOIN gtaccmast ON gtaccmast.gtaccmastId = gtaccpodet.ACCNAME2
    JOIN gtColorMast ON gtColorMast.gtColorMastId = gtaccpodet.ACCCOLOR
    JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtaccpodet.PURCHTYPE
    LEFT JOIN gtaccpo ON gtaccpo.gtaccpoId = gtaccpodet.gtaccpoId
    LEFT JOIN gtaccpoinwarddtl ON gtaccpodet.gtaccpodetId = gtaccpoInwardDtl.gtaccpodetId  
    where gtaccpo.accpoNo = :poNo
    GROUP BY
    gtaccpo.accpoNo, gtaccpodet.gtaccpodetId, gtaccmast.accname, gtColorMast.colorName, 
    gtProcessMast.processName, gtaccpodet.orderNo, gtaccpodet.poQty, 
    gtaccpodet.porate,gtaccpodet.amount
    `
    const result = await connection.execute(sql, { poNo },
    )
    const resp = result.rows.map(det => ({
      poNo: det[0], accessory: det[1], color: det[2], processName: det[3], orderNo: det[4],
      poQty: det[5],
      porate: det[6],
      totalAmt: det[7],
      agrnQty: det[8],
      totalBillQty: det[9],
      poDetId: det[10]
    }))

    const result1 = await connection.execute(`
    SELECT
    accpoNo AS PONO,
    ACCPODATE,
    SUPPLIER,
    DELTO,
    DUEDATE,
    GROSSAMOUNT,
    NETAMOUNT,
    APPSTATUS,
    TOTALQTY,
    PURCHTYPE1,
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
    DENSE_RANK() OVER (ORDER BY gtaccpoID) SNO
    FROM
    gtaccpo
  JOIN
    GTPAYTERMS ON GTPAYTERMS.GTPAYTERMSID = gtaccpo.PAYTERMS
  JOIN
    GTCOMPMAST ON gtaccpo.SUPPLIER = GTCOMPMAST.COMPNAME
  JOIN GTCOMPMAST C ON gtaccpo.DELTO = C.COMPNAME1
  JOIN GTCOMPMAST COMP ON gtaccpo.COMPCODE = COMP.GTCOMPMASTID
    WHERE
    gtaccpo.accpoNo = :poNo
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
    gtaccpo.accpoNo AS poNo,
    gtaccmast.accname,
    gtColorMast.colorName,
    gtProcessMast.processName,
    gtaccpodet.orderNo,
    gtaccpodet.poQty,
    gtaccpodet.porate,
    gtaccpodet.amount,
    SUM(gtaccpoInwardDtl.grnqty) AS totalGrnQty,
    SUM(gtaccpoInwardDtl.billQty) AS totalBillQty,
    gtaccpodet.gtaccpodetid
    FROM gtaccpodet
    JOIN gtaccmast ON gtaccmast.gtaccmastId = gtaccpodet.ACCNAME2
    JOIN gtColorMast ON gtColorMast.gtColorMastId = gtaccpodet.ACCCOLOR
    JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtaccpodet.PURCHTYPE
    LEFT JOIN gtaccpo ON gtaccpo.gtaccpoId = gtaccpodet.gtaccpoId
    LEFT JOIN gtaccpoinwarddtl ON gtaccpodet.gtaccpodetId = gtaccpoInwardDtl.gtaccpodetId
    where accpoNo IN (${filterPoItems})
    GROUP BY
    gtaccpo.accpoNo, gtaccpodet.gtaccpodetId, gtaccmast.accname, gtColorMast.colorName, 
    gtProcessMast.processName, gtaccpodet.orderNo, gtaccpodet.poQty, 
    gtaccpodet.porate,gtaccpodet.amount
    ${billEntryFilter && JSON.parse(billEntryFilter) ?
        'having COALESCE(SUM(gtaccpoInwardDtl.TOTALGRNQTY),0) > 0' : ""
      }
    ${deliveryFilter && JSON.parse(deliveryFilter) ?
        'having gtaccpodet.poQty > COALESCE(SUM(gtaccpoInwardDtl.TOTALGRNQTY),0)' : ""
      }
 `
    const result = await connection.execute(sql)

    const resp = result.rows.map(det => ({
      poNo: det[0],
      accessory: det[1],
      color: det[2],
      processName: det[3],
      orderNo: det[4],
      poQty: det[5],
      porate: det[6],
      totalAmt: det[7],
      aDelQty: det[8],
      aBillQty: det[9],
      poDetId: det[10]
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await connection.close();
  }
}