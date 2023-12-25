import bcrypt from "bcrypt"
import { getConnection } from "../constants/db.connection.js";
import { groupUsers } from "../Helpers/userSupplyDetails.js";



export async function login(req, res) {
  const connection = await getConnection(res)
  const { username, password } = req.body
  if (!username) return res.json({ statusCode: 1, message: "Username is Required" })
  if (!password) return res.json({ statusCode: 1, message: "Password is Required" });

  const result = await connection.execute(`SELECT * FROM SPUSERLOG where username=:username`, { username })
  if (result.rows.length === 0) return res.json({ statusCode: 1, message: "Username Doesn't Exist" })
  let storedPassword = result.rows[0][1]
  const isMatched = await bcrypt.compare(password, storedPassword)
  if (!isMatched) return res.json({ statusCode: 1, message: "Password Doesn't Match" })
  let gtCompMastId = result.rows[0][2]
  let supplyDetails = await connection.execute(`
  select pcategory 
  from gtcompprodet 
  join gtpartycatmast on gtcompprodet.partycat = gtpartycatmast.gtpartycatmastid
  where gtcompmastid=:gtCompMastId
  `, { gtCompMastId })
  supplyDetails = supplyDetails.rows.map(item => item[0])

  await connection.close()
  return res.json({ statusCode: 0, message: "Login Sucessfull", data: ({ supplyDetails, gtCompMastId }) })

}

export async function create(req, res) {
  const connection = await getConnection(res)
  const { username, password, gtCompMastId } = req.body;
  if (!username || !password) {
    return res.json({ statusCode: 1, message: 'Username and Password are Required' });
  }
  const userName = await connection.execute('SELECT COUNT(*) as count FROM SPUSERLOG WHERE username = :username', { username })
  console.log(userName, "username")
  if (userName.rows > 0) {
    return res.json({ statusCode: 1, message: "UserName Already Exsist" })
  }


  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const sql = 'INSERT INTO SPUSERLOG(username, password, gtCompMastId) VALUES (:username, :hashedPassword, :gtCompMastId)';

  const bindParams = { username, hashedPassword, gtCompMastId };

  const result = await connection.execute(sql, bindParams)

  connection.commit()
  await connection.close()

  return res.json({ statusCode: 0, data: result })
}

export async function get(req, res) {

  const connection = await getConnection(res)
  try {
    const result = await connection.execute(`
    select spuserlog.userName, spuserlog.gtCompMastId,gtCompMast.compname, pcategory 
    from spuserlog
    join gtCompMast on gtCompMast.gtCompMastId = spuserlog.gtCompMastId
    join (select pcategory, gtcompprodet.gtCompMastId 
    from gtcompprodet 
    join gtpartycatmast on gtcompprodet.partycat = gtpartycatmast.gtpartycatmastid)partyCat on gtCompMast.gtCompMastId = partyCat.gtCompMastId
    order by userName
    `)
    const resp = result.rows.map(user => ({ userName: user[0], gtCompMastId: user[1], compName: user[2], pCategory: user[3] }))
    const output = groupUsers(resp)
    return res.json({ statusCode: 0, data: output })

  }
  catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' });
  }
  finally {
    await connection.close()
  }
}

export async function remove(req, res) {
  const connection = await getConnection.apply(res);
  try {

  }
  catch (err) {

  }
}











