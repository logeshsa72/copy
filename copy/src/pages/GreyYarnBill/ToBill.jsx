import React, { useEffect } from 'react'
import { useState } from 'react'
import BillForm from './BillEntryForm'
import ToBillReport from './ToBillReport'

const ToBill = ({ selectedPos, setSelectedPos }) => {
    const [form, setForm] = useState(false)
    useEffect(() => { if (!form) setSelectedPos([]) }, [form, setSelectedPos])
    if (form) return <BillForm setForm={setForm} selectedPos={selectedPos} setSelectedPos={setSelectedPos} />
    return <ToBillReport setForm={setForm} selectedPos={selectedPos} setSelectedPos={setSelectedPos} />
}

export default ToBill
