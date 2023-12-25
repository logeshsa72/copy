import React from 'react'
import { useGetUserQuery } from '../../redux/services/user'
import Model from '../model/userModel'
const Users = () => {
  const { data, isLoading, isFetching } = useGetUserQuery({ refetchOnMountOrArgChange: true })

  return (
    <div className='flex-col'>
      <Model />
      <div className='flex '>


        <div class="grid grid-cols-3  ">
          {(data?.data ? data.data : []).map((item, index) => (
            <div key={index}
              class="w-auto max-w-sm rounded-lg bg-white p-1 drop-shadow-2xl divide-y divide-gray-00 m-4"
            >

              <div class="font-medium relative text-s leading-tight text-gray-900">
                <span class="flex">
                  <div className="flex w-full justify-between"> <div > User Name : </div>
                    <div className='text-gray-500'>

                      {item.userName}
                    </div></div>
                </span>
              </div>
              {/* <p class="font-normal text-base leading-tight  ">PartyId : {'\t'}
                      {item.gtCompMastId}
                    </p> */}






              <div class="pt-2">
                <div class="font-medium relative text-s leading-tight text-gray-900">
                  <span class="flex">
                    <div className="flex w-full justify-between"> <div> Supplier Name /<br /> Customer Name : </div>
                      <div className='text-gray-500'>

                        {item.compName}
                      </div></div>
                  </span>
                </div>
                {/* <button
             type="button"
             class="flex items-center space-x-3 py-3 px-4 w-full leading-6 text-lg text-gray-600 focus:outline-none hover:bg-gray-100 rounded-md"
           >
           
             <span>Disable</span>
           </button> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Users