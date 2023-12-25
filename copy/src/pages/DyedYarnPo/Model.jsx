import React,{useState, useEffect} from 'react'
import { useGetDyedYarnPoQuery, useUpdateStatusMutation, useGetdyedYarnPoDeatilsByIdQuery } from '../../redux/services/dyedYarnPo'
const Model = () => {
    const [po, setPo] = useState()
    let gtCompMastId = localStorage.getItem('gtCompMastId')
    const { data } = useGetDyedYarnPoQuery({ gtCompMastId })
console.log();
    const { data: poDetails } = useGetdyedYarnPoDeatilsByIdQuery({ poNo: po });
    console.log(poDetails);
    const [showModal, setShowModal] = useState(false);

  

  return (
    <div> 
        <>
          <div
            className="justify-center items-center flex  fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-[50rem] ">

              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">

                <div className="flex items-start justify-between p-2 border-b border-solid border-blueGray-200 rounded-t">

                  
                </div>
                <div className="relative p-1 flex-auto">
                  <>
                    <table class=" border text-xs  ">
                      <thead className='text-white'>
                        <tr class="bg-orange-600 border-b text-white">
                          <th class=" border-r cursor-pointer text-m font-thin  px-16">
                            <h3>PO/NO</h3>
                          </th>
                          <th class=" border-r cursor-pointer text-m font-thin text-gray-500">
                            <div class="flex items-center justify-center text-white  px-[5rem]">
                              <h3>Yarn</h3>

                            </div>
                          </th>
                          <th class=" border-r cursor-pointer text-m font-thin text-gray-500 text-white">
                            <div class="flex items-center justify-center text-white">
                              <h3>Yarn clr</h3>

                            </div>
                          </th>
                          <th class=" border-r cursor-pointer text-m font-thin text-gray-500">
                            <div class="flex items-center justify-center text-white">
                              <h3>Process Name</h3>

                            </div>
                          </th>
                          <th class=" border-r cursor-pointer text-m font-thin text-gray-500">
                            <div class="flex items-center justify-center text-white  px-16">
                              <h3>order No</h3>

                            </div>
                          </th>
                          <th class=" border-r cursor-pointer text-m font-thin text-gray-500">
                            <div class="flex items-center justify-center text-white">
                              No Of Bags

                            </div>
                          </th>
                          <th class=" border-r cursor-pointer text-m font-thin text-gray-500">
                            <div class="flex items-center justify-center text-white">
                              Po Qty

                            </div>

                          </th>
                          <th class=" border-r cursor-pointer text-m font-thin text-gray-500">
                            <div class="flex items-center justify-center text-white">
                              Bag Weight

                            </div>
                          </th>
                          <th class=" border-r cursor-pointer text-m font-thin text-gray-500">
                            <div class="flex items-center justify-center text-white">
                              Price

                            </div>
                          </th>

                        </tr>
                      </thead>

                      <tbody className=' even:bg-white odd:bg-blue-100'>
                        {(poDetails?.data ? poDetails.data : []).map((item, index) => (
                          <tr className={index % 2 === 0 ? '' : 'bg-orange-200'} key={index}>

                            <td className="p-2 border-r ">{item.poNo}</td>
                            <td className="p-2 border-r ">{item.yarn}</td>
                            <td className="p-2 border-r ">{item.yarnColor}</td>
                            <td className="p-2 border-r ">{item.processName}</td>
                            <td className="p-2 border-r ">{item.orderNo}</td>
                            <td className="p-2 border-r ">{item.nopOfBags}</td>
                            <td className="p-2 border-r ">{item.poQty}</td> <td className="p-2 border-r w-12">{item.bagWeight}</td> <td className="p-2 border-r w-12">{item.bagWeight}</td>

                          </tr>
                        ))}

                      </tbody>
                    </table>
                  </>

                </div>
              
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>

        </>
     
</div>
  )
}

export default Model