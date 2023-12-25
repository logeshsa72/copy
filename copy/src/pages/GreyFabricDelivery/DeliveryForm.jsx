import React, { useState, useEffect } from 'react'
import { toast } from "react-toastify";
import moment from 'moment';
import { useGetGreyFabricPoDeliveryDocIdQuery } from '../../redux/services/greyFabricPoDelivery';
import { getMonthValue } from '../../utils/date';
import { useAddGreyFabricPoDeliveryMutation, useGetGreyFabricPoDeliveryIdQuery, useUpdateGreyFabricPoDeliveryMutation } from '../../redux/services/greyFabricPoDelivery';
import DelDtl from '../../components/DeliveryDetails';
import Modal from '../../UiComponents/Modal';
import SelectItems from './SelectItems';
import { RiDeleteBin6Line } from "react-icons/ri";
import Tooltip from '@mui/material/Tooltip';
import Model from './attachment';
import { useGetGreyFabricPoQuery } from '../../redux/services/greyFabricPo';
import { IoSave } from 'react-icons/io5';
import { IoReturnDownBackSharp } from "react-icons/io5";
const DeliveryForm = ({ setForm, selectedPos, setSelectedPos, delNo = null }) => {
    const [selectItemsModal, setSelectItemsModal] = useState(false);
    const today = new Date()
    const [remarks, setRemarks] = useState('')
    const [vehicleNo, setVehicleNo] = useState('')
    const [dcDate, setDcDate] = useState(moment.utc(today).format("YYYY-MM-DD"))
    const [supplierDcNo, setSupplierDcNo] = useState('')
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [addData] = useAddGreyFabricPoDeliveryMutation()
    const [updateData] = useUpdateGreyFabricPoDeliveryMutation()
    const [gfPoIno, setGfPoIno] = useState('')
    const [gfPoInDate, setGfPoInDate] = useState(today)

    let gtCompMastId = localStorage.getItem('gtCompMastId')
    const { data: inDocId, isLoading: isDocLoading, isFetching: isDocFetching } = useGetGreyFabricPoDeliveryDocIdQuery({ skip: !delNo })
    useEffect(() => {
        if (delNo) return
        const docId = inDocId?.docId ? inDocId?.docId : ''

        setGfPoIno(docId);
    }, [inDocId, isDocFetching, isDocLoading])


    const { refetch } = useGetGreyFabricPoQuery({ params: { gtCompMastId, isAccepted: true, deliveryFilter: true } })

    const { data: singleData, isLoading, isFetching } = useGetGreyFabricPoDeliveryIdQuery({ gfPoIno: delNo }, { skip: !delNo })

    useEffect(() => {
        const singleDelData = singleData?.data
        if (!singleDelData) return

        setGfPoIno(singleDelData?.gfPoIno ? singleDelData?.gfPoIno : '')
        setGfPoInDate(singleDelData?.gfPoInDate ? singleDelData?.gfPoInDate : today)
        setRemarks(singleDelData?.remarks ? singleDelData?.remarks : "")
        setVehicleNo(singleDelData?.vehicleNo ? singleDelData?.vehicleNo : "")
        setSupplierDcNo(singleDelData?.suppDcNo ? singleDelData?.suppDcNo : "")
        setDcDate(singleDelData?.dcDate ? moment(singleDelData.dcDate).format("YYYY-MM-DD") : "")
        setDeliveryDetails(singleDelData?.deliveryDetails ? singleDelData?.deliveryDetails.map(i => ({ ...i, weightPerBag: (i.delQty / i.delBags) })) : []);
        setSelectedPos(singleDelData?.deliveryDetails ? [...new Set(singleDelData?.deliveryDetails.map(i => i.poNo))] : [])
    }, [singleData, isLoading, isFetching])

    const data = { remarks, supplierDcDate: moment(dcDate).format("DD-MM-YYYY"), supplierDcNo, vehicleNo, deliveryDetails: deliveryDetails, supplierId: gtCompMastId, fabricPoInwardNo: delNo }
    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            if (returnData?.statusCode === 0) {
                setForm(false)
                toast.success(` ${text} Successfully`);
                refetch()
            }
        } catch (error) {
            console.log(error, "error")
            toast.error("handle");
        }
    };

    const handleSave = async () => {


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
        setDeliveryDetails((prev) => {
            let newData = structuredClone(prev)
            newData[index][field] = value
            if (field === "delBags" || field === "weightPerBag") {
                newData[index]["delQty"] = newData[index]["delBags"] * newData[index]["weightPerBag"]
            }
            return newData
        })
    }
    function onModalClose() {
        setSelectItemsModal(false)
    }


    useEffect(() => {
        if (delNo) return
        if (deliveryDetails.length === 0) {
            setSelectItemsModal(true)
        }
    }, [deliveryDetails, delNo])
    const handleDelete = (index) => {
        setDeliveryDetails((prev) => {
            return prev.filter((data, i) => i !== index);
        });
    };
    return (
        <div className='h-full'>

            <Modal isOpen={selectItemsModal} onClose={onModalClose}>
                <SelectItems selectedPos={selectedPos} handleOnChange={handleOnChange} onModalClose={onModalClose}
                    deliveryDetails={deliveryDetails} setDeliveryDetails={setDeliveryDetails} />
            </Modal>
            <div className="  relative ">
                <div className='flex border border-gray-400 gap-5'>
                    <div className="w-full flex items-center" >
                        <div className="flex justify-evenly w-full">
                            {/* <div className=" flex  ">
                <div className=''> <lable className="font-semibold text-xs" >Delivery No : </lable><span className="font-light text-xs">{gfPoIno}</span></div>

                <div>
                  <lable className="font-semibold text-xs" > Delivery Date : </lable> <span className="font-light text-xs">{getMonthValue(gfPoInDate)}</span></div>
              </div> */}
                            <div className='flex w-full justify-evenly'>
                                <div className="flex items-center">
                                    <lable className="font-semibold text-xs" >delivery No : </lable><span className="font-light text-xs">{gfPoIno}</span>
                                </div>
                                <div><lable className="font-semibold text-xs" > delivery Date: </lable> <span className="font-light text-xs">{getMonthValue(gfPoInDate)}</span><br /></div></div>
                            <DelDtl selectedPos={selectedPos} />


                        </div>
                    </div>
                    <div>
                        <div><Model /></div>
                    </div>
                </div>






                <>

                    <div className='   overflow-x-scroll'>
                        <table className="border text-xs overflow-x-scroll w-full">
                            <thead className='text-white'>
                                <tr className="bg-orange-600 border-b text-white">
                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white ">
                                            <h3>S No</h3>
                                        </div>
                                    </th>
                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white ">
                                            <h3>Po No</h3>
                                        </div>
                                    </th>
                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white ">
                                            <h3>Fabric</h3>

                                        </div>
                                    </th>
                                    <th className=" border-r cursor-pointer text-m  text-white">
                                        <div className="flex items-center justify-center text-white">
                                            <h3>Color</h3>

                                        </div>
                                    </th>

                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white  ">
                                            <h3>Order No</h3>

                                        </div>
                                    </th>
                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white">
                                            Po Qty

                                        </div>

                                    </th>
                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white">
                                            Po Bags
                                        </div>
                                    </th>


                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white">
                                            Price
                                        </div>
                                    </th>
                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white">
                                            Al del qty
                                        </div>
                                    </th>
                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white">
                                            bal qty
                                        </div>
                                    </th>
                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white">
                                            Lot.No </div>
                                    </th>
                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white">
                                            Del Bags
                                        </div>
                                    </th>
                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white">
                                            Weight Per Bag
                                        </div>
                                    </th>
                                    <th className=" border-r cursor-pointer text-m  text-gray-500">
                                        <div className="flex items-center justify-center text-white">
                                            Del Qty
                                        </div>
                                    </th>
                                    <th className="p-1 border-r cursor-pointer text-m  text-gray-500">

                                        <div className="flex items-center justify-center text-white"><Tooltip placement="top" title="Add items">  <button className='text-xl' onClick={() => { setSelectItemsModal(true) }}>+</button> </Tooltip></div>
                                    </th>
                                </tr>
                            </thead>

                            <tbody className=' even:bg-white odd:bg-blue-100 '>
                                {(deliveryDetails).map((item, index) => (

                                    <tr className={'even:bg-gray-300 odd:bg-white'} key={index}>
                                        <td className="p-2 border-r ">{index + 1}</td>
                                        <td className=" border-r ">{item.poNo}</td>
                                        <td className=" border-r ">{item.fabric}</td>
                                        <td className=" border-r text-left">{item.color}</td>
                                        <td className=" border-r text-left">{item.orderNo}</td>
                                        <td className="flex-col  text-right ">{(item.poQty.toFixed(3))}</td>
                                        <td className="pl-1 border-r text-right  ">{(item?.poBags ? item.poBags : 0).toFixed(2)}</td>
                                        <td className="pl-3 text-right ">{(item?.price ? item?.price : 0).toFixed(2)}</td>
                                        <td className="pl-2 text-right">{(item?.aDelQty ? item.aDelQty : 0).toFixed(3)}</td>
                                        <td className="pl-2 text-right">{(item.poQty - item.aDelQty).toFixed(3)}</td>
                                        <td className=" border-r text-right">
                                            <input className='table-input  text-right' value={item.lotNo} onChange={(e) => handleOnChange(e.target.value, 'lotNo', index)} />
                                        </td>
                                        <td className=" border-r  text-right">
                                            <input className='table-input  text-right' value={item.delBags}
                                                onChange={(e) => handleOnChange(e.target.value, 'delBags', index)} />
                                        </td>
                                        <td className=" border-r  text-right"><input className='table-input text-right'
                                            value={item.weightPerBag} onChange={(e) => handleOnChange(e.target.value, 'weightPerBag', index)} />
                                        </td>
                                        <td className="pl-5 border-r  text-right"><input disabled className='table-input flex' value={item.delQty} onChange={(e) => handleOnChange(e.target.value, 'delQty', index)} />
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
                                <>
                                    {Array.from({ length: 13 - (data?.data ? data.data : []).length }).map((_, index) =>
                                        <tr className={' even:bg-gray-300 odd:bg-white h-7'} key={index} >
                                            {Array.from({ length: 15 }).map((_, index) =>
                                                <td key={index}> </td>
                                            )}
                                        </tr>)}
                                </>   </tbody>
                        </table></div>
                </>
            </div>
            <div className='flex border border-gray-400 gap-5 p-1 m-1' >
                <div className='flex gap-5 justify-evenly'>
                    <div> <label className='text-xs'>Remarks : </label>
                        <input className='h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline' type="text" value={remarks}
                            onChange={(e) => setRemarks(e.target.value)} /></div>
                    <div><label className='text-xs'>Vehicle No : </label>
                        <input className='h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline' type="text" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} /></div>

                    <div> <label className='text-xs'>DC Date : </label>
                        <input className='h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline' required type="date" value={dcDate} onChange={(e) => setDcDate(e.target.value)}

                            id='id' /></div>


                    <div> <label className='text-xs'>Supplier Dc No : </label>
                        <input className='h-5  w-[7rem] text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline' type="text" value={supplierDcNo} onChange={(e) => setSupplierDcNo(e.target.value)} /></div>
                </div>

            </div>
            <div className='flex justify-between'>
                <div><Tooltip placement="top" title="To Delivery Report"> <button onClick={handleBack} className='bg-orange-500 hover:bg-orange-700 hover:text-white p-1 rounded flex items-center text -xs'> <IoReturnDownBackSharp />Back </button> </Tooltip></div>
                <button onClick={handleSave} className='flex items-center bg-orange-500 hover:bg-orange-700 hover:text-white text-xs p-1 rounded'><IoSave className='mr-1' /> Save</button>
            </div>

        </div >
    )
}

export default DeliveryForm