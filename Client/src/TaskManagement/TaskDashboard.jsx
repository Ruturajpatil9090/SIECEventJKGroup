import React, { createContext, useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    ChevronFirst,
    ChevronLast,
    MoreVertical,
    Phone,
    ClipboardList,
    Settings,
    Calendar
} from "lucide-react";
import logo from "../assets/jkIndia.png";
import profile from "../assets/jklogo.png";
import Profile from "../Pages/Profile/Profile";

const SidebarContext = createContext();

function TaskDashboard() {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
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
                            <SidebarItem
                                icon={<ClipboardList className="h-5 w-5 text-blue-600" size={20} />}
                                text="Task Assigned"
                                path="/task-assigned"
                            />

                            <SidebarItem
                                icon={<Settings className="h-5 w-5 text-green-600" size={20} />}
                                text="Task Management"
                                path="/task-management"
                            />

                            <SidebarItem
                                icon={<Calendar className="h-5 w-5 text-purple-600" size={20} />}
                                text="Event"
                                path="/event-list"
                            />
                                <Profile />
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

            <main className="flex-1 p-4">
                <h1 className="text-2xl font-bold mb-4">Task Dashboard</h1>
            </main>
        </div>
    );
}

function SidebarItem({ icon, text, path = "/" }) {
    const { expanded } = useContext(SidebarContext);
    const location = useLocation();
    const isActive = location.pathname === path;

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

export default TaskDashboard;