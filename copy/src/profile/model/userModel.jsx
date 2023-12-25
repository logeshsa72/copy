import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';

import { useGetPartyQuery } from "../../redux/services/party";
import { useAddUserMutation, useUpdateUserMutation } from '../../redux/services/user'
const Model = () => {
    const [addNewUser] = useAddUserMutation();
    const [updateUser] = useUpdateUserMutation();

    const [showModal, setShowModal] = useState(false);
    const [username, setUserName] = useState('')
    const [gtCompMastId, setGtCompMastId] = useState("")
    const [id, setId] = useState("")
    const [password, setPassword] = useState('')

    const { data, isLoading, isFetching } = useGetPartyQuery({ refetchOnMountOrArgChange: true })



    const handleAddUser = async (event) => {
        event.preventDefault()
        let response;
        if (id) {

            response = await updateUser({ id, username, password });

        } else {

            response = await addNewUser({ username: username, password, gtCompMastId: gtCompMastId }).unwrap();

        }

        console.log(response, "response")

        if (response.statusCode === 0) {
            toast.success(" Operation Successful");
        } else if (response.statusCode === 1) {
            toast.info(response.message);
            console.log(response.message)
            return;
        }

        setUserName("")
        setPassword("")
        setGtCompMastId("")
    }
    return (
        <div>   <div>
            <>
                <button
                    className="bg-orange-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(true)}
                >
                    Add user
                </button>
                {showModal ? (
                    <>
                        <div
                            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                        >
                            <div className="relative w-screen my-1 mx-auto max-w-sm">
                                {/*content*/}
                                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                    {/*header*/}
                                    <div className="flex items-start justify-between p-2 border-b border-solid border-blueGray-200 rounded-t">
                                        <h3 className="text-xl font-semibold">
                                            Add user
                                        </h3>
                                        <button
                                            className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-xl leading-none font-semibold outline-none focus:outline-none"
                                            onClick={() => setShowModal(false)}
                                        >

                                        </button>
                                    </div>
                                    <div className="relative p-1 flex-auto">
                                        <form
                                            //   onSubmit = {submitHandler}

                                            className=" flex flex-col  gap-y-4 mt-1 ">

                                            <label className='w-full '>
                                                <p className='text-[0.85rem] text-cyan-700 text-cyan-700 '>User Name : <sup className='text-white'>*</sup></p>
                                                <input
                                                    required
                                                    type="username"
                                                    placeholder="Name"
                                                    name='username'
                                                    className='bg-richblack-800 rounded-[0.5rem] text-richblack-5 w-full p-[12px]'
                                                    value={username}
                                                    onChange={(e) => setUserName(e.target.value)}
                                                />
                                            </label>

                                      

                                            <label className='w-full relative'>
                                                <p className='text-[0.85rem] text-cyan-700 text-cyan-700 mb-1 leading-[1.375rem]'>Password : <sup className='text-white'>*</sup></p>
                                                <input
                                                    required

                                                    placeholder="password"
                                                    name='Name'
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className='bg-richblack-800 rounded-[0.5rem] text-richblack-5 w-full p-[12px]'
                                                />
                                                <span
                                                    className='absolute right-3 top-[38px] cursor-pointer'
                                                >
                                                </span>


                                            </label>
                                            <label className='w-full relative'>  <p className='text-[0.85rem] text-cyan-700 text-cyan-700 mb-1 leading-[1.375rem]'>Select Party : <sup className='text-white'>*</sup></p></label>
                                            <select name="" id="" value={gtCompMastId} onChange={(e) => setGtCompMastId(e.target.value)}>
                                                <option value="">Select</option>
                                                {(data?.data ? data.data : []).map((item, index) => (
                                                    <option key={index} value={item.gtCompMastId}>
                                                        {item.partyName}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                                type="button"

                                                onClick={handleAddUser}

                                            >
                                                Save Changes
                                            </button>


                                        </form>

                                    </div>
                                    <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                                        <button
                                            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Close
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>

                    </>
                ) : null}
            </>
        </div></div>
    )
}

export default Model