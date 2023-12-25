import { Dropdown } from 'flowbite-react';
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
import { GoDotFill } from "react-icons/go";
import { IoMdArrowDropdown } from "react-icons/io";

export default function ReceivedOrders() {
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(null); // Initialize active state as null
	const location = useLocation();
	const path = location.pathname;

	const handleOpen = () => setOpen(!open);

	useEffect(() => {
		// Set active based on the specific item  is selected
		if (path.includes('greyYarnPo')) {
			setActive('greyYarnPo');
		} else if (path.includes('dyedYarnPo')) {
			setActive('dyedYarnPo');
		} else if (path.includes('greyFabricPo')) {
			setActive('greyFabricPo');
		} else if (path.includes('dyedFabricPo')) {
			setActive('dyedFabricPo');
		} else if (path.includes('accessoriesPo')) {
			setActive('accessoriesPo');
		}
		else {
			setActive(null); // Reset to null if not  selected ay of these
		}
	}, [path]);

	return (
		<>
			<Accordion open={open} className='h-auto p-[-1rem]'>
				<AccordionHeader className={`flex text-black items-center  font-light py--1 hover:bg-orange-700 hover:no-underline hover:text-white rounded text-xs`} onClick={() => handleOpen(1)}>
					<button className='flex w-full items-center justify-between p-1 text-xs'>
						Received Ord <IoMdArrowDropdown />
					</button>
				</AccordionHeader>
				<AccordionBody className='flex flex-col gap-2'>
					<List className="p-0">
						<ListItem className={`group rounded text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-4rem] w-screen ${active === 'greyYarnPo' ? 'bg-orange-700 text-white' : ''}`}>
							<ListItemPrefix>
								<Link to='greyYarnPo' className='flex'>
									<GoDotFill />&nbsp;
									Grey yarn po
								</Link>
							</ListItemPrefix>
							<ListItemSuffix></ListItemSuffix>
						</ListItem>
					</List>
					<List className="p-0">
						<ListItem className={`group rounded text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-4rem] w-screen ${active === 'dyedYarnPo' ? 'bg-orange-700 text-white' : ''}`}>
							<ListItemPrefix>
								<Link to='dyedYarnPo' className='flex'>
									<GoDotFill />&nbsp;
									Dyed yarn po
								</Link>
							</ListItemPrefix>
							<ListItemSuffix></ListItemSuffix>
						</ListItem>
					</List>
					<List className="p-0">
						<ListItem className={`group rounded text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-4rem] w-screen ${active === 'greyFabricPo' ? 'bg-orange-700 text-white' : ''}`}>
							<ListItemPrefix>
								<Link to='greyFabricPo' className='flex'>
									<GoDotFill />&nbsp;
									Grey fabric po
								</Link>
							</ListItemPrefix>
							<ListItemSuffix></ListItemSuffix>
						</ListItem>
					</List>
					<List className="p-0">
						<ListItem className={`group rounded text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-4rem] w-screen ${active === 'dyedFabricPo' ? 'bg-orange-700 text-white' : ''}`}>
							<ListItemPrefix>
								<Link to='dyedFabricPo' className='flex'>
									<GoDotFill />&nbsp;
									Dyed fabric po
								</Link>
							</ListItemPrefix>
							<ListItemSuffix></ListItemSuffix>
						</ListItem>
					</List>
					<List className="p-0">
						<ListItem className={`group rounded text-xs font-normal text-black hover:bg-orange-700 hover:text-white focus:bg-orange-700 focus:text-white flex p-[-4rem] w-screen ${active === 'accessoriesPo' ? 'bg-orange-700 text-white' : ''}`}>
							<ListItemPrefix>
								<Link to='accessoriesPo' className='flex'>
									<GoDotFill />&nbsp;
									Accessories po
								</Link>
							</ListItemPrefix>
							<ListItemSuffix></ListItemSuffix>
						</ListItem>
					</List>
				</AccordionBody>
			</Accordion>
		</>
	);
}
