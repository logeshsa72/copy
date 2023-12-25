import { useState, useEffect } from 'react'
import { useGetGreyFabricPoQuery, useUpdateStatusMutation, useGetGreyFabricPoDetailsByIdQuery } from '../../redux/services/greyFabricPo'
import { GiCheckMark } from "react-icons/gi";
import { FaCircleXmark } from "react-icons/fa6"
import { toast } from 'react-toastify';
import { calculateDaysBetween, getMonthValue } from '../../utils/date';
import { reactPaginateIndexToPageNumber, pageNumberToReactPaginateIndex, filterSearch } from '../../utils/helper'
import Tooltip from '@mui/material/Tooltip';
import ReactPaginate from 'react-paginate';
import { useMemo } from 'react';
import { LuRefreshCcw } from "react-icons/lu";

const GreyFabricPo = () => {

    const [searchPoNo, setSearchPoNo] = useState('')
    const [searchPoDate, setSearchPoDate] = useState('')
    // const [searchDeliveryTo, setSearchDeliveryTo] = useState('')
    const commaNumber = require('comma-number')
    const [dataPerPage, setDataPerPage] = useState("20");
    const [showModal, setShowModal] = useState(false);
    const [po, setPo] = useState("")
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [showAcceptedPo, setShowAcceptedPo] = useState(undefined)
    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }

    let gtCompMastId = localStorage.getItem('gtCompMastId')


    const { data, refetch, isLoading, isFetching } = useGetGreyFabricPoQuery({ params: { gtCompMastId, isAccepted: showAcceptedPo } })
    useEffect(() => {
        setCurrentPageNumber(1)
    }, [])
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
    console.log(poDetails, ' po');
    const handleModel = (po) => {
        setShowModal(true)
        setPo(po)
    }
    let poData = useMemo(() => data?.data ? data.data : [], [data])

    console.log(data, 'data');

    poData = filterSearch([
        { field: "poNo", searchValue: searchPoNo },
        { field: 'poDate', searchValue: searchPoDate, isDate: true },
        // { field: 'delieveryTo', searchValue: searchDeliveryTo },
    ], poData);

    const totalCount = poData.length
    poData = poData.slice(dataPerPage * (currentPageNumber - 1), dataPerPage * currentPageNumber);

    return (
        <div class="font-roboto  border-solid border-2 border-gray-300  ">
            <div className='flex justify-between items-center m-1   border-solid border-2 border-gray-300 '>
                <h1 className='text-xl text-orange-600 '>FABRIC PURCHASE ORDER</h1>
                <div className='flex justify-end'>

                    <div className='flex gap-5 text-xs items-end m-2'>
                        <div><button className={`${showAcceptedPo === undefined ? 'bg-green-400 text-white rounded p-1' : 'bg-gray-200 rounded p-1'}`} onClick={() => setShowAcceptedPo(undefined)}>Show All</button></div>  <div><button className={`${showAcceptedPo === true ? 'bg-green-400 text-white  rounded p-1' : 'bg-gray-200  rounded p-1'}`} onClick={() => setShowAcceptedPo(true)}>Accepted</button></div>
                        <div><button className={`${showAcceptedPo === false ? 'bg-green-400 text-white rounded p-1' : 'bg-gray-200 rounded p-1'}`} onClick={() => setShowAcceptedPo(false)}>Not Accepted</button></div>

                        <Tooltip placement="top" title="Refresh"> <button className='bg-orange-500 hover:bg-orange-700 hover: text-white p-1 rounded' onClick={refetch} ><LuRefreshCcw /></button>
                        </Tooltip>
                    </div>
                </div>

            </div>
            <div class="flex ">
                <div class="flex ">

                    <div class="m-2 ">
                        <label className='text-xs' for="firstName">
                            PO/NO :
                        </label>
                        <input
                            class=" h-[1.5rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            id="firstName"
                            type="text"
                            placeholder="search"
                            value={searchPoNo}
                            onChange={(e) => {
                                setSearchPoNo(e.target.value);
                            }}
                        />
                    </div>
                    <div class="m-2">
                        <label className='text-xs' for="firstName">
                            DATE :
                        </label>
                        <input
                            class="w-[4rem] h-[1.5rem]   text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            id="firstName"
                            type="text"
                            placeholder="search"
                            value={searchPoDate}
                            onChange={(e) => { setSearchPoDate(e.target.value) }}
                        />
                    </div>
                </div>    <div class="flex">
                    <div class="m-2">
                        <label className='-1 text-xs' for="firstName">
                            DEL TO:
                        </label>
                        {/* <input
                            class="w-[4rem] h-[1.5rem] text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            id="firstName"
                            type="text"
                            placeholder="search"
                            value={searchDeliveryTo}
                            onChange={(e) => { setSearchDeliveryTo(e.target.value) }}
                        /> */}
                    </div>


                </div>

            </div>
            <div className='overflow-x-scroll'>
                <table class=" border text-xs overflow-x-scroll w-screen ">
                    <thead className='text-white'>
                        <tr class="bg-orange-600 border-b text-white">
                            <th class=" border-r cursor-pointer text-m   ">
                                <h3>S/NO</h3>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m   ">
                                <h3>PO NO</h3>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    <h3>Po Date</h3>

                                </div>
                            </th>

                            <th class=" flex items-center justify-center text-center border-r cursor-pointer text-m  text-gray-500">
                                <div class=" text-white w-14">
                                    <h3 className=''>Exp Del Date</h3>

                                </div>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    <h3>Lead Days</h3>

                                </div>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    Pay terms

                                </div>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    <h3>Item</h3>

                                </div>
                            </th>

                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500 text-white">
                                <div class="flex items-center justify-center text-white">
                                    <h3>Fabric Agent</h3>

                                </div>
                            </th>

                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    Total Qty

                                </div>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    Gross Amt

                                </div>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    Net Amt

                                </div>

                            </th>
                            {/* <th class="p-2 border-r cursor-pointer text-m  text-gray-500">
                <div class="flex items-center justify-center text-white">
                  Status

                </div>
              </th> */}


                            {/* <th class="p-2 border-r cursor-pointer text-m  text-gray-500">
                <div class="flex items-center justify-center text-white">
                  Purchase Typ

                </div>
              </th> */}

                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    <h3>Delivery To</h3>

                                </div>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    Actions
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className=''>
                        {poData.map((item, index) => (
                            <>
                                <tr className={' even:bg-gray-300 odd:bg-white'} key={index}
                                >
                                    <td className="pl-1  whitespace-nowrap text-xs  text-center text-black-500 border-r-grey-400 ">
                                        {(index + 1) + (dataPerPage * (currentPageNumber - 1))}
                                    </td>
                                    <td className="  whitespace-nowrap text-xs  text-left text-black ">
                                        {item.poNo}
                                    </td>
                                    <td className="px-1  whitespace-nowrap text-xs text-left  ">
                                        <div className=" text-black">
                                        </div>
                                        {getMonthValue(item.poDate)}
                                    </td>
                                    <td className="px-1  whitespace-nowrap text-xs  text-left text-black ">
                                        {getMonthValue(item.expDate)}
                                    </td>

                                    <td className="px--1   whitespace-nowrap text-xs  text-center text-black">
                                        {calculateDaysBetween(item.poDate, item.expDate)}
                                    </td>

                                    <td className="pr-1  whitespace-nowrap text-xs   text-black ">
                                        {item.payterms}
                                    </td>
                                    <td className="   whitespace-nowrap">
                                        <div className="text-xs text-left   text-black ">
                                            <button onClick={() => { handleModel(item.poNo) }}
                                            > Click Here  </button>                    </div>
                                    </td>
                                    {showModal ? (
                                        <>
                                            <div
                                                className="justify-center items-center flex  fixed inset-0 z-50 outline-none focus:outline-none"
                                            >
                                                <div className="relative w-[auto] ">

                                                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">

                                                        <div className="flex items-start justify-between p-2 border-b border-solid border-blueGray-200 rounded-t">

                                                            <button
                                                                className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-xl leading-none font-semibold outline-none focus:outline-none"
                                                                onClick={() => setShowModal(false)}
                                                            >

                                                            </button>
                                                        </div>
                                                        <div className="relative p-1 flex-auto">
                                                            <>
                                                                {(poDetails).map((item, index) => (
                                                                    <div key={index} className='flex  items-center'><label className='text-bold text-[1rem]'>List  of items for this Po/No :</label> <h1 className='text-bold  text-[1rem] text-orange-700'><t />{poDetailsData.data.poNo}</h1> </div>
                                                                ))}
                                                                <table class=" border text-xs  ">
                                                                    <thead className='text-white'>
                                                                        <tr class="bg-orange-600 border-b text-white">

                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white  px-[5rem]">
                                                                                    <h3>Fabric Name</h3>

                                                                                </div>
                                                                            </th>
                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500 text-white">
                                                                                <div class="flex items-center justify-center text-white">
                                                                                    <h3>Fabric Clr</h3>

                                                                                </div>
                                                                            </th>
                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white">
                                                                                    <h3>Uom</h3>

                                                                                </div>
                                                                            </th>
                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white">

                                                                                    <h3>F-Dia</h3>
                                                                                </div>
                                                                            </th>
                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white">
                                                                                    <h3>K-Dia</h3>

                                                                                </div>
                                                                            </th>
                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white">
                                                                                    <h3>Gsm</h3>

                                                                                </div>
                                                                            </th>
                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white">
                                                                                    <h3>Gg</h3>

                                                                                </div>
                                                                            </th>
                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white">
                                                                                    <h3>L.LEN</h3>

                                                                                </div>
                                                                            </th>
                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white">
                                                                                    <h3>f.Design</h3>

                                                                                </div>
                                                                            </th>

                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white  ">
                                                                                    <h3>order No</h3>

                                                                                </div>
                                                                            </th>
                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white">
                                                                                    Po Qty

                                                                                </div>

                                                                            </th>
                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white">
                                                                                    No Of Rolls

                                                                                </div>
                                                                            </th>


                                                                            <th class=" border-r cursor-pointer text-m  text-gray-500">
                                                                                <div class="flex items-center justify-center text-white">
                                                                                    Price

                                                                                </div>
                                                                            </th>

                                                                        </tr>
                                                                    </thead>{console.log(poDetails, "poDetails")}

                                                                    <tbody className=' even:bg-white odd:bg-blue-100'>
                                                                        {(poDetails).map((item, index) => (
                                                                            <tr className={index % 2 === 0 ? '' : 'bg-orange-100'} key={index}>

                                                                                <td className="p-2 border-r ">{item?.fabric}</td>
                                                                                <td className="p-2 border-r ">{item?.color}</td>
                                                                                <td className="p-2 border-r ">{item?.uom}</td>
                                                                                <td className="p-2 border-r ">{item?.fDia}</td>
                                                                                <td className="p-2 border-r ">{item?.kDia}</td>
                                                                                <td className="p-2 border-r ">{item?.gsm}</td>
                                                                                <td className="p-2 border-r ">{item?.gg}</td>
                                                                                <td className="p-2 border-r ">{item?.ll}</td>
                                                                                <td className="p-2 border-r ">{item?.fabricDesign}</td>



                                                                                <td className=" border-r ">{item?.orderNo}</td>
                                                                                <td className="pl-5 border-r ">{item?.poQty}</td>
                                                                                <td className="text-center
                                        ">{item?.roll}</td>


                                                                                <td className="pl-2 border-r pl-2 flex justify-end py-2">{item?.price ? parseFloat(item?.price).toFixed(2) : ''}</td>

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
                                                                onClick={() => setShowModal(false)}
                                                            >
                                                                Close
                                                            </button>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="opacity-25 fixed inset-0 z-40"></div>

                                        </>
                                    ) : null}



                                    <td className="  whitespace-nowrap ">
                                        <div className="flex items-center">


                                            <div className=" w-auto uto ">
                                                <div className="text-xs  text-black-900 text-left break-all p--2 " >
                                                    {(item.fabricAgentName)}
                                                </div>
                                                <div className="text-sm text-black-400">
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="pl-1  whitespace-nowrap text-xs  text-right   text-black-500 ">
                                        {(item.totalQty.toFixed(3))}
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
                                    <td className="  ">
                                        <span
                                            className="  text-xs  text-black-800 "
                                        >
                                            {item.deliveryTo}
                                        </span>
                                    </td>
                                    <td className="  text-xs  text-center text-black-500   ">
                                        {(item.isAccepted ? <Tooltip placement="top" title="Accepted"> <button> <GiCheckMark className='text-xl text-green-500' /></button> </Tooltip> : <Tooltip placement="top" title="Not Accepted"> <button ><FaCircleXmark className='hover:text-green-500 text-xl' onClick={() => handleStatus(item.poNo)} /></button> </Tooltip>)}
                                    </td>

                                </tr>

                            </>
                        ))}
                        <>
                            {Array.from({ length: 20 - (data?.data ? data.data : []).length }).map((_, index) =>
                                <tr className={' even:bg-gray-300 odd:bg-white h-7'} key={index} >
                                    {Array.from({ length: 13 }).map((_, index) =>
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

export default GreyFabricPo