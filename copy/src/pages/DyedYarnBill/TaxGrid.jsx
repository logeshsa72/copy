import React, { useEffect, useState } from 'react'
import { getNetAmountForTax, getNumberFromAlphaNumeric, getRoundedValueForTax, roundTo2Decimals, substract } from '../../utils/helper'
import { useGetTaxDetailsByIdQuery } from '../../redux/services/tax'

function TaxGridItem({ taxDetail, index, setTaxGridDetails }) {
    const handleOnChange = (field, value, adPorm) => {
        let inputValue = value;
        setTaxGridDetails(prev => {
            let newItems = structuredClone(prev);
            if (field === "adValue") {
                if (adPorm.toLowerCase() === "plus") {
                    inputValue = Math.abs(inputValue)
                } else if (adPorm.toLowerCase() === "minus") {
                    inputValue = -Math.abs(inputValue)
                }
            }
            newItems[index][field] = inputValue;
            let rndIndex = newItems.findIndex(i => i.adId === "RND")
            if (newItems[rndIndex]) {
                newItems[rndIndex]["adValue"] = getRoundedValueForTax(newItems)
            }
            return newItems
        })
    }
    const readOnly = taxDetail?.adId?.includes("GR") || taxDetail.adId === "BFDT" || taxDetail.adId.includes("CGST") || taxDetail.adId.includes("SGST") || taxDetail.adId.includes("IGST") || taxDetail.adId === "RND";
    return (
        <tr key={index + 1}>
            <td className='text-xs'>{index + 1}</td>
            <td className=' text-xs font-medium'>{taxDetail.adType}</td>
            <td >  <input className='text-xs text-right w-full' type="number" readOnly={readOnly} value={taxDetail?.adValue ? taxDetail?.adValue : 0} onChange={(e) => handleOnChange("adValue", e.target.value, taxDetail.adPorm)} /></td>
            <td><input className='text-xs' type="text" value={taxDetail?.notes ? taxDetail.notes : ""} onChange={(e) => handleOnChange("notes", e.target.value)} /></td>
        </tr>
    )
}

const TaxGrid = ({ taxGridDetails, setTaxGridDetails, invoiceDetails, taxTemp, fetch, setFetch }) => {

    const taxValues = invoiceDetails.map(i => i?.tax ? i?.tax : 0)
    const { data: taxGrid, isLoading: taxLoading, isFetching: taxFetching, refetch, } = useGetTaxDetailsByIdQuery({
        taxTemp,
        taxList: JSON.stringify(taxValues)
    }, { skip: !fetch, refetchOnMountOrArgChange: false });

    useEffect(() => {
        if (taxLoading || taxFetching || !taxGrid?.data) return
        const getGrossValue = (adId) => {
            const tax = getNumberFromAlphaNumeric(adId)
            return invoiceDetails.filter(i => parseFloat(i.tax) === parseFloat(tax)).reduce((a, c) => a + parseFloat(c?.billQty ? c?.billQty : 0) * parseFloat(c?.billRate ? c?.billRate : 0), 0)
        }
        const getTaxValue = (adId) => {
            let tax = getNumberFromAlphaNumeric(adId);
            let taxValue = tax;
            if (adId.includes("SGST") || adId.includes("CGST")) {
                taxValue = parseFloat(taxValue) / 2;
            }
            return invoiceDetails.filter(i => parseFloat(i.tax) === parseFloat(tax)).reduce((a, c) => a + (getGrossValue(adId) * (taxValue / 100)), 0)
        }
        const getBeforeTaxDiscount = () => {
            return -invoiceDetails.reduce((a, c) => a + parseFloat(c.discountType === "Per" ? (c.discountValue / 100) * (parseFloat(c?.billQty ? c?.billQty : 0) * (c?.billRate ? c?.billRate : 0)) : (c.discountValue ? c.discountValue : 0)), 0);
        }
        setTaxGridDetails((prev) => {
            let newItems = taxGrid.data.map((item) => {
                let newTax = structuredClone(item);
                let prevIndex = prev.findIndex(i => i.adId.toLowerCase() === newTax.adId.toLowerCase())
                const formulaValidator = (adId) => {
                    if (adId.includes("GR")) {
                        return getGrossValue(adId)
                    } else if (adId === "BFDT") {
                        return getBeforeTaxDiscount()
                    } else if (adId.includes("CGST") || adId.includes("SGST") || adId.includes("IGST")) {
                        return getTaxValue(adId)
                    }
                    if (prev[prevIndex]) {
                        return prev[prevIndex]["adValue"]
                    }
                    return adId?.adValue ? adId?.adValue : 0
                }
                newTax["adValue"] = formulaValidator(newTax.adId)
                newTax["notes"] = "";
                if (prev[prevIndex]) {
                    newTax["notes"] = prev[prevIndex]["notes"]
                }
                return newTax
            })
            let rndIndex = newItems.findIndex(i => i.adId === "RND")
            if (newItems[rndIndex]) {
                newItems[rndIndex]["adValue"] = getRoundedValueForTax(newItems)
            }
            return newItems
        })
    }, [invoiceDetails, setTaxGridDetails, taxGrid, taxLoading, taxFetching])
    return (
        <div className='w-[35vw]  border-solid border-2 border-gray-300 m-1'>

            <div className='flex justify-between  border-solid border-2 border-gray-300 m-2'> <h1 className='text-xl p--1   bg-clip-text text-orange-600 '>tax details</h1>
                <button className='bg-orange-500 p-1 rounded text-white text-xs m-1' onClick={() => { fetch ? refetch() : setFetch(true) }}>Load Tax Details</button></div>
            <table className='mt-2'>
                <thead><tr>
                    <th className='border-collapse border border-slate-400 text-xs'>S.No</th>
                    <th className='border-collapse border border-slate-400 text-xs'>Tax Name</th>
                    <th className='border-collapse border border-slate-400 text-xs'>Tax Value</th>
                    <th className='border-collapse border border-slate-400 text-xs'>Notes</th>
                </tr>
                </thead>
                <tbody>
                    {taxGridDetails.map((taxDetail, index) =>
                        <TaxGridItem key={taxDetail.adId} taxDetail={taxDetail} index={index}
                            taxGridDetails={taxGridDetails}
                            setTaxGridDetails={setTaxGridDetails} invoiceDetails={invoiceDetails} />
                    )}
                    <tr className='font-bold'>
                        <td className='text-xs'>{taxGridDetails.length + 1}</td>
                        <td className='text-xs'>NET AMOUNT</td>
                        <td className='text-xs font-medium text-right pr-2'>{getNetAmountForTax(taxGridDetails).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}


export default TaxGrid
