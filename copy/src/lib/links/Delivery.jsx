import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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

export default function Delivery() {
	const location = useLocation()
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(false)
	const handleOpen = () => setOpen(!open);
	useEffect(() => {
		const path = location.pathname
		if (path.includes('greyYarnDelivery')) {
			setActive('greyYarnDelivery')
		} else if (path.includes('dyedYarnDelivery')) {
			setActive('dyedYarnDelivery')
		} else if (path.includes('greyFabricDelivery')) {
			setActive('greyFabricDelivery')
		} else if (path.includes('dyedFabricDelivery')) {
			setActive('dyedFabricDelivery')
		} else if (path.includes('accessoriesDelivery')) {
			setActive('accessoriesDelivery')
		}
		else {
			setActive(null)
		}

	}, [location.pathname])
	return (
		<>
			<Accordion open={open} className='h-auto p-[-1rem] flex flex-col justify-end'>
				<AccordionHeader className='flex text-black items-center gap-2 font-light py--1 hover:bg-orange-700 hover:no-underline hover:text-white rounded text-base' onClick={() => handleOpen(1)}>
					<button className='flex w-full items-center justify-between p-1 text-xs'> Delivery<IoMdArrowDropdown /></button>
				</AccordionHeader>
				<AccordionBody className='flex flex-col gap-2'>
					<List className=" p-0">
						<ListItem className={`group rounded text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-4rem] w-screen ${active === 'greyYarnDelivery' ? 'bg-orange-700 text-white' : ''}`}>
							<ListItemPrefix >
								<Link to='greyYarnDelivery' className='flex'>
									<GoDotFill />&nbsp;
									Grey yarn Delivery
								</Link>
							</ListItemPrefix>

							<ListItemSuffix>

							</ListItemSuffix>
						</ListItem>

					</List>
					<List className=" p-0">
						<ListItem className={`group rounded text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-4rem] w-screen ${active === 'dyedYarnDelivery' ? 'bg-orange-700 text-white' : ''}`}>
							<ListItemPrefix >
								<Link to='dyedYarnDelivery' className='flex'>
									<GoDotFill />&nbsp;
									Dyed yarn Delivery
								</Link>
							</ListItemPrefix>

							<ListItemSuffix>

							</ListItemSuffix>
						</ListItem>

					</List>
					<List className=" p-0">
						<ListItem className={`group rounded text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-4rem] w-screen ${active === 'greyFabricDelivery' ? 'bg-orange-700 text-white' : ''}`}>
							<ListItemPrefix >
								<Link to='greyFabricDelivery' className='flex'>
									<GoDotFill />&nbsp;
									Grey Fabric Delivery
								</Link>
							</ListItemPrefix>

							<ListItemSuffix>

							</ListItemSuffix>
						</ListItem>

					</List><List className=" p-0">
						<ListItem className={`group rounded text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-4rem] w-screen ${active === 'dyedFabricDelivery' ? 'bg-orange-700 text-white' : ''}`}>
							<ListItemPrefix >
								<Link to='dyedFabricDelivery' className='flex'>
									<GoDotFill />&nbsp;
									Dyed Fabric Delivery
								</Link>
							</ListItemPrefix>

							<ListItemSuffix>

							</ListItemSuffix>
						</ListItem>

					</List><List className=" p-0">
						<ListItem className={`group rounded text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-4rem] w-screen ${active === 'accessoriesDelivery' ? 'bg-orange-700 text-white' : ''}`}>
							<ListItemPrefix >
								<Link to='accessoriesDelivery' className='flex'>
									<GoDotFill />&nbsp;
									Accessories Delivery
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
