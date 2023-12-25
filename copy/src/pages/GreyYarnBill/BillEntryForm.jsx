import React, { useState, useEffect } from 'react'
import { toast } from "react-toastify";
import moment from 'moment';
import { getMonthValue } from '../../utils/date';
import DelDtl from '../../components/DeliveryDetails';
import Modal from '../../UiComponents/Modal';
import SelectItems from './SelectItems'
import { RiDeleteBin6Line } from "react-icons/ri";
import Tooltip from '@mui/material/Tooltip';
import { useAddGreyYarnPoBillEntryMutation, useGetGreyYarnPoBillEntryDocIdQuery, useGetGreyYarnPoBillEntryIdQuery, useUpdateGreyYarnPoBillEntryMutation } from '../../redux/services/greyYarnBillEntry';
import { discountTypes, getNetAmountForTax } from '../../utils/helper';
import { useGetTaxDetailsQuery } from '../../redux/services/tax';
import TaxGrid from './TaxGrid';
const BillForm = ({ setForm, selectedPos, setSelectedPos, delNo = null }) => {
    const [fetchTaxDetails, setFetchTaxDetails] = useState(false);
    const [selectItemsModal, setSelectItemsModal] = useState(false);
    const [taxModel, setTaxModel] = useState(false)
    const today = new Date()
    const [remarks, setRemarks] = useState('')
    const [dataPerPage, setDataPerPage] = useState("12");

    const [partyBillNo, setPartyBillNo] = useState('')
    const [partyBillDate, setPartyBillDate] = useState("")
    const [netBillValue, setNetBillValue] = useState('')
    const [invoiceDetails, setInvoiceDetails] = useState([]);
    const [addData] = useAddGreyYarnPoBillEntryMutation()
    const [updateData] = useUpdateGreyYarnPoBillEntryMutation()
    const [billEntryNo, setBillEntryNo] = useState('')
    const [docDate, setDocDate] = useState(today)
    const [taxTemp, setTaxTemp] = useState("")
    const [taxGridDetails, setTaxGridDetails] = useState([]);
    let gtCompMastId = localStorage.getItem('gtCompMastId')
    const { data: inDocId, isLoading: isDocLoading, isFetching: isDocFetching } = useGetGreyYarnPoBillEntryDocIdQuery({ skip: !delNo })
    useEffect(() => {
        if (delNo || isDocFetching || isDocLoading) return
        const docId = inDocId?.docId ? inDocId?.docId : ''
        setBillEntryNo(docId);
    }, [inDocId, isDocFetching, isDocLoading, delNo])

    const { data: taxData } = useGetTaxDetailsQuery();
    const taxList = taxData?.data ? taxData?.data : []


    const { data: singleData, isLoading, isFetching } = useGetGreyYarnPoBillEntryIdQuery({ billEntryNo: delNo }, { skip: !delNo })
    useEffect(() => {
        const singleDelData = singleData?.data
        if (!singleDelData) return
        setBillEntryNo(singleDelData?.billEntryNo ? singleDelData?.billEntryNo : '')
        setRemarks(singleDelData?.remarks ? singleDelData?.remarks : "")
        setPartyBillNo(singleDelData?.partyBillNo ? singleDelData?.partyBillNo : "")
        setPartyBillDate(singleDelData?.partyBillDate ? moment(singleDelData?.partyBillDate).format("YYYY-MM-DD") : " ")
        setBillEntryNo(singleDelData?.docId ? singleDelData?.docId : "")
        setDocDate(singleDelData?.docDate ? singleDelData?.docDate : "")
        setNetBillValue(singleDelData?.netBillValue ? singleDelData?.netBillValue : "")
        setInvoiceDetails(singleDelData?.invoiceDetails ? singleDelData?.invoiceDetails : []);
        setSelectedPos(singleDelData?.invoiceDetails ? [...new Set(singleDelData?.invoiceDetails.map(i => i.poNo))] : [])
        setTaxGridDetails(singleDelData?.taxDetails ? singleDelData?.taxDetails : [])
        setTaxTemp(singleDelData?.taxTemp ? singleDelData?.taxTemp : "")
    }, [singleData, isLoading, isFetching, setSelectedPos])

    const data = { remarks, taxGridDetails, partyBillDate: moment(partyBillDate).format("DD-MM-YYYY"), partyBillNo, netBillValue, invoiceDetails: invoiceDetails, supplierId: gtCompMastId, yarnPoBillEntryNo: delNo }
    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            if (returnData?.statusCode === 0) {
                setForm(false)
                toast.success(` ${text} Successfully`);
            }
        } catch (error) {
            console.log(error, "error")
            toast.error("handle");
        }
    };
    const isNetBillValueNotMatching = () => {
        return getNetAmountForTax(taxGridDetails) !== parseFloat(netBillValue)
    }
    const handleSave = async () => {
        if (isNetBillValueNotMatching()) return toast.info("Net Bill Value Not Equal to Net Amount");
        if (delNo) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            handleSubmitCustom(addData, data, "Added");
        }
    }
    const handleBack = () => {
        setForm(false)
    }
    const handleOnChange = (value, field, index) => {
        setInvoiceDetails((prev) => {
            let newData = structuredClone(prev)
            newData[index][field] = value
            return newData
        })
    }
    function onModalClose() {
        setSelectItemsModal(false)
    }


    useEffect(() => {
        if (delNo) return
        if (invoiceDetails.length === 0) {
            setSelectItemsModal(true)
        }
    }, [invoiceDetails, delNo])
    const handleDelete = (index) => {
        setInvoiceDetails((prev) => {
            return prev.filter((data, i) => i !== index);
        });
    };

    return (
        <div>
            <Modal isOpen={selectItemsModal} onClose={onModalClose} >
                <SelectItems selectedPos={selectedPos} handleOnChange={handleOnChange} onModalClose={onModalClose}
                    invoiceDetails={invoiceDetails} setInvoiceDetails={setInvoiceDetails} />
            </Modal>
            <Modal isOpen={taxModel} onClose={() => setTaxModel(false)} className='w-[50%]' >
                <TaxGrid fetch={fetchTaxDetails} setFetch={setFetchTaxDetails} taxGridDetails={taxGridDetails} billEntryNo={billEntryNo} setTaxGridDetails={setTaxGridDetails} taxTemp={taxTemp} invoiceDetails={invoiceDetails} />
            </Modal>
            <div className="  relative p-1 flex-col ">
                <div class=" flex border border-gray-400   items-center   h-12" >
                    <div className='flex w-full justify-evenly'>
                        <div class="flex items-center">
                            <lable className="font-semibold text-xs" >Invoice No : </lable><span className="font-light text-xs">{billEntryNo}</span>
                        </div>
                        <div><lable className="font-semibold text-xs" > Invoice Date: </lable> <span className="font-light text-xs">{getMonthValue(docDate)}</span><br /></div></div>



                    <DelDtl selectedPos={selectedPos} />
                    <div className='flex items-center mr-1'><lable className="font-semibold text-xs  " > Tax: </lable>
                        <select className="p-1 font-light text-xs h-7" value={taxTemp} onChange={(e) => setTaxTemp(e.target.value)}>
                            <option value="" disabled >Select</option>
                            {taxList.map(item => <option key={item.adScheme} value={item.adScheme}> {item.adScheme}</option>)}
                        </select>
                    </div>

                </div>

                <>

                    <div className='   overflow-x-scroll'>
                        <table class="border text-xs overflow-x-scroll w-full">
                            <thead className='text-white'>
                                <tr class="bg-orange-600 border-b text-white">
                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white ">
                                            <h3>s No</h3>
                                        </div>
                                    </th>
                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white ">
                                            <h3>Po No</h3>
                                        </div>
                                    </th>
                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white ">
                                            <h3>Yarn</h3>
                                        </div>
                                    </th>
                                    <th class=" border-r cursor-pointer text-m  text-white">
                                        <div class="flex items-center justify-center text-white">
                                            <h3>Color</h3>

                                        </div>
                                    </th>


                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white">
                                            Po Qty

                                        </div>

                                    </th>
                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white">
                                            Po Bags
                                        </div>
                                    </th>


                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white">
                                            Price
                                        </div>
                                    </th>
                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white">
                                            Al del qty
                                        </div>
                                    </th>

                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white">
                                            Bill Qty </div>
                                    </th>
                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white">
                                            Bill Rate
                                        </div>
                                    </th>
                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white">
                                            tax
                                        </div>
                                    </th>
                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white">
                                            Notes
                                        </div>
                                    </th>
                                    <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white">
                                            Discount type
                                        </div>
                                    </th>  <th class=" border-r cursor-pointer text-m  text-gray-500">
                                        <div class="flex items-center justify-center text-white">
                                            Discount
                                        </div>
                                    </th>
                                    <th class="p-1 border-r cursor-pointer text-m  text-gray-500">

                                        <div class="flex items-center justify-center text-white"><Tooltip placement="top" title="Add items">  <button className='text-xl' onClick={() => { setSelectItemsModal(true) }}>+</button> </Tooltip></div>
                                    </th>
                                </tr>
                            </thead>

                            <tbody className=' even:bg-white odd:bg-blue-100 '>
                                {(invoiceDetails).map((item, index) => (
                                    <tr className={index % 2 === 0 ? '' : 'bg-gray-300'} key={index}>
                                        <td className=" border-r ">{index + 1}</td>
                                        <td className=" border-r ">{item.poNo}</td>
                                        <td className=" border-r ">{item.yarn}</td>
                                        <td className=" border-r text-left">{item.color}</td>

                                        <td className="flex-col  text-right ">{item.poQty.toFixed(2)}</td>
                                        <td className="pl-1 border-r text-right  ">{item.poBags}</td>
                                        <td className="pl-3 text-right ">{(item?.price ? item?.price : 0).toFixed(2)}</td>
                                        <td className="pl-2 text-right">{(item?.aDelQty ? item.aDelQty : 0).toFixed(3)}</td>
                                        <td className=" border-r pl-2 text-right">
                                            <input className=' table-input text-right' value={item.billQty} onChange={(e) => handleOnChange(e.target.value, 'billQty', index)} />
                                        </td>
                                        <td className=" border-r text-right">
                                            <input className='table-input  text-right' value={item.billRate}
                                                onChange={(e) => handleOnChange(e.target.value, 'billRate', index)} />
                                        </td>
                                        <td className=" border-r  text-right">
                                            <input className='table-input text-right'
                                                value={item.tax} onChange={(e) => handleOnChange(e.target.value, 'tax', index)} />
                                        </td>
                                        <td className=" border-r  text-right">
                                            <input className='table-input text-right'
                                                value={item.notes} onChange={(e) => handleOnChange(e.target.value, 'notes', index)} />
                                        </td>
                                        <td className="table-input  ">
                                            <select className='h-8 bg-transparent relative text-xs' name="Discount Type" value={item.discountType} onChange={(e) => handleOnChange(e.target.value, 'discountType', index)} id="">
                                                <option className=''>Select</option>
                                                {discountTypes.map((item, index) => {
                                                    return (
                                                        <option key={index} value={item.value}>{item.show}</option>
                                                    )
                                                })}

                                            </select>
                                        </td>
                                        <td className=" border-r   text-right">
                                            <input className='table-input  text-right' value={item.discountValue} onChange={(e) => handleOnChange(e.target.value, 'discountValue', index)} />
                                        </td>
                                        <td className="" onClick={() => handleDelete(index)}>
                                            <span
                                                className="   text-xl hover:text-red-600 font-medium flex justify-center text-black-500  "
                                            >
                                                <RiDeleteBin6Line />
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {Array.from({ length: 12 - (data?.data ? data.data : []).length }).map((_, index) =>
                                    <tr className={' even:bg-gray-300  odd:bg-white h-7'} key={index} >
                                        {Array.from({ length: 15 }).map((_, index) =>
                                            <td key={index}> </td>
                                        )}
                                    </tr>)}
                            </tbody>
                        </table></div>
                </>
            </div>
            <div className='flex-col border border-gray-400 p-2'>
                <div className='flex justify-between'>
                    <div> <label className='text-xs'>Remarks : </label>
                        <input className='h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded  appearance-none focus:outline-none focus:shadow-outline' type="text" value={remarks}
                            onChange={(e) => setRemarks(e.target.value)} /></div>
                    <div><label className='text-xs'>Net Bill Value : </label>
                        <input className='h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded  appearance-none focus:outline-none focus:shadow-outline' type="text" value={netBillValue} onChange={(e) => setNetBillValue(e.target.value)} /></div>
                    <div> <label className='text-xs'>Bill Date </label>
                        <input className='h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded  appearance-none focus:outline-none focus:shadow-outline' required type="date" value={partyBillDate} onChange={(e) => setPartyBillDate(e.target.value)}
                            id='id' /></div>
                    <div> <label className='text-xs'>Bill No : </label>
                        <input className='h-5  w-[7rem] text-xs leading-tight text-gray-700 border rounded  appearance-none focus:outline-none focus:shadow-outline' type="text" value={partyBillNo} onChange={(e) => setPartyBillNo(e.target.value)} /></div>
                    <button className='bg-orange-500 hover:bg-orange-700 hover: text-white p-1 rounded text-xs' onClick={() => { setTaxModel(true); setFetchTaxDetails(true) }}>Tax Details</button>

                </div>
            </div>
            <div className='m-2'>
                <div className='flex justify-between' ><Tooltip placement="top" title="To Bill Report"> <button onClick={handleBack} className='bg-orange-500 hover:bg-orange-700 hover: text-white p-1 rounded'>Back </button> </Tooltip>
                    <div className='flex justify-between'>    <button onClick={handleSave} className='bg-orange-500 hover:bg-orange-700 hover: text-white p-1 rounded'>Save</button>
                    </div></div>
            </div>
        </div>
    )
}

export default BillForm