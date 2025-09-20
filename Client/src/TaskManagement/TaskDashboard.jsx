import { useState, createContext, useContext } from "react";
import { Link, useLocation, Outlet } from "react-router-dom"; // Import Outlet
import {
    ChevronFirst,
    ChevronLast,
    MoreVertical,
    Phone,
    ClipboardList,
    Settings,
    Calendar,
    ClipboardListIcon,
    ShieldCheck,
    FileDown,
    Store
} from "lucide-react";
import logo from "../assets/jkIndia.png";
import profile from "../assets/jklogo.png";
import Profile from "../Pages/Profile/Profile";

const SidebarContext = createContext();

function TaskLayout() {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="flex h-screen">
            <aside className="h-full">
                <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                    <div className="p-2 pb-1 mt-2 flex justify-between items-center">
                        <img
                            src={logo}
                            alt="JK India Logo"
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "w-48 transform translate-x-4" : "w-0"
                                }`}
                        />
                        <button
                            onClick={() => setExpanded((curr) => !curr)}
                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                            {expanded ? <ChevronFirst /> : <ChevronLast />}
                        </button>
                    </div>

                    <SidebarContext.Provider value={{ expanded }}>
                        <ul className="flex-1 px-3 mt-2">
                            <SidebarItem icon={<Store className="h-5 w-5 text-orange-600" size={20} />} text="Dashboard" path='/taskdashboard/Taskutility' />
                            <SidebarItem icon={<ClipboardListIcon className="h-5 w-5 text-red-600" size={20} />} text="Task" path='/taskdashboard/TaskDescription' />
                            <SidebarItem icon={<ShieldCheck className="h-5 w-5 text-green-600" size={20} />} text="Authentication" path='/taskdashboard/TaskAuthentication' />
                            <SidebarItem icon={<FileDown className="h-5 w-5 text-black-600" size={20} />} text="Task Reports" path='/taskdashboard/TaskReports' />
                            <SidebarItem
                                icon={<Calendar className="h-5 w-5 text-purple-600" size={20} />}
                                text="Calendar"
                                path="/taskdashboard/Calendar"
                            />
                            <SidebarItem
                                icon={<Calendar className="h-5 w-5 text-purple-600" size={20} />}
                                text="Event"
                                path="/event-list"
                            />

                        </ul>
                    </SidebarContext.Provider>

                    <div className="border-t flex p-3">
                        <img src={profile} className="w-10 h-10 rounded-md" alt="Profile" />
                        <div
                            className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"
                                }`}
                        >
                            <div className="leading-4">
                                <span className="text-xs text-gray-800">Customer Care</span>
                                <div className="flex items-center">
                                    <Phone size={14} className="mr-1" />
                                    <h2 className="font-semibold">9881999101</h2>
                                </div>
                            </div>
                            <MoreVertical size={20} />
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Main content area */}
            {/* The Outlet component will render the content of the nested routes */}
            <main className="flex-1 p-4 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}

// SidebarItem component remains the same
function SidebarItem({ icon, text, path = "/" }) {
    const { expanded } = useContext(SidebarContext);
    const location = useLocation();
    const isActive = location.pathname.startsWith(path); // Use startsWith for nested routes

    return (
        <Link to={path}>
            <li
                className={`
                    relative flex items-center py-2 px-3 my-1 font-medium rounded-[25px] 
                    cursor-pointer transition-colors group 
                    ${isActive
                        ? "bg-[#F5EBEB] text-[#D92300]"
                        : "hover:bg-indigo-50 text-gray-600"
                    }
                    h-10 
                `}
            >
                {icon}
                <span
                    className={`
                        overflow-hidden transition-all 
                        ${expanded ? "w-52 ml-3 whitespace-nowrap" : "w-0"}
                    `}
                >
                    {text}
                </span>

                {isActive && (
                    <div
                        className={`
                            absolute right-2 w-2 h-2 rounded-full bg-[#992205] 
                            ${expanded ? "" : "top-2"}
                        `}
                    ></div>
                )}

                {!expanded && (
                    <div
                        className={`
                            absolute left-full top-0 
                            rounded-md px-2 py-1 ml-6 
                            bg-[#F5EBEB] text-[#D92300] text-sm 
                            invisible opacity-20 -translate-x-3 
                            transition-all 
                            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 
                            whitespace-nowrap
                            z-10 
                        `}
                    >
                        {text}
                    </div>
                )}
            </li>
        </Link>
    );
}

export default TaskLayout;