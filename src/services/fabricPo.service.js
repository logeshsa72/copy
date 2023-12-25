import { getConnection } from "../constants/db.connection.js";


export async function get(req, res) {
  const connection = await getConnection(res)

  try {
    const { gtCompMastId } = req.query;
    const result = await connection.execute(`select docId, docDate, supplier, totalQty, grossAmount, netAmount, appstatus,  gtPayTerms.payTerm from gtFabricPo
        join gtPayTerms on gtPayTerms.gtpayTermsId = gtFabricPo.PAYTERMS
        join gtCompMast on gtCompMast.compName1 = gtFabricPo.supplier
        where gtCompMast.gtCompMastId = :gtCompMastId
         `, { gtCompMastId })
    const resp = result.rows.map(po => ({ poNo: po[0], poDate: po[1], supplier: po[2], totalQty: po[3], grossAmount: po[4], netAmount: po[5], status: po[6], payTerm: po[7] }))
    return res.json({ statuscode: 0, data: resp })

  }
  catch (err) {
    console.log("Error Retriving Data: ", err);
    res.status(500).json({ error: "Internal Server Error" })
  }
  finally {
    await connection.close()
  }

}

export async function acceptPo(req, res) {
  const connection = await getConnection(res)
  try {
    const { poNo } = req.query
    const response = await connection.execute(`update gtFabricpo a
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