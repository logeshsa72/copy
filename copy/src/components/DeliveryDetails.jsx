
import React, { useState } from 'react';


import { useGetDyedFabricPoDetailsByIdQuery } from '../redux/services/dyedFabricPo';

const DelDtl = ({ selectedPos }) => {
  const poNo = selectedPos.length > 0 ? selectedPos[0] : null
  const { data } = useGetDyedFabricPoDetailsByIdQuery({ poNo }, { skip: !poNo })
  const To = data?.data ? data?.data?.to : {}
  return (



    <div className="w-full ">{console.log(data,"data")}


      <div className="flex justify-evenly">
        <div> <lable className="font-semibold text-xs " >Customer : </lable><span className="font-light text-xs  font-medium">{data?.data?.compName}</span> </div>
        <div className=""> <lable className="font-semibold text-xs " > Delivery to : </lable> <span className="font-light text-xs font-medium ">{}</span> </div>
      </div>


    </div>
  );
};

export default DelDtl;

