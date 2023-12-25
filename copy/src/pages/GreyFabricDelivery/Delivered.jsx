import React, { useState } from 'react'
import DeliveryForm from './DeliveryForm'
import AlreadyDeliveredReport from './AlreadyDeliveredReport'

const Delivered = ({ selectedPos, setSelectedPos }) => {
    const [docNo, setDocNo] = useState(null);
    console.log(docNo, ' doc no');
    if (docNo) return <DeliveryForm setForm={setDocNo} delNo={docNo}
        selectedPos={selectedPos} setSelectedPos={setSelectedPos} />
    return <AlreadyDeliveredReport setDocNo={setDocNo} />


}

export default Delivered
