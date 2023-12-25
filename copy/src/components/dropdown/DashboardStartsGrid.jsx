import React, { useState } from "react";
import { AiOutlineDollarCircle, AiOutlineShoppingCart } from "react-icons/ai";
import { RiFileList2Line, RiWallet3Line, RiShoppingBagLine } from "react-icons/ri";
import { BiUpArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import { MdSyncProblem, MdIncompleteCircle } from "react-icons/md"
import { FcProcess } from "react-icons/fc"
import { Link } from 'react-router-dom'
import Delivery from "../../lib/links/Delivery";
import Bill from "../../lib/links/Bill";
const DashboardStartsGrid = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (

    <div >
      <div className="flex justify-between w-full ">     <h1 className=" justify-center text-lg  text-black font-medium  ">ORDER MANAGEMENT</h1>
        <div className="flex justify-end ">

          {/* <div className="static flex justify-end bg-sky-200">
            <button onClick={toggleDropdown} className=" bg-sky-100 text-sky-5 border-b-4 font-medium overflow-hidden relative px-5 py-2 rounded-md hover:bg-cyan-500 hover:text-white hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
              <span cl absolute top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]" ></span>   Create </button>

            {isDropdownOpen && (
              <div
                id="dropdown"
                className="m-14 absolute  right-8  bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
              >
                <ul
                  className="py-2 tex text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li>
                    <div className={`flex text-black items-center gap-2 font-light   rounded-md text-base  bg-gray-200 `}  >  <Delivery />
                    </div>
                  </li>
                  <li>
                    <div className={`flex text-black items-center gap-2 font-light   rounded-md text-base  bg-gray-200 `}  >  <Bill />
                    </div>
                  </li>

                </ul>
              </div>
            )}
          </div> */}
        </div>
      </div>


      <div className="flex gap-2 w-full flex-wrap ml-4">

        {/* <BoxWrapper>

          <div className="  ">
            <span className=" text-black tex font-semibold  tex"> received Quotation</span>
            <hr className="border-solid  border-1  border-gray-300  " />            <div className=" grid w-28 ">
              <div className="flex w-full justify-between"> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Today :   </Link></div>
                <div>  <span className=" text-green-600 tex">

                  37
                </span></div></div>
              <div className="flex w-full justify-between"> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Yesterday  :  </Link></div>
                <div >  <span className=" text-blue-600 tex">

                  37
                </span></div></div> <div className="flex w-full justify-between"> <div > <Link to={'products'} className=" tex  font-medium tex">Old :   </Link></div>
                <div>  <span className=" text-red-600 tex">

                  37
                </span></div></div>


            </div>
          </div>        </BoxWrapper> */}

        <BoxWrapper>

          <div className="w-full  flex flex-col justify-center ">
            <span className="text-black font-semibold tex mb-2">receiced po</span>
            <hr className="border-solid  border-1  border-gray-300  " />            <div className=" grid items-start w-28">
              <div className="flex w-full justify-between"> <div> <Link to={'products'} className="tex  font-medium tex">Today :   </Link></div>
                <div>  <span className=" text-green-600 tex">

                  &nbsp; 37
                </span></div></div>
              <div className="flex w-full justify-between"> <div> <Link to={'products'} className=" tex  font-medium tex">Yesterday :  </Link></div>
                <div>  <span className=" text-blue-600 tex">

                  37
                </span></div></div> <div className="flex w-full justify-between"> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Old :  </Link></div>
                <div>  <span className=" text-red-600 tex">

                  37
                </span></div></div>


            </div>
          </div>

        </BoxWrapper>
        <BoxWrapper>

          <div className="w-full  flex flex-col justify-center">
            <span className=" text-black  font-semibold tex  mb-2"> delivered details</span>
            <hr className="border-solid  border-1  border-gray-300  " />
            <div className=" grid items-start w-28">
              <div className="flex w-full justify-between  "> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Today :   </Link></div>
                <div>  <span className=" text-green-600 tex">

                  37
                </span></div></div>
              <div className="flex w-full justify-between"> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Yesterday :   </Link></div>
                <div >  <span className=" text-blue-600 tex">

                  37
                </span></div></div> <div className="flex w-full justify-between"> <div > <Link to={'products'} className="tex  font-medium tex">Old :  </Link></div>
                <div>  <span className=" text-red-600 tex">

                  37
                </span></div></div>


            </div>
          </div>
        </BoxWrapper>
        <BoxWrapper>

          <div className="w-full  flex flex-col justify-center">
            <span className=" text-black  font-semibold tex   mb-2"> invoice details</span>
            <hr className="border-solid  border-1  border-gray-300  " />
            <div className=" grid items-start w-28">
              <div className="flex w-full justify-between font-medium"> <div> <Link to={'products'} className=" tex mb-8  font-medium tex">Today :   </Link></div>
                <div>  <span className=" text-green-600 tex">

                  37
                </span></div></div>
              <div className="flex w-full justify-between"> <div> <Link to={'products'} className="tex mb-8 font-medium tex">Yesterday :   </Link></div>
                <div>  <span className=" text-blue-600 tex">

                  37
                </span></div></div> <div className="flex w-full justify-between"> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Old :  </Link></div>
                <div>  <span className=" text-red-600 tex">

                  37
                </span></div></div>


            </div>
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="w-full  flex flex-col justify-center">
            <span className=" text-black  font-semibold tex  mb-2"> invoice pending</span>
            <hr className="border-solid  border-1  border-gray-300  " />            <div className=" grid items-start w-28">
              <div className="flex w-full justify-between  "> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Today :   </Link></div>
                <div>  <span className=" text-green-600 tex">

                  37
                </span></div></div>
              <div className="flex w-full justify-between"> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Yesterday :   </Link></div>
                <div >  <span className=" text-blue-600 tex">

                  37
                </span></div></div> <div className="flex w-full justify-between"> <div > <Link to={'products'} className="tex  font-medium tex">Old :  </Link></div>
                <div>  <span className=" text-red-600 tex">

                  37
                </span></div></div>


            </div>
          </div>
        </BoxWrapper><BoxWrapper>

          <div className="w-full  flex flex-col justify-center">
            <span className=" text-black  font-semibold tex  mb-2"> received payments</span>
            <hr className="border-solid  border-1  border-gray-300  " />            <div className=" grid items-start w-28">
              <div className="flex w-full justify-between  "> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Today :   </Link></div>
                <div>  <span className=" text-green-600 tex">

                  37
                </span></div></div>
              <div className="flex w-full justify-between"> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Yesterday :   </Link></div>
                <div >  <span className=" text-blue-600 tex">

                  37
                </span></div></div> <div className="flex w-full justify-between"> <div > <Link to={'products'} className="tex  font-medium tex">Old :  </Link></div>
                <div>  <span className=" text-red-600 tex">

                  37
                </span></div></div>


            </div>
          </div>
        </BoxWrapper><BoxWrapper>
          <div className="w-full  flex flex-col justify-center">
            <span className=" text-black  font-semibold  tex  mb-2"> payments pending</span>
            <hr className="border-solid border-1 border-gray-300  " />            <div className=" grid items-start w-28">
              <div className="flex w-full justify-between  "> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Today :   </Link></div>
                <div>  <span className=" text-green-600 tex">

                  37
                </span></div></div>
              <div className="flex w-full justify-between"> <div> <Link to={'products'} className=" tex mb-8 font-medium tex">Yesterday :   </Link></div>
                <div >  <span className=" text-blue-600 tex">

                  37
                </span></div></div> <div className="flex w-full justify-between"> <div > <Link to={'products'} className="tex  font-medium tex">Old :  </Link></div>
                <div>  <span className=" text-red-600 tex">

                  37
                </span></div></div>


            </div>
          </div>
        </BoxWrapper>
      </div>



    </div>
  );
};

function BoxWrapper({ children }) {
  return (
    <div className='shadow  border-solid border-2 border-gray-300  bg-white rounded-md  p-2  h-32 justify-start flex items-center'>
      {children}
    </div>
  );
}


export default DashboardStartsGrid;
