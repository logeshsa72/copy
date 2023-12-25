import React, { useState } from 'react';
import {AiFillDelete, AiFillEdit} from  'react-icons/ai'
import {productSell} from '../components/data'
function getDate() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  return `${month}/${date}/${year}`;
}



const Status = () => {
  const [currentDate, setCurrentDate] = useState(getDate());

  return (
<div>

<div class="table font-roboto table w-full p-2 text-center">
    <h1 className='text-2xl'>YARN PURCHASE ORDER</h1>
<div class="mb-4 md:flex md:justify-start">
<div class="mb-4 md:flex-col md:justify-start">
								<div class="m-2">
									<label className='-1 text-xs'  for="firstName">
									PO/NO :  
									</label> 
								  	<input
										class=" px-1 py-1 text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
										id="firstName"
										type="text"
										placeholder="search"
									/>
								</div>
								<div class="md:ml-2">
									<label class="-1 text-xs" for="lastName">
									DATE :
									</label>
									<input
										class=" px-1 py-1 text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
										id="lastName"
										type="text"
										placeholder="search"
									/>
								</div>
                </div>    <div class="mb-4 md:flex-col md:justify-start">
								<div class="m-2">
									<label className='-1 text-xs'  for="firstName">
									NAME :  
									</label> 
								  	<input
										class=" px-1 py-1 text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
										id="firstName"
										type="text"
										placeholder="search"
									/>
								</div>
								<div class="">
									<label class="-1 text-xs" for="lastName">YARN :
									</label>
									<input
										class=" px-1 py-1 text-xs leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
										id="lastName"
										type="text"
										placeholder="search"
									/>
								</div>
                </div>
</div>
        <table class="w-full border text-xs  ">
            <thead className='text-white'>
                <tr class="bg-orange-600 border-b text-white">
                    <th class="p-2 border-r cursor-pointer text-m font-thin  ">
                       <h3>PO/NO</h3>
                    </th>
                    <th class="p-2 border-r cursor-pointer text-m font-thin text-gray-500">
                        <div class="flex items-center justify-center text-white">
                        <h3>Date</h3>
                        
                        </div>
                    </th>
                    <th class="p-2 border-r cursor-pointer text-m font-thin text-gray-500 text-white">
                        <div class="flex items-center justify-center text-white">
                      <h3>Yarn Agent</h3>
                          
                        </div>
                    </th>
                    <th class="p-2 border-r cursor-pointer text-m font-thin text-gray-500">
                        <div class="flex items-center justify-center text-white">
                        <h3>yarn desc</h3>
                           
                        </div>
                    </th>
                    <th class="p-2 border-r cursor-pointer text-m font-thin text-gray-500">
                        <div class="flex items-center justify-center text-white">
                    <h3>Delivery to</h3>
                          
                        </div>
                    </th>
                    <th class="p-2 border-r cursor-pointer text-m font-thin text-gray-500">
                        <div class="flex items-center justify-center text-white">
                           Weight
                            
                        </div>
                    </th>
                    <th class="p-2 border-r cursor-pointer text-m font-thin text-gray-500">
                        <div class="flex items-center justify-center text-white">
                       Activity
                            
                        </div>
                        
                    </th>
                    <th class="p-2 border-r cursor-pointer text-m font-thin text-gray-500">
                        <div class="flex items-center justify-center text-white">
                           Weight
                            
                        </div>
                    </th>
                    <th class="p-2 border-r cursor-pointer text-m font-thin text-gray-500">
                        <div class="flex items-center justify-center text-white">
                         rate
                            
                        </div>
                    </th>
                    <th class="p-2 border-r cursor-pointer text-m font-thin text-gray-500">
                        <div class="flex items-center justify-center text-white">
                     balance
                            
                        </div>
                    </th>
                </tr>
            </thead>
       
            <tbody className=' even:bg-white odd:bg-blue-100'>
            {productSell.map((product, index) => (
  <tr className={index % 2 === 0 ? '' : 'bg-orange-200'} key={product.id}>
   
    <td className="p-2 border-r w-12">{product.id}</td>
    <td className="p-2 border-r w-16">{currentDate}</td>
    <td className="p-2 border-r w-58">{product.description}</td>

    <td className="p-2 border-r w-28">{product.party}</td>

    <td className="p-2 border-r w-28">john@gmail.com</td>
    <td className="p-2 border-r w-28">Sydney, Australia</td>
   
    <td className="p-2 border-r w-28">{product.rate}</td>

    <td className="p-2 border-r w-28">{product.balance}</td>
    <td className="p-2 border-r w-58">{product.description}</td>
    <td className='p-2  w-16'>
    <div className='flex'>  <a href="#" className="bg-blue-500 p-2 text-white hover:shadow-lg text-xs font-thin"><AiFillDelete/></a>
      <a href="#" className="bg-red-500 p-2 text-white hover:shadow-lg text-xs font-thin"><AiFillEdit/></a></div>
    </td>
  </tr>
))}

            </tbody>
        </table>
    </div>
</div>  
  );
};

export default Status;













