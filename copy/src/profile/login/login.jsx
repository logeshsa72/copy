import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from 'react-router-dom';
import './login.css'
import logo from '../../img/pin.png'
import { useLoginUserMutation } from '../../redux/services/user';
const LoginForm = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [loginUser] = useLoginUserMutation()
  const [username, setUserName] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false);

  // functions
  async function submitHandler(e) {
    e.preventDefault();
    let data = { username, password }
    let response = await loginUser(data).unwrap()
    if (response.statusCode === 0) {
      alert('login sucessfull')
      navigate('/home')
    } else if (response.statusCode === 1) {
      alert('Enter valid details')
    }
    localStorage.setItem('gtCompMastId', response.data.gtCompMastId
    )
  }

  return (
    <section className='log h-screen w-full flex content-center justify-center items-center gap-20 '>
      <section className='com  rounded-tr-3xl rounded-bl-3xl  shadow-2xl  p-8 w-[17rem] h-[21rem]  '>
        <img src={logo} alt="" className='bg-white rounded-tr-3xl rounded-bl-3xl' />

        <p className='italic hover:not-italic '><span class="text-transparent md:text-xl  bg-clip-text bg-gradient-to-br from-orange-500 to-red-600 animate-text  pr-1">PINNACLE</span> Thulliam operates as a division under the corporate umbrella of the Pinnacle System.
          Hence it executes all its operations and implementations  under the distinct brand name of Thulliam.</p>


        <a href="https://pinnaclesystems.co.in/" target="_blank" class="relative inline-flex items-center justify-center p-4 px-6 py-3 overflow-hidden font-medium  transition duration-300 ease-out border-2 border-cyan-400 rounded-full shadow-md group">
          <span class="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-cyan-400 group-hover:translate-x-0 ease">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
          <span class="absolute flex items-center justify-center font-semibold w-full h-full text-cyan-400 transition-all duration-300 transform group-hover:translate-x-full ease">Let's Talk</span>
          <span class="relative invisible">Button Text</span>
        </a>
      </section>
      <div className=' login w-[17rem] h-[21rem] rounded-tr-3xl rounded-bl-3xl  shadow-2xl  p-8'><form onSubmit={submitHandler}

        className=" flex flex-col  gap-y-4 mt-6 ">

        <label className='w-full '>
          <p className='text-[0.85rem] text-white mb-1 leading-[1.375rem]'>Email Address <sup className='text-white'>*</sup></p>
          <input
            required
            type="username"
            value={username}
            onChange={(e) => setUserName(e.target.value)} placeholder="Enter your mail id"
            name='username'
            className='bg-richblack-800 rounded-[0.5rem] text-richblack-5 w-full p-[12px]'
          />
        </label>

        <label className='w-full relative'>
          <p className='text-[0.85rem] text-white mb-1 leading-[1.375rem]'>Password <sup className='text-white'>*</sup></p>
          <input
            required
            type={showPassword ? ("text") : ("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
            name='password'
            className='bg-richblack-800 rounded-[0.5rem] text-richblack-5 w-full p-[12px]'
          />

          <span
            className='absolute right-3 top-[30px] cursor-pointer'
            onClick={() => setShowPassword((prev) => !prev)} >
            {showPassword ?

              (<AiOutlineEyeInvisible fontSize={24} fill='#AFB2BF' />) :

              (<AiOutlineEye fontSize={24} fill='#AFB2BF' />)}
          </span>

          <Link to="#">
            <p className='text-xs mt-1 text-white'>
              Forgot Password
            </p>
          </Link>
        </label>

        <button className='w-full cursor-pointer rounded-[8px] font-semibold text-cyan-400 px-[12px] py-[8px] mt-6 bg-yellow-100 ' >
          Sign In
        </button>


      </form></div>
    </section>
  )
}

export default LoginForm