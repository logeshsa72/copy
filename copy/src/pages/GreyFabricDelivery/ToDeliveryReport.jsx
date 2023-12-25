import { useState, useEffect } from 'react'
import { useGetGreyFabricPoQuery, useUpdateStatusMutation, useGetGreyFabricPoDetailsByIdQuery, } from '../../redux/services/greyFabricPo'
import { toast } from 'react-toastify';
import { calculateDaysBetween, getMonthValue } from '../../utils/date';
import { reactPaginateIndexToPageNumber, pageNumberToReactPaginateIndex } from '../../utils/helper'
import ReactPaginate from 'react-paginate';
import { useMemo } from 'react';
import { MdOutlineCreateNewFolder } from "react-icons/md"
const ToGreyFabricDeliveryReport = ({ selectedPos, setSelectedPos, setForm, }) => {

    const [searchPoNo, setSearchPoNo] = useState('')
    const [searchPoDate, setSearchPoDate] = useState('')
    const [searchPoSupplier, setSearchPoSuppiler] = useState('')
    const [searchPoDueDate, setSearchPoDueDate] = useState('')
    const [searchPodelto, setSearchPodelto] = useState('')
    const commaNumber = require('comma-number')
    const [dataPerPage, setDataPerPage] = useState("15");
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    const [totalCount, setTotalCount] = useState(0);
    const [po, setPo] = useState("")

    let gtCompMastId = localStorage.getItem('gtCompMastId')

    const { data } = useGetGreyFabricPoQuery({ params: { gtCompMastId, isAccepted: true, deliveryFilter: true } })
    console.log(data, 'data');
    function selectPo(poNo) {
        setSelectedPos(prev => {
            if (prev.length > 0) {
                let firstPoNo = selectedPos[0]
                const firstDeliveryTo = data.data.find(po => po.poNo === firstPoNo).deliveryTo
                const currentDeliveryTo = data.data.find(po => po.poNo === poNo).deliveryTo
                if (firstDeliveryTo !== currentDeliveryTo) {
                    toast.warning("Cannot Select 2 Different Delivery To Pos")
                    return prev
                }
            }
            return [...prev, poNo]
        }
        )
    }
    function removePo(poNo) {
        setSelectedPos(prev => prev.filter(po => po !== poNo))
    }
    function isPoSelected(poNo) {
        return selectedPos.findIndex(po => po === poNo) !== -1
    }
    function handleChangeSelectPo(poNo) {
        if (isPoSelected(poNo)) {
            removePo(poNo)
        } else {
            selectPo(poNo)

        }
    }

    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }


    const searchFeilds = useMemo(() => ({ searchPoNo, searchPoDate, searchPoSupplier, searchPodelto, searchPoDueDate }), [
        searchPoNo, searchPoDate, searchPoSupplier, searchPodelto, searchPoDueDate
    ])
    useEffect(() => {
        setCurrentPageNumber(1)
    }, [searchFeilds])


    useEffect(() => {
        if (data?.totalCount) {
            setTotalCount(data?.totalCount)
        }
    }, [data])
    const [updateActiveStatus] = useUpdateStatusMutation()
    const handleStatus = async (poNo) => {
        let data = await updateActiveStatus({ poNo })
        if (data.statusCode === 0) {
            toast.success("Accepted");
        } else if (data.statusCode === 1) {
            toast.info(data.message);
            return;
        }

    }
    const { data: poDetailsData } = useGetGreyFabricPoDetailsByIdQuery({ poNo: po }, { skip: !po })
    const poDetails = poDetailsData?.data?.poDetails ? poDetailsData?.data?.poDetails : []
    const handleSubmit = () => {
        if (selectedPos.length !== 0) {

            setForm(true)

        } else {
            toast.info('Please select po')
        }
    }
    return (
        <div className=" font-roboto  ">
            <div className='flex justify-between'>

                <div className='flex items-center'>
                    <div className="flex">
                        <div className="flex ">
                            <div className="mr-2">
                                <label className='text-xs' for="firstName">
                                    PO/NO :
                                </label>
                                <input
                                    className=" h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                                    id="firstName"
                                    type="text"
                                    placeholder="search"
                                    value={searchPoNo}
                                    onChange={(e) => {
                                        setSearchPoNo(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="mr-2">
                                <label className='text-xs' for="firstName">
                                    DATE :
                                </label>
                                <input
                                    className=" h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                                    id="firstName"
                                    type="text"
                                    placeholder="search"
                                    value={searchPoDate}
                                    onChange={(e) => { setSearchPoDate(e.target.value) }}
                                />
                            </div>
                        </div>
                        <div className="flex">
                            <div className="mr-2">
                                <label className='-1 text-xs' for="firstName">
                                    SUPPLIER NAME :
                                </label>
                                <input
                                    className=" h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                                    id="firstName"
                                    type="text"
                                    placeholder="search"
                                    value={searchPoSupplier}
                                    onChange={(e) => { setSearchPoSuppiler(e.target.value) }}
                                />
                            </div>
                            <div className="mr-2">
                                <label className='text-xs' for="firstName">
                                    DEL TO :
                                </label>
                                <input
                                    className=" h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                                    id="firstName"
                                    type="text"
                                    placeholder="search"
                                    value={searchPodelto}
                                    onChange={(e) => { setSearchPodelto(e.target.value) }}
                                />
                            </div>
                            <div className='flex justify-end mb-1'>  <button className={`${selectedPos.length !== 0

                                ? 'bg-green-400 hover:bg-green-700'
                                : 'bg-gray-300 hover:bg-orange-700'
                                } text-black text-xs p-[2px] rounded flex items-center`} onClick={handleSubmit
                                }  ><MdOutlineCreateNewFolder className='text-xl font-extrabold' />Create Dc</button>
                            </div>
                        </div>
                    </div>

                </div>

                <div>
                </div>

            </div>


            <div className='overflow-x-scroll'>
                <table className=" border text-xs overflow-x-scroll w-screen ">
                    <thead className='text-white'>
                        <tr className="bg-orange-600 border-b text-white">
                            <th className=" border-r cursor-pointer text-m   ">
                                Select
                            </th>
                            <th className=" border-r cursor-pointer text-m   ">
                                <h3>S/NO</h3>
                            </th>
                            <th className="p-1 border-r cursor-pointer text-m   ">
                                <h3>PO NO</h3>
                            </th>
                            <th className="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div className="flex items-center justify-center text-white">
                                    <h3>Po Date</h3>

                                </div>
                            </th>

                            <th className=" flex items-center justify-center text-center border-r cursor-pointer text-m  text-gray-500">
                                <div className=" text-white w-14">
                                    <h3 className=''>Exp Del Date</h3>

                                </div>
                            </th>
                            <th className="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div className="flex items-center justify-center text-white">
                                    <h3>Lead Days</h3>

                                </div>
                            </th>
                            <th className="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div className="flex items-center justify-center text-white">
                                    Pay terms

                                </div>
                            </th>
                            <th className="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div className="flex items-center justify-center text-white">
                                    <h3>Item</h3>

                                </div>
                            </th>

                            <th className="p-1 border-r cursor-pointer text-m   text-white">
                                <div className="flex items-center justify-center text-white">
                                    <h3>Fabric Agent</h3>

                                </div>
                            </th>

                            <th className="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div className="flex items-center justify-center text-white">
                                    Total Qty

                                </div>
                            </th>
                            <th className="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div className="flex items-center justify-center text-white">
                                    Gross Amt

                                </div>
                            </th>
                            <th className="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div className="flex items-center justify-center text-white">
                                    Net Amt

                                </div>

                            </th>

                            {/* <th className="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div className="flex items-center justify-center text-white">
                                    <h3>Delivery To</h3>

                                </div>
                            </th> */}


                        </tr>
                    </thead>

                    <tbody className=''>
                        {(data?.data ? data.data : []).map((item, index) => (
                            <>
                                <tr className={'even:bg-gray-300 odd:bg-white'}
                                    key={index}
                                >
                                    <td
                                        onClick={() => handleChangeSelectPo(item.poNo)}
                                        className=" p-1  whitespace-nowrap text-xs  text-left text-black-500 border-r-grey ">
                                        <input type="checkbox" name="" id="" checked={isPoSelected(item.poNo)} required />
                                    </td>
                                    <td className="pl-1  whitespace-nowrap text-xs  text-center text-black-500 border-r-grey ">
                                        {(index + 1) + (dataPerPage * (currentPageNumber - 1))}
                                    </td>
                                    <td className="whitespace-nowrap text-xs  text-left text-black ">
                                        {item.poNo}
                                    </td>
                                    <td className="  whitespace-nowrap text-xs text-left  ">
                                        <div className=" text-black">
                                        </div>
                                        {getMonthValue(item.poDate)}
                                    </td>
                                    <td className="  whitespace-nowrap text-xs  text-left text-black ">
                                        {getMonthValue(item.expDate)}
                                    </td>

                                    <td className="px--1  whitespace-nowrap text-xs  text-center text-black">
                                        {calculateDaysBetween(item.poDate, item.expDate)}
                                    </td>

                                    <td className="pr-1  whitespace-nowrap text-xs   text-black ">
                                        {item.payterms}
                                    </td>
                                    <td className="   whitespace-nowrap">
                                        <div className="text-xs text-left   text-black ">
                                            <button onClick={() => { setPo(item.poNo) }}
                                            > Click Here  </button>                    </div>
                                    </td>
                                    {po ? (
                                        <>
                                            <div
                                                className="justify-center items-center flex  fixed inset-0 z-50 outline-none focus:outline-none"
                                            >
                                                <div className="relative w-[40rem] ">

                                                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">

                                                        <div className="flex items-start justify-between p-2 border-b border-solid border-blueGray-200 rounded-t">

                                                            {/* <button
                                className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-xl leading-none font-semibold outline-none focus:outline-none"
                                onClick={() => setPo(item.poNo)}
                              >

                              </button> */}
                                                        </div>
                                                        <div className="relative p-1 flex-auto">
                                                            <>
                                                                <div key={index} className='flex  items-center'>
                                                                    <label className='text-bold text-[1rem]'>List  of items for this Po/No :</label>
                                                                    <h1 className='text-bold  text-[1rem] text-orange-700'><t />
                                                                        {poDetailsData?.data?.poNo}
                                                                    </h1>
                                                                </div>

                                                                <table className=" border text-xs  ">
                                                                    <thead className='text-white'>
                                                                        <tr className="bg-orange-600 border-b text-white">

                                                                            <th className=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div className="flex items-center justify-center text-white  px-[5rem]">
                                                                                    <h3>Fabric</h3>

                                                                                </div>
                                                                            </th>
                                                                            <th className=" border-r cursor-pointer text-m  text-white">
                                                                                <div className="flex items-center justify-center text-white">
                                                                                    <h3>Fabric clr</h3>

                                                                                </div>
                                                                            </th>

                                                                            <th className=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div className="flex items-center justify-center text-white  ">
                                                                                    <h3>order No</h3>

                                                                                </div>
                                                                            </th>
                                                                            <th className=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div className="flex items-center justify-center text-white">
                                                                                    Po Qty

                                                                                </div>

                                                                            </th>
                                                                            <th className=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div className="flex items-center justify-center text-white">
                                                                                    No Of Rolls

                                                                                </div>
                                                                            </th>

                                                                            <th className=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div className="flex items-center justify-center text-white">
                                                                                    Weight

                                                                                </div>
                                                                            </th>
                                                                            <th className=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div className="flex items-center justify-center text-white">
                                                                                    Price

                                                                                </div>
                                                                            </th>

                                                                        </tr>
                                                                    </thead>

                                                                    <tbody className=' even:bg-white odd:bg-orange-100'>
                                                                        {(poDetails).map((item, index) => (
                                                                            <tr className={index % 2 === 0 ? '' : 'bg-orange-100'} key={index}>

                                                                                <td className="py-2 border-r ">{item.yarn}</td>
                                                                                <td className="p-2 border-r ">{item.color}</td>

                                                                                <td className=" border-r ">{item.orderNo}</td>
                                                                                <td className="pl-5 border-r ">{item.poQty.toFixed(3)}</td>
                                                                                <td className="pl-2 flex
                                        justify-end py-2">{item.poBags}</td>

                                                                                <td className="pl-6 border-r ">{item.bagWeight ? parseFloat(item.bagWeight).toFixed(3) : ''}</td>
                                                                                <td className="pl-2 border-r  flex justify-end py-2">{item.price ? parseFloat(item.price).toFixed(2) : ''}</td>

                                                                            </tr>
                                                                        ))}

                                                                    </tbody>
                                                                </table>
                                                            </>

                                                        </div>
                                                        <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                                                            <button
                                                                className="text-red-500 background-transparent font-bold uppercase px-6  text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                                                type="button"
                                                                onClick={() => setPo("")}
                                                            >
                                                                Close
                                                            </button>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>

                                        </>
                                    ) : null}



                                    <td className="  whitespace-nowrap ">
                                        <div className="flex items-center">


                                            <div className=" w-auto uto ">
                                                <div className="text-xs  text-black-900 text-left break-all p--2 " >
                                                    {item.fabricAgentName
                                                    }

                                                </div>
                                                <div className="text-sm text-black-400">
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="pl-1  whitespace-nowrap text-xs  text-right   text-black-500 ">
                                        {item.totalQty.toFixed(3)}
                                    </td>
                                    <td className="pl-1  whitespace-nowrap text-xs  text-right text-black-500 ">
                                        {commaNumber(item.grossAmount.toFixed(2))}
                                    </td>
                                    <td className="pr-1  whitespace-nowrap text-xs  text-center text-black-500 text-right  ">
                                        {commaNumber(item.netAmount.toFixed(2))}
                                    </td>
                                    {/* <td className="px-2  whitespace-nowrap text-xs  text-center text-black-500 ">
                  {item.status}
                </td> */}

                                    {/* <td className=" whitespace-nowrap text-xs   text-black-500 flex  justify-end ">
                  {item.purchaseType}
                </td> */}
                                    {/* <td className="  ">
                                        <span
                                            className="  text-xs  text-black-800 "
                                        >
                                            {item.deliveryTo}
                                        </span>
                                    </td> */}


                                </tr>

                            </>
                        ))}
                        <>
                            {Array.from({ length: 17 - (data?.data ? data.data : []).length }).map((_, index) =>
                                <tr className={' even:bg-gray-300 odd:bg-white h-7'} key={index} >
                                    {Array.from({ length: 12 }).map((_, index) =>
                                        <td key={index}> </td>
                                    )}
                                </tr>)}
                        </>
                    </tbody>
                </table>

            </div>

            <ReactPaginate className=''
                previousLabel={"Prev"}
                nextLabel={"Next"}
                breakLabel={"..."}
                breakClassName={"break-me"}
                forcePage={pageNumberToReactPaginateIndex(currentPageNumber)}
                pageCount={Math.ceil(totalCount || 0) / dataPerPage}
                marginPagesDisplayed={1}
                onPageChange={handleOnclick}
                containerClassName={"flex justify-center m-1 gap-5 items-center "}
                pageClassName={"border custom-circle text-center text-xs "}
                disabledClassName={"p-1 "}
                previousLinkClassName={"border p-1 text-center  hover:bg-orange-500 text-xs px-2 rounded-xl"}
                nextLinkClassName={"border p-1  hover:bg-orange-500 text-xs  px-2 rounded-xl"}
                activeClassName={"bg-orange-700 text-white px-2 text-xs rounded-xl"} />
        </div>
    )
}

export default ToGreyFabricDeliveryReport