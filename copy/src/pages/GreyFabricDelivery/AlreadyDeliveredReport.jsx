import { useState } from 'react'
import { getMonthValue } from '../../utils/date';
import { reactPaginateIndexToPageNumber, pageNumberToReactPaginateIndex, } from '../../utils/helper'
import ReactPaginate from 'react-paginate';
import { useMemo } from 'react';
import { useGetGreyFabricPoDeliveryQuery } from '../../redux/services/greyFabricPoDelivery';
const AlreadyDeliveredReport = ({ setDocNo }) => {
    const [searchDelNo, setSearchDelNo] = useState('')
    const [searchPoDate, setSearchPoDate] = useState('')
    const [searchPoSupplier, setSearchPoSuppiler] = useState('')
    const [searchPodelto, setSearchPodelto] = useState('')
    const commaNumber = require('comma-number')
    const [dataPerPage, setDataPerPage] = useState("10");
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    let gtCompMastId = localStorage.getItem('gtCompMastId')

    const { data: fabricPoDeliveryData } = useGetGreyFabricPoDeliveryQuery({ params: { gtCompMastId } })

    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }

    let deliveryItems = useMemo(() => fabricPoDeliveryData?.data ? fabricPoDeliveryData.data : [], [fabricPoDeliveryData])

    // deliveryItems = filterSearch([
    //   { field: "poNo", searchValue: searchPoNo },
    //   { field: 'poDate', searchValue: searchPoDate, isDate: true },
    //   { field: 'delieveryTo', searchValue: searchDeliveryTo },
    // ], deliveryItems);

    const totalCount = deliveryItems.length

    deliveryItems = deliveryItems.slice(dataPerPage * (currentPageNumber - 1), dataPerPage * currentPageNumber);

    return (
        <div class="font-roboto p-1 border-solid border-2 border-gray-300 ">
            <div class="flex items-center">

                <div className='flex'>
                    <div class="flex ">
                        <div class="m-2">
                            <label className='text-xs' for="firstName">
                                DEL No:
                            </label>
                            <input
                                class="  h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                                id="firstName"
                                type="text"
                                placeholder="search"
                                value={searchDelNo}
                                onChange={(e) => {
                                    setSearchDelNo(e.target.value);
                                }}
                            />
                        </div>
                        <div class="m-2 ">
                            <label className='text-xs' for="firstName">
                                DATE :
                            </label>
                            <input
                                class="  h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                                id="firstName"
                                type="text"
                                placeholder="search"
                                value={searchPoDate}
                                onChange={(e) => { setSearchPoDate(e.target.value) }}
                            />
                        </div>
                    </div>
                    <div class="flex">
                        <div class="m-2">
                            <label className='-1 text-xs' for="firstName">
                                SUPPLIER NAME :
                            </label>
                            <input
                                class="  h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                                id="firstName"
                                type="text"
                                placeholder="search"
                                value={searchPoSupplier}
                                onChange={(e) => { setSearchPoSuppiler(e.target.value) }}
                            />
                        </div>
                        <div class="m-2">
                            <label className='text-xs' for="firstName">
                                DEL TO :
                            </label>
                            <input
                                class="  h-5  w-[7rem]  text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                                id="firstName"
                                type="text"
                                placeholder="search"
                                value={searchPodelto}
                                onChange={(e) => { setSearchPodelto(e.target.value) }}
                            />

                        </div>

                    </div>

                </div>
                <div>
                </div>

            </div>
            <div className='overflow-x-scroll'>
                <table class="  text-xs overflow-x-scroll w-full">
                    <thead className='text-white'>
                        <tr class="bg-orange-600 border-b text-white">
                            <th class=" border-r cursor-pointer text-m   ">
                                <h3>S/NO</h3>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m   ">
                                <h3>
                                    Del No:
                                </h3>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    <h3>Delivery To</h3>
                                </div>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    <h3>Del Date</h3>
                                </div>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    Dc Date
                                </div>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    Remarks
                                </div>
                            </th>
                            <th class="p-1 border-r cursor-pointer text-m  text-gray-500">
                                <div class="flex items-center justify-center text-white">
                                    <h3>Vehicle</h3>
                                </div>
                            </th>

                            <th class="p-1 border-r cursor-pointer text-m  text-white">
                                <div class="flex items-center justify-center text-white">
                                    <h3>Dc No.</h3>

                                </div>
                            </th>



                        </tr>
                    </thead>

                    <tbody className=''>
                        {(deliveryItems).map((item, index) => (
                            <>
                                <tr className={' even:bg-gray-300 odd:bg-white'}
                                    key={index}
                                    onClick={() => setDocNo(item.gfPoInwardNo)}
                                >
                                    <td className="py-[2px]whitespace-nowrap text-xs font-medium text-center text-black-500 border-r-grey "
                                    >
                                        {(index + 1) + (dataPerPage * (currentPageNumber - 1))}
                                    </td>
                                    <td className="py-[2px]whitespace-nowrap text-xs font-medium text-left text-black ">
                                        {item.gfPoInwardNo}
                                    </td>
                                    <td className="py-[2px]  ">
                                        <span
                                            className="py-[2px]  text-xs  text-black-800 "
                                        >
                                            {item.compName}
                                        </span>
                                    </td>
                                    <td className="py-[2px]  whitespace-nowrap text-xs text-left font-medium ">
                                        <div className="py-[2px] text-black">
                                        </div>
                                        {getMonthValue(item.gfPoInwardDate)}
                                    </td>
                                    <td className="py-[2px]  whitespace-nowrap text-xs font-medium text-left   text-black-500 ">
                                        {getMonthValue(item.dcDate)}
                                    </td>
                                    <td className="py-[2px]  whitespace-nowrap text-left text-xs font-medium  text-black ">
                                        {item.remarks}
                                    </td>
                                    <td className="py-[2px]  whitespace-nowrap text-left text-xs font-medium  text-black ">
                                        {item.vehicleNo}
                                    </td>
                                    <td className="py-[2px]  whitespace-nowra text-right text-xs font-medium  text-black ">
                                        {item.supplierDcNo}
                                    </td>


                                </tr>
                            </>
                        ))}
                        <>
                            {Array.from({ length: 17 - (fabricPoDeliveryData?.data ? fabricPoDeliveryData.data : []).length }).map((_, index) =>
                                <tr className={' even:bg-gray-300 odd:bg-white h-7 '} key={index} >
                                    {Array.from({ length: 8 }).map((_, index) =>
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

export default AlreadyDeliveredReport