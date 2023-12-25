import React, { useState } from 'react';

const Table = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [daysBetween, setDaysBetween] = useState(null);

    const calculateDaysBetween = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        console.log(startDate);
        // Calculate the difference in milliseconds
        const differenceInMs = end - start;

        // Convert the difference to days
        const days = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));

        setDaysBetween(days);
    };

    return (
        <div>
            <label>{console.log(startDate, "start date")}
                Start Date:
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <br />
            <label>
                End Date:
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
            <br />
            <button onClick={calculateDaysBetween}>Calculate Days Between</button>
            <br />
            {daysBetween !== null && <p>Days between: {daysBetween}</p>}
        </div>
    );
};

export default Table;
