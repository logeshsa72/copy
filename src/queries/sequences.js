import { COMPCODE, DYED_FABRIC_PURCHASE_INWARD_VIEW_ID, GYPI_CODE,DFPI_CODE,DYPI_CODE, DPB_CODE,PROJECTID, YARN_PURCHASE_BILL_ENTRY_VIEW_ID, YARN_PURCHASE_INWARD_VIEW_ID, YPB_CODE, GFPI_CODE, DYEDYARN_PURCHASE_INWARD_VIEW_ID, DYEDYARN_PURCHASE_BILL_ENTRY_VIEW_ID, GREY_FABRIC_PURCHASE_INWARD_VIEW_ID, DYED_FABRIC_PURCHASE_BILL_ENTRY_VIEW_ID, DFPB_CODE } from "../constants/defaultQueryValues.js";

import { getCompCodeFromId } from "./compCode.js";
import { getCurrentFinancialYearIdAndCode } from "./financialYear.js";
import { updateDocId } from "./general.js";

export async function getNextGreyYarnPoInwardNo(connection) {
    const { finyearCode, finYearId } = await getCurrentFinancialYearIdAndCode(connection)
    const compCode = await getCompCodeFromId(connection)
    const sql = `
    select * from 
    (select ypoino 
    from gtyarnpoinward 
    where ttype = 'INWARD' and compcode = '${COMPCODE}' and finYear = '${finYearId}' and projectid = '${PROJECTID}'
    order by ypoino desc) 
    where rownum = 1
    `
    const result = await connection.execute(sql)
    let nextVal;
    if (result.rows.length === 0) {
        nextVal = "1".padStart(6, "0")
    } else {
        let prev = result.rows[0][0]
        nextVal = new String(parseInt(prev.split("-")[2]) + 1).padStart(6, "0")
    }
    await updateDocId(connection, YARN_PURCHASE_INWARD_VIEW_ID, nextVal, GYPI_CODE)
    const newDocId = `${compCode}/${finyearCode}/${GYPI_CODE}-${nextVal}`
    return newDocId
}

export async function getNextDyeddYarnPoInwardNo(connection) {
    const { finyearCode, finYearId } = await getCurrentFinancialYearIdAndCode(connection)
    const compCode = await getCompCodeFromId(connection)
    const sql = `
    select * from 
    (select ypoino 
    from gtdyarnpoinward 
    where ttype = 'INWARD' and compcode = '${COMPCODE}' and finYear = '${finYearId}' and projectid = '${PROJECTID}'
    order by ypoino desc) 
    where rownum = 1
    `
    const result = await connection.execute(sql)
    let nextVal;
    if (result.rows.length === 0) {
        nextVal = "1".padStart(6, "0")
    } else {
        let prev = result.rows[0][0]
        nextVal = new String(parseInt(prev.split("-")[2]) + 1).padStart(6, "0")
    }
    await updateDocId(connection, DYEDYARN_PURCHASE_INWARD_VIEW_ID, nextVal, DYPI_CODE)
    const newDocId = `${compCode}/${finyearCode}/${DYPI_CODE}-${nextVal}`
    return newDocId
}


export async function getNextGreyYarnPoInvoiceNo(connection) {
    const { finyearCode, finYearId } = await getCurrentFinancialYearIdAndCode(connection)
    const compCode = await getCompCodeFromId(connection)
    const sql = `
    select * from 
    (select docid 
    from gtgrpbillentry 
    where compcode = '${COMPCODE}' and FINYR = '${finYearId}' and projectid = '${PROJECTID}'
    order by docid desc) 
    where rownum = 1
    `
    const result = await connection.execute(sql)
    let nextVal;
    if (result.rows.length === 0) {
        nextVal = "1".padStart(6, "0")
    } else {
        let prev = result.rows[0][0]
        nextVal = new String(parseInt(prev.split("-")[2]) + 1).padStart(6, "0")
    }
    await updateDocId(connection, YARN_PURCHASE_BILL_ENTRY_VIEW_ID, nextVal, YPB_CODE)
    const newDocId = `${compCode}/${finyearCode}/${YPB_CODE}-${nextVal}`
    return newDocId
}

