import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

import { useGetPartyQuery } from "../../redux/services/party";
const Model = () => {


    const [showModal, setShowModal] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const [file, setFile] = React.useState("");


    function handleUpload(event) {
        setFile(event.target.files[0]);


    }




    return (
        <div className="">   <div>
            <>
                <button
                    className="bg-orange-500 text-white text-xs active:bg-pink-600 uppercase text-sm px-2 py-1 rounded mr-1"
                    type="button"
                    onClick={() => setShowModal(true)}
                >
                    Attach
                </button>
                {showModal ? (
                    <>
                        <div
                            className="justify-center items-center flex overflow-x-scroll overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                        >
                            <div className="relative w-[60vw] my-1 ">
                                {/*content*/}
                                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                    {/*header*/}
                                    <div className="flex justify-between items-start  border-b border-solid border-blueGray-200 rounded-t">
                                        <div>

                                            <h3 className="text-xl font-semibold">
                                                Attach file
                                            </h3>


                                        </div>
                                        <button
                                            className="text-red-500  font-bold uppercase  text-sm outline-none hover:bg-red-500 hover:text-white text-2xl"
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                        >
                                            <IoClose className="text-2xl" />
                                        </button>

                                    </div>
                                    <div className="flex">
                                        <div className="flex flex-col gap-5 m-2">
                                            <button className="w-[5rem] bg-orange-500 hover:bg-orange-700 hover: text-white p-1 rounded">Invoice</button>
                                            <button className=" bg-orange-500 hover:bg-orange-700 hover: text-white p-1 rounded w-[5rem]">Dc</button>
                                        </div>
                                        <div className="relative p-1 flex-auto">
                                            <div id="upload-box">
                                                <input type="file" onChange={handleUpload} />
                                                <table>
                                                    <tr>
                                                        <td>  <th>Filename</th></td>
                                                        <td><th>File type</th></td>
                                                    </tr>
                                                    <tbody>
                                                        <tr className="text-xs">
                                                            <td>{file.name}</td>
                                                            <td>{file.type}</td>
                                                        </tr>
                                                    </tbody>

                                                </table>

                                                {file && <ImageThumb image={file} />}
                                            </div>
                                        </div>
                                        <div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">


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
const ImageThumb = ({ image }) => {
    return <img src={URL.createObjectURL(image)} alt={image.name} />;
};

export default Model