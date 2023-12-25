import { Link, Location, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
    List,
    ListItem,
    ListItemPrefix,
    ListItemSuffix

} from "@material-tailwind/react";
import { GoDotFill } from "react-icons/go"; import { IoMdArrowDropdown } from "react-icons/io";
import { includes } from 'lodash';

export default function Bill() {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(false)
    const location = useLocation()
    const handleOpen = () => setOpen(!open);
    useEffect(() => {
        const path = location.pathname
        if (path.includes('greyYarnBill')) {
            setActive('greyYarnBill')

        } else if (path.includes('dyedYarnBill')) {
            setActive("dyedYarnBill")
        } else if (path.includes('greyFabricBill')) {
            setActive('greyFabricBill')
        } else if (path.includes('dyedFabricBill')) {
            setActive('dyedFabricBill')
        } else if (path.includes('accessoriesBill')) {
            setActive('accessoriesBill')
        }
        else {
            setActive(null)
        }
    }, [location.pathname])
    return (
        <>
            <Accordion open={open} className='h-auto p-[-1rem] flex flex-col justify-end'>
                <AccordionHeader className='flex text-black items-center gap-2 font-light py--1 hover:bg-orange-700 hover:no-underline hover:text-white rounded text-base' onClick={() => handleOpen(1)}>
                    <button className='flex w-full items-center justify-between p-1 text-xs'> Bill<IoMdArrowDropdown /></button>
                </AccordionHeader>
                <AccordionBody className='flex flex-col gap-2'>
                    <List className=" p-0">
                        <ListItem className={`group rounded  text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-3rem] ${active === 'greyYarnBill' ? 'bg-orange-700 text-white' : ''}`}>
                            <ListItemPrefix >
                                <Link to='greyYarnBill' className='flex '>
                                    <GoDotFill />&nbsp;
                                    Grey yarn Bill
                                </Link>
                            </ListItemPrefix>

                            <ListItemSuffix>

                            </ListItemSuffix>
                        </ListItem>

                    </List>
                    <List className=" p-0">
                        <ListItem className={`group rounded  text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-3rem] ${active === 'dyedYarnBill' ? 'bg-orange-700 text-white' : ''}`}>
                            <ListItemPrefix >
                                <Link to='dyedYarnBill' className='flex '>
                                    <GoDotFill />&nbsp;
                                    Dyed yarn Bill
                                </Link>
                            </ListItemPrefix>

                            <ListItemSuffix>

                            </ListItemSuffix>
                        </ListItem>

                    </List>
                    <List className=" p-0">
                        <ListItem className={`group rounded  text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-3rem] ${active === 'greyFabricBill' ? 'bg-orange-700 text-white' : ''}`}>
                            <ListItemPrefix >
                                <Link to='greyFabricBill' className='flex '>
                                    <GoDotFill />&nbsp;
                                    grey fabric Bill
                                </Link>
                            </ListItemPrefix>

                            <ListItemSuffix>

                            </ListItemSuffix>
                        </ListItem>

                    </List>
                    <List className=" p-0">
                        <ListItem className={`group rounded  text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-3rem] ${active === 'dyedFabricBill' ? 'bg-orange-700 text-white' : ''}`}>
                            <ListItemPrefix >
                                <Link to='dyedFabricBill' className='flex '>
                                    <GoDotFill />&nbsp;
                                    Dyed fabric Bill
                                </Link>
                            </ListItemPrefix>

                            <ListItemSuffix>

                            </ListItemSuffix>
                        </ListItem>

                    </List>
                    <List className=" p-0">
                        <ListItem className={`group rounded  text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-3rem] ${active === 'accessoriesBill' ? 'bg-orange-700 text-white' : ''}`}>
                            <ListItemPrefix >
                                <Link to='accessoriesBill' className='flex '>
                                    <GoDotFill />&nbsp;
                                    Accessories Bill
                                </Link>
                            </ListItemPrefix>

                            <ListItemSuffix>

                            </ListItemSuffix>
                        </ListItem>

                    </List>
                </AccordionBody>
            </Accordion>
        </>
    );
}
