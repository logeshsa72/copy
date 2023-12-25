import { useState } from 'react';
import Delivered from './Delivered';
import ToDelivery from './ToDelivery';
import { Tooltip } from '@mui/material';
import { LuRefreshCcw } from "react-icons/lu";
import { } from "react-icons/ci";
import { TbTruckDelivery } from "react-icons/tb";
import { MdRemoveRedEye } from "react-icons/md";
import { useGetAccessoryPoQuery } from '../../redux/services/accessoryPo';
const Delivery = () => {
  const [alreadyDelivered, setAlreadyDelivered] = useState(false);
  const [selectedPos, setSelectedPos] = useState([])
  let gtCompMastId = localStorage.getItem('gtCompMastId')

  const { refetch: fetch } = useGetAccessoryPoQuery({ params: { gtCompMastId, isAccepted: true, deliveryFilter: true } })
  return (
    <div className='border-solid border-2 border-gray-300 '>

      <div className='flex justify-between   border-solid border-2 border-gray-300 m-1'>

        <h1 className='text-xl p--1   bg-clip-text text-orange-600 '>Accessory Delivery</h1>

        <div className='flex gap-5 mr-1 p-1'>
          <button className={`bg-gray-300 text-black  hover:bg-orange-700 hover:text-white text-xs px-1 rounded flex items-center ${!alreadyDelivered && "bg-orange-500"}`} autoFocus={true} onClick={() => setAlreadyDelivered(false)} >< TbTruckDelivery className='text-xl font-extrabold' />Delivery</button>
          <button
            className={`bg-gray-300 text-black  hover:bg-orange-700 hover:text-white text-xs px-1 rounded flex items-center ${alreadyDelivered && "bg-orange-500"}`}
            onClick={() => setAlreadyDelivered(true)}>
            <MdRemoveRedEye className='text-xl font-extrabold' /> View list
          </button>
          <Tooltip placement="top" title="Refresh"> <button className=' bg-orange-500 hover:bg-orange-700 hover: text-white p-1 rounded' onClick={fetch} ><LuRefreshCcw /></button>
          </Tooltip>
        </div>
      </div>
      {alreadyDelivered
        ?
        <Delivered selectedPos={selectedPos} setSelectedPos={setSelectedPos} />
        :
        <ToDelivery selectedPos={selectedPos} setSelectedPos={setSelectedPos} />
      }
    </div>
  );
}
export default Delivery;
