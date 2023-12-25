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
        const { idCardNo , compCode  } = req.params
        if (!idCardNo) return res.json({ statusCode: 1, message: "Bad Request idCardNo is Required" })
        if (!compCode) return res.json({ statusCode: 1, message: "Bad Request compCode is Required" })
        result = await connection.execute(`
        SELECT BB.*,
        (SELECT AA.LOGO FROM EDOCIMAGE AA WHERE BB.COMPCODE=AA.COMPANYID AND AA.IMGNAME='HRAGFGLOGOENG') LOGO FROM
        (
        SELECT DISTINCT A.FNAME,TO_CHAR(B.BUYERDOJ ,'DD/MM/YYYY') DOJ,I.COMPNAME,I.COMPCODE,I.ADDRESS||','||
        J.CITYNAME||'-'||I.PINCODE||','||K.STATENAME||','||L.COUNTRYNAME ADDRESS,B.MIDCARD IDCARD,C.CADD,C.CADD1,
        A.GENDER,A.MOTHERNAME,A.FATHERNAME,A.DOB,A.MARITALSTATUS,D.MNNAME1 DISPNAME,C.CONTACTNO,E.PFNO, E.ESINO,BD.BANDNAME,B.AGEMON
        ,B.AGECHK AGE,K.STATENAME,BE.BNAME,BE.ACNO,B.MIDCARD||'-'||A.FNAME,
        (SELECT SUM(BB.FORMULA)||' /-' TOTSAL FROM HREPINFOMAST AA
        JOIN HREPINFODETAIL BB ON AA.HREPINFOMASTID=BB.HREPINFOMASTID
        WHERE AA.EFFDATE IN (SELECT MAX (AAA.EFFDATE) FROM HREPINFOMAST AAA
        WHERE AAA.IDNO=AA.IDNO AND AA.BUYER = AAA.BUYER )
        AND AA.BUYER='T' AND AA.IDNO=B.IDCARD
        GROUP BY AA.IDNO) WAGES,
        (SELECT SUM(BB.FORMULA) TOTSAL FROM HREPINFOMAST AA
        JOIN HREPINFODETAIL BB ON AA.HREPINFOMASTID=BB.HREPINFOMASTID
        JOIN  HRPAYCOMPONENTS CC ON BB.PAYCODE = CC.HRPAYCOMPONENTSID
        WHERE AA.EFFDATE IN (SELECT MAX (AAA.EFFDATE) FROM HREPINFOMAST AAA
        WHERE AAA.IDNO=AA.IDNO AND AA.BUYER = AAA.BUYER )
        AND AA.BUYER='T' AND AA.IDNO=B.IDCARD AND CC.PAYCODE NOT IN ('BASIC','DA')
        GROUP BY AA.IDNO)  EOTHA,(SELECT SUM(BB.FORMULA) TOTSAL FROM HREPINFOMAST AA
        JOIN HREPINFODETAIL BB ON AA.HREPINFOMASTID=BB.HREPINFOMASTID
        JOIN  HRPAYCOMPONENTS CC ON BB.PAYCODE = CC.HRPAYCOMPONENTSID
        WHERE AA.EFFDATE IN (SELECT MAX (AAA.EFFDATE) FROM HREPINFOMAST AAA
        WHERE AAA.IDNO=AA.IDNO AND AA.BUYER = AAA.BUYER )
        AND AA.BUYER='T' AND AA.IDNO=B.IDCARD AND CC.PAYCODE IN ('BASIC','DA')
        GROUP BY AA.IDNO)   BDA,
        E.DESIGNATION DESIGNATION,J.CITYNAME
        ,im.IMAGEFIELDVALUE,'employee_master' EFORMID
        FROM HREMPLOYMAST A
        JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID=B.HREMPLOYMASTID
        JOIN GTDEPTDESGMAST D ON  D.GTDEPTDESGMASTID=B.DEPTNAME
        JOIN GTDESIGNATIONMAST E ON  E.GTDESIGNATIONMASTID=B.DESIGNATION
        JOIN GTCOMPMAST I ON I.GTCOMPMASTID=A.COMPCODE
        JOIN GTCITYMAST J ON I.CITY=J.GTCITYMASTID
        JOIN GTSTATEMAST K ON K.GTSTATEMASTID=I.STATE
        JOIN GTCOUNTRYMAST L ON L.GTCOUNTRYMASTID=I.COUNTRY
        left JOIN HRECONTACTDETAILS  C ON C.HREMPLOYMASTID=A.HREMPLOYMASTID
        left JOIN HREMPINFDETAILS  E ON E.HREMPLOYMASTID=A.HREMPLOYMASTID
        JOIN  HRBANDMAST BD ON BD.HRBANDMASTID=B.BAND
        left JOIN HREBankDetails BE ON A.HREMPLOYMASTID=BE.HREMPLOYMASTID
        LEFT OUTER JOIN GTCOMPMASTIMAGE X ON X.GTCOMPMASTID=I.GTCOMPMASTID
        left join (SELECT A.HREMPLOYMASTID,MAX(A.IMAGEFIELDVALUE) IMAGEFIELDVALUE FROM  HREMPLOYMASTIMAGE A GROUP BY A.HREMPLOYMASTID) im on im.HREMPLOYMASTID=A.HREMPLOYMASTID
        WHERE B.IDCARD=:IDCARD AND I.COMPCODE=:COMPCODE1
         ) BB
        `, { IDCARD: idCardNo, COMPCODE1: compCode });
        return res.json({ statusCode: 0, data: result.rows.length === 0 ? null :  result.rows[0] })
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