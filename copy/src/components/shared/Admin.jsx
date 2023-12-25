import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const AdminLogin = () => {
  return (
    <div className='home flex flex-row  h-screen w-screen ' >
      <Sidebar />
      <div className="flex-1 px-1.5 overflow-y-auto overflow-x-hidden scroll-smooth ">
        <Header />
        <div >{<Outlet />}</div>
      </div>
    </div>
  )
}

export default AdminLogin