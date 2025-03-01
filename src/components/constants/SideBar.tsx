import Link from "next/link";
import React from "react";
import { BiArrowBack, BiFootball, BiHome, BiMenu } from "react-icons/bi";
import { FiHome } from "react-icons/fi";
import { FaTrophy, FaTshirt, FaUsers } from "react-icons/fa";
import { useApp } from "./contexts/AppContext";

type Props = {
	active: string;
	setLinear: React.Dispatch<React.SetStateAction<boolean>>;
};

const SideBar: React.FC<Props> = ({ active, setLinear }) => {
	const { themeClass, mobile, setMobile } = useApp();

	const handleNavigation: VoidFunction = () => {
		setMobile(false);
		setLinear(true);
	};

	return (
		<>
			{/* {mobile?( */}
			{/* <BiMenu
				onClick={() => setMobile(!mobile)}
				size={25}
				className={`tablet:hidden ${themeClass.bg} ${themeClass.text}
         z-20 absolute top-[8vh] cursor-pointer left-1`}
			/> */}
			{/* ):(
         <BiArrowBack onClick={()=> setMobile(true)} className="tablet:hidden z-20 absolute top-[8vh] cursor-pointer left-1" />
         )} */}
			<div
				className={`flex flex-col z-[15] l 
    ${themeClass.bg} ${
					themeClass.border
				} border-r-2`}
			>
				<div className="flex flex-row mt-4">
					<Link href={`/`}>
						<div
							onClick={handleNavigation}
							className={`flex cursor-pointer mt-2 font-semibold items-center border-l-2 ${
								themeClass.border1
							}
                ${
									active === "home"
										? `${themeClass.textAlt1} border-${themeClass.color1}`
										: `${themeClass.text}`
								} px-4 pr-6 py-1`}
						>
							<FiHome
								fill={active === "home" ? themeClass.color : themeClass.textc}
								stroke={"#ececec"}
								className="text-xl text-[#ececec]"
							/>
							<span className={`ml-3 text-md`}>Home</span>
						</div>
					</Link>
					<Link href={`/leagues`}>
						<div
							onClick={handleNavigation}
							className={`flex cursor-pointer mt-2 font-semibold items-center border-l-2 ${
								themeClass.border1
							}
             ${
								active === "leagues"
									? `${themeClass.textAlt1} border-${themeClass.color1}`
									: `${themeClass.text}`
							} px-4 pr-6 py-1`}
						>
							<FaTrophy
								fill={
									active === "leagues" ? themeClass.color : themeClass.textc
								}
								stroke={"#ececec"}
								className="text-xl text-[#ececec]"
							/>
							<span className={`ml-3 text-md`}>Leagues</span>
						</div>
					</Link>
				</div>
			</div>
		</>
	);
};

export default SideBar;
