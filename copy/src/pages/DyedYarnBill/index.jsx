import { useState } from 'react';
import ToBill from './ToBill';
import PaidBills from './paidBills';
import { Tooltip } from '@mui/material';
import { LuRefreshCcw } from "react-icons/lu";
import { useGetDyedYarnPoQuery } from '../../redux/services/dyedYarnPo';
import { GiPayMoney } from "react-icons/gi";
import { MdRemoveRedEye } from 'react-icons/md'
const Bill = () => {
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [selectedPos, setSelectedPos] = useState([])
  let gtCompMastId = localStorage.getItem('gtCompMastId')

  const { refetch } = useGetDyedYarnPoQuery({ params: { gtCompMastId, billEntryFilter: true, isAccepted: true } })

  return (
    <div className='border-solid border-2 border-gray-300'>

      <div className='flex justify-between   border-solid border-2 border-gray-300 m-1'>
        <div>
          <h1 className='text-xl p--1   bg-clip-text text-orange-600 '>Dyed Yarn Invoice</h1>
        </div>
        <div className='flex gap-5  p-1 items-center'>
          <button className={`flex bg-gray-300 hover:bg-orange-700 hover: hover:text-white items-center text-xs p-1 rounded ${!alreadyPaid && "bg-orange-500 text-white"}`} autoFocus={true} onClick={() => setAlreadyPaid(false)} > <GiPayMoney className='text-lg  font-extrabold' />to pay</button>
          <button
            className={`bg-gray-300 text-black  hover:bg-orange-700 hover:text-white text-xs p-1 rounded flex items-center ${alreadyPaid && "bg-orange-500 text-white"}`}
            onClick={() => setAlreadyPaid(true)}>
            <MdRemoveRedEye className='text-xl font-extrabold' />
            view list
          </button>

          <Tooltip placement="top" title="Refresh"> <button className=' bg-orange-500 hover:bg-orange-700 hover: text-white p-1 rounded' onClick={refetch || fetch} ><LuRefreshCcw /></button>
          </Tooltip>
        </div></div>
      {alreadyPaid
        ?
        <PaidBills selectedPos={selectedPos} setSelectedPos={setSelectedPos} />
        :
        <ToBill selectedPos={selectedPos} setSelectedPos={setSelectedPos} />
      }
    </div>
  );
}
export default Bill;
