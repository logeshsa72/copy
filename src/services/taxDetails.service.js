import { getConnection } from "../constants/db.connection.js"


export async function get(req, res) {

    const connection = await getConnection(res)
    try {
        const result = await connection.execute(`
      select GTADDDEDID,ADSCHEMEDESC,ADSCHEME from gtaddded
      `)
        const resp = result.rows.map(user => ({ gtAdddedId: user[0], adSchemedesc: user[1], adScheme: user[2] }))
        return res.json({ statusCode: 0, data: resp })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getDetail(req, res) {
    const connection = await getConnection(res);
    try {
        const { taxTemp, taxList } = req.query;
        const taxValues = taxList ? JSON.parse(taxList).join(",") : []
        const sql =
            `
       SELECT XX.GTADDDEDDETAILID,
       XX.NUMBID,
       XX.SF,
       XX.ADTYPE,
       XX.ADFORMULA, 
       XX.ADID,XX.ADPORM,XX.ADSUGGESTIVE,XX.GTADDDEDDETAILROW FROM TAXDET XX 
       WHERE XX.ADSCHEME = '${taxTemp}' AND XX.NUMBID IN (${taxValues})
       UNION
       SELECT XX.GTADDDEDDETAILID,
       XX.NUMBID,
       XX.SF,
       XX.ADTYPE,
       XX.ADFORMULA,
       XX.ADID,XX.ADPORM,XX.ADSUGGESTIVE,XX.GTADDDEDDETAILROW FROM TAXDET XX 
       WHERE XX.ADSCHEME = '${taxTemp}' AND XX.SF = 0
       UNION
       SELECT XX.GTADDDEDDETAILID,
       XX.NUMBID,
       XX.SF,
       XX.ADTYPE,
       XX.ADFORMULA,
       XX.ADID,XX.ADPORM,XX.ADSUGGESTIVE,XX.GTADDDEDDETAILROW FROM TAXDET XX 
       WHERE XX.ADSCHEME = '${taxTemp}' AND XX.SF1 = 0
       UNION
       SELECT XX.GTADDDEDDETAILID,
       XX.NUMBID,
       XX.SF,
       XX.ADTYPE,
       XX.ADFORMULA,
       XX.ADID,XX.ADPORM,XX.ADSUGGESTIVE,XX.GTADDDEDDETAILROW FROM TAXDET XX 
       WHERE XX.ADSCHEME = '${taxTemp}' AND XX.ADSUGGESTIVE = 'Yes'
       ORDER BY 9
       `
        console.log(sql)
        const result = await connection.execute(sql);
        const resp = result.rows.map(t => ({
            gtAdddedDetailId: t[0],
            numId: t[1],
            sf: t[2],
            adType: t[3],
            adFormula: t[4],
            adId: t[5],
            adPorm: t[6],
            adSuggestive: t[7],
            gtAdddedDetailRow: t[8],
        }));
        return res.json({ statusCode: 0, data: resp });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close();
    }
}
