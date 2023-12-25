import React from 'react'
import { useGetdyedYarnPoItemsQuery } from '../../redux/services/dyedYarnPo'
import commaNumber from 'comma-number'
import { toast } from 'react-toastify'

const SelectItems = ({ selectedPos, invoiceDetails, setInvoiceDetails, onModalClose }) => {

    function selectPo(poItem) { 
        setInvoiceDetails(prev => [...prev, { ...poItem, billQty: poItem.aDelQty,billRate: poItem.price }])
    }
    
    function removePo(poItem) {
        setInvoiceDetails(prev => prev.filter(po => parseInt(po.poDetId) !== parseInt(poItem.poDetId)))
    }
    function isPoItemSelected(poItem) {
        return invoiceDetails.findIndex(po => parseInt(po.poDetId) === parseInt(poItem.poDetId)) !== -1
    }
    function handleChangeSelectPoItem(poItem) {
        if (isPoItemSelected(poItem)) {
            removePo(poItem)
        } else {
            selectPo(poItem)
        }
    }

    const { data: poItems } = useGetdyedYarnPoItemsQuery({ filterPoList: JSON.stringify(selectedPos) }, { skip: selectedPos.length === 0 })
    const poItemsData = poItems?.data ? poItems?.data : [];
    console.log(poItems, ' po  itm');
    return (
        <div className='border-solid border-2 border-gray-300 '>
            <h1 className='text-xl text-orange-700 text-center'>select Po Items</h1>
            <table class="border text-xs overflow-x-scroll  w-full mr-2">
                <thead className='text-white'>
                    <tr class="bg-orange-600 border-b text-white ">
                        <th class=" border-r cursor-pointer text-m  text-gray-500  text-white">select
                        </th>
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
                            <div class="flex items-center justify-center text-white pr-3">
                                <h3>Color</h3>

                            </div>
                        </th>

                        <th class=" border-r cursor-pointer text-m  text-gray-500">
                            <div class="flex items-center justify-center text-white  ">
                                <h3>Order No</h3>

                            </div>
                        </th>
                        <th class=" border-r cursor-pointer text-m  text-gray-500">
                            <div class="flex items-center justify-center text-white">
                                Po Bags
                            </div>
                        </th>
                        <th class=" border-r cursor-pointer text-m  text-gray-500">
                            <div class="flex items-center justify-center text-white">
                                Po Qty

                            </div>

                        </th>
                        <th class=" border-r cursor-pointer text-m  text-gray-500">
                            <div class="flex items-center justify-center text-white">
                                Al del qty
                            </div>
                        </th>
                        <th class=" border-r cursor-pointer text-m  text-gray-500">
                            <div class="flex items-center justify-center text-white">
                                Price
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className=' even:bg-white odd:bg-blue-100 '>
                    {(poItemsData).map((item, index) => (
                        <tr className={"cursor-pointer"} key={index} onClick={() => handleChangeSelectPoItem(item)} >
                            <td className="py-1 border-r text-center"> <input type="checkbox" name="" id="" checked={isPoItemSelected(item)} readOnly /> </td>
                            <td className=" border-r text-center">{index + 1}</td>
                            <td className=" border-r ">{item.poNo}</td>
                            <td className=" border-r ">{item.yarn}</td>
                            <td className=" border-r text-left ">{item.color}</td>
                            <td className=" border-r text-left">{item.orderNo}</td>
                            <td className="pl-1 border-r text-right  ">{item?.poBags}</td>
                            <td className="flex-col  text-right ">{parseFloat(item?.poQty ? item?.poQty : 0).toFixed(3)}</ td>
                            <td className="pl-2 text-right">{parseFloat(item?.aDelQty ? item?.aDelQty : 0).toFixed(3)}</td>
                            <td className="pl-3 text-right ">{commaNumber(parseFloat(item?.price ? item?.price : 0).toFixed(2))}</td>
                        </tr>
                    ))}   </tbody>
            </table>
            <div className='flex justify-end'>
                <button onClick={onModalClose} className='bg-orange-600 text-white p-1 rounded mt-1 text-xs'>Done</button>
            </div>
        </div>
    )
}

export default SelectItems
