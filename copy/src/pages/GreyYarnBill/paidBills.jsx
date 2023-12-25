import React, { useState } from 'react'
import BillForm from './BillEntryForm';
import BillReport from './BillReport';

const PaidBills = ({ selectedPos, setSelectedPos }) => {
    const [docNo, setDocNo] = useState(null);
    if (docNo) return <BillForm setForm={setDocNo} delNo={docNo}
        selectedPos={selectedPos} setSelectedPos={setSelectedPos} />
    return <BillReport setDocNo={setDocNo} />
}

export default PaidBills
