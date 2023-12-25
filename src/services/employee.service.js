import { createRequire } from "module";
const require = createRequire(import.meta.url);
const oracledb = require('oracledb');
oracledb.initOracleClient({ libDir: "C:\\oracle\\instantclient_19_20" });
// hr schema password
var password = 'PSSPAYROLL_APR2023'

export async function get(req, res) {
    let connection;
    let result;
    try {
        connection = await oracledb.getConnection({
            user: "PSSPAYROLL",
            password: password,
            connectString: "103.130.205.178:1555/AN01P"
        });
        // run query to get employee with employee_id
        const { compCode } = req.params
        if (!compCode) return res.json({ statusCode: 1, message: "Bad Request UserId is Required" })
        result = await connection.execute(`
        SELECT DISTINCT A.IDCARD,C.COMPCODE
        FROM GTEMPMAST A
        JOIN GTEMPCOMPDET B ON A.GTEMPMASTID=B.GTEMPMASTID
        JOIN GTCOMPMAST C ON B.EMPCOMP=C.GTCOMPMASTID
        WHERE C.COMPCODE = :compCode
        ORDER BY 1 ASC
        `, { compCode });
        // if (result.rows.length === 0) return res.json({ statusCode: 1, message: "UserName Doesn't Exists" });
        return res.json({ statusCode: 0, data: result.rows.flatMap(i => i[0]) })
    } catch (err) {
        //send error message
        return res.json(err.message);
    } finally {
        if (connection) {
            try {
                // Always close connections
                await connection.close();
            } catch (err) {
                return console.error(err.message);
            }
        }
    }
}