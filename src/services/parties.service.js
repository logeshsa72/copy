import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
  const connection = await getConnection(res)

  try {
    const query = "select  gtcompmastid,compname from gtcompmast where ptransaction = 'PARTY'"
    const result = await connection.execute(query);

    const resp = result.rows.map(user => ({ gtCompMastId: user[0], partyName: user[1], }))
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