import React, { useEffect } from 'react'
import { useState } from 'react'
import DeliveryForm from './DeliveryForm'
import ToDeliveryReport from './ToDeliveryReport'

const ToDelivery = ({ selectedPos, setSelectedPos }) => {
    const [form, setForm] = useState(false)
    useEffect(() => { if (!form) setSelectedPos([]) }, [form])
    if (form) return <DeliveryForm setForm={setForm} selectedPos={selectedPos} setSelectedPos={setSelectedPos} />
    return <ToDeliveryReport setForm={setForm} selectedPos={selectedPos} setSelectedPos={setSelectedPos} />
}

export default ToDelivery