export async function getNextDyedYarnPoInvoiceNo(connection) {
    const { finyearCode, finYearId } = await getCurrentFinancialYearIdAndCode(connection)
    const compCode = await getCompCodeFromId(connection)
    const sql = `
    select * from 
    (select docid 
    from gtdypbillentry 
    where compcode = '${COMPCODE}' and FINYR = '${finYearId}' and projectid = '${PROJECTID}'
    order by docid desc) 
    where rownum = 1
    `
    const result = await connection.execute(sql)
    let nextVal;
    if (result.rows.length === 0) {
        nextVal = "1".padStart(6, "0")
    } else {
        let prev = result.rows[0][0]
        nextVal = new String(parseInt(prev.split("-")[2]) + 1).padStart(6, "0")
    }
    await updateDocId(connection, DYEDYARN_PURCHASE_BILL_ENTRY_VIEW_ID, nextVal, DPB_CODE)
    const newDocId = `${compCode}/${finyearCode}/${DPB_CODE}-${nextVal}`
    return newDocId
}

export async function getNextDyedFabpurInwardNo(connection) {
    const { finyearCode, finYearId } = await getCurrentFinancialYearIdAndCode(connection)
    const compCode = await getCompCodeFromId(connection)
    const sql = `
    select * from 
    (select fpino 
    from gtdfabpurinward 
    where ttype = 'INWARD' and compcode = '${COMPCODE}' and finYear = '${finYearId}' and projectid = '${PROJECTID}'
    order by fpino desc) 
    where rownum = 1
    `
    const result = await connection.execute(sql)
    let nextVal;
    if (result.rows.length === 0) {
        nextVal = "1".padStart(6, "0")
    } else {
        let prev = result.rows[0][0]
        nextVal = new String(parseInt(prev.split("-")[2]) + 1).padStart(6, "0")
    }
    await updateDocId(connection, DYED_FABRIC_PURCHASE_INWARD_VIEW_ID, nextVal, DFPI_CODE)
    const newDocId = `${compCode}/${finyearCode}/${DFPI_CODE}-${nextVal}`
    return newDocId
}

export async function getNextDyedFabpurPoInvoiceNo(connection) {
    const { finyearCode, finYearId } = await getCurrentFinancialYearIdAndCode(connection)
    const compCode = await getCompCodeFromId(connection)
    const sql = `
    select * from 
    (select docid 
    from gtgrpbillentry 
    where compcode = '${COMPCODE}' and FINYR = '${finYearId}' and projectid = '${PROJECTID}'
    order by docid desc) 
    where rownum = 1
    `
    const result = await connection.execute(sql)
    let nextVal;
    if (result.rows.length === 0) {
        nextVal = "1".padStart(6, "0")
    } else {
        let prev = result.rows[0][0]
        nextVal = new String(parseInt(prev.split("-")[2]) + 1).padStart(6, "0")
    }
    await updateDocId(connection, DYED_FABRIC_PURCHASE_BILL_ENTRY_VIEW_ID, nextVal, DFPB_CODE)
    const newDocId = `${compCode}/${finyearCode}/${DFPB_CODE}-${nextVal}`
    return newDocId
}

export async function getNextGreyFabPurInwardNo(connection) {
    const { finyearCode, finYearId } = await getCurrentFinancialYearIdAndCode(connection)
    const compCode = await getCompCodeFromId(connection)
    const sql = `
    select * from 
    (select fpino 
    from gtfabpurinward 
    where ttype = 'INWARD' and compcode = '${COMPCODE}' and finYear = '${finYearId}' and projectid = '${PROJECTID}'
    order by fpino desc) 
    where rownum = 1
    `
    const result = await connection.execute(sql)
    let nextVal;
    if (result.rows.length === 0) {
        nextVal = "1".padStart(6, "0")
    } else {
        let prev = result.rows[0][0]
        nextVal = new String(parseInt(prev.split("-")[2]) + 1).padStart(6, "0")
    }
    await updateDocId(connection, GREY_FABRIC_PURCHASE_INWARD_VIEW_ID, nextVal, GFPI_CODE)
    const newDocId = `${compCode}/${finyearCode}/${GFPI_CODE}-${nextVal}`
    return newDocId
    console.log(result, 'res');
}