import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { BsArrowRightCircle } from "react-icons/bs";
import { DASHBOARD_SIDEBAR_LINKS } from "../../lib/links/navigation";
import { Link, useLocation } from "react-router-dom";
import Profile from "../../lib/links/Profile";
import logo from '../../img/pin.png'
import ReceivedOrders from "../../lib/links/ReceivedOrders";
import Delivery from '../../lib/links/Delivery'
import Bill from "../../lib/links/Bill";
const linkClass = "flex text-black items-center gap-2 font-light px-3 py-2 hover:bg-orange-700 bg-gray-200 hover:no-underline hover:text-white  rounded-md text-base text-xs";

function SidebarLink({ item }) {
  const { pathname } = useLocation();
  return (
    <Link
      to={'/home'}
      className={classNames(
        pathname === item.path
          ? "bg-orange-700 text-white"
          : "text-xs",
        linkClass
      )}
    >
      <span className="text-xl">{item.icon}</span>
      {item.label}
    </Link>
  );
}

const Sidebar = () => {


  const [open, setOpen] = useState(false);
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  const detectSize = () => {
    setScreenSize(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener('resize', detectSize);

    return () => {
      window.removeEventListener('resize', detectSize);
      if (screenSize <= 1007) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    }
  }, [screenSize])

  return (
    <div className={`sidebar   linkClass  relative flex flex-col text-white text-xs ${open ? "w-[9rem]" : "w-0"} ${open ? "p-1" : "p-0"} duration-300`} >
      <BsArrowRightCircle className={`text-2xl text-indigo-950 bg-indigo-50 rounded-full absolute  top-9 cursor-pointer z-50 ${open && "rotate-180"}`} onClick={() => setOpen(!open)} />

      {/* <Link to='home' className={`flex text-center text-xs gap-2 px-1 py-3 hover:no-underline duration-300 ${!open && "scale-0"}`} >
      </Link> */}
      <img src={logo} alt="" className=" w-[10rem] h-[3rem]" />

      <div className={` mt-5 text-xs flex-1 w-full  flex flex-col gap-2 duration-300 ${!open && "scale-0"}`} >
        {DASHBOARD_SIDEBAR_LINKS.map((item) => (
          <SidebarLink key={item.key} item={item} onClick={() => setOpen(!open)} />
        ))}
        <div className={`flex text-black items-center gap-2 font-light rounded text-base bg-gray-200  `} > <ReceivedOrders />
        </div>
        <div className={`flex text-black items-center gap-2 font-light rounded-md text-base  "} bg-gray-200 `}  >  <Delivery />
        </div>
        <div className={`flex text-black items-center gap-2 font-light rounded-md text-base bg-gray-200 `}  >  <Bill />
        </div>
      </div>
      <div className={`text-xs flex flex-col gap-0.5 bg-orange-700 text-white items-center font-light px-1 py-1 mb-2 rounded-md text-base duration-300 ${!open && "scale-0"}`} >
        <Profile />
      </div>
    </div>
  )
}
export default Sidebar;
