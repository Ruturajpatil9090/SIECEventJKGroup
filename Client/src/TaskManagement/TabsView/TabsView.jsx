import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ClipboardList,
    Calendar,
    Bell,
    ClipboardCheck,
    UserCheck,
    PieChart
} from 'lucide-react';

const TabNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hoveredTab, setHoveredTab] = useState(null);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const tabsRef = useRef([]);

    const tabs = [
        {
            label: 'My Task',
            path: '/taskdashboard/Taskutility',
            icon: <ClipboardCheck className="h-4 w-4 text-blue-600" />
        },
        {
            label: 'Task Overview',
            path: '/taskdashboard/TaskDescription',
            icon: <ClipboardList className="h-4 w-4 text-purple-600" />
        },
        {
            label: 'Task Approvals',
            path: '/taskdashboard/TaskAuthentication',
            icon: <UserCheck className="h-4 w-4 text-green-600" />
        },
        {
            label: 'Report',
            path: '/taskdashboard/TaskReports',
            icon: <PieChart className="h-4 w-4 text-indigo-600" />
        },
        {
            label: 'Calendar',
            path: '/taskdashboard/Calendar',
            icon: <Calendar className="h-4 w-4 text-orange-600" />
        },
        {
            label: 'Notifications',
            path: '/taskdashboard/Notifications',
            icon: <Bell className="h-4 w-4 text-red-500" />
        }
    ];

    useEffect(() => {
        const activeIndex = tabs.findIndex(tab => location.pathname === tab.path);
        if (activeIndex !== -1) {
            setActiveTabIndex(activeIndex);
        }
    }, [location.pathname]);


    useEffect(() => {
        const activeTabElement = tabsRef.current[activeTabIndex];
        if (activeTabElement) {
            setIndicatorStyle({
                left: activeTabElement.offsetLeft,
                width: activeTabElement.offsetWidth,
                opacity: 1
            });
        }
    }, [activeTabIndex]);


    const isActiveTab = (tabPath) => {
        return location.pathname === tabPath;
    };


    const handleTabClick = (path, index) => {
        navigate(path);
        setActiveTabIndex(index);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="relative flex border-b border-gray-200">
                <div
                    className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
                    style={indicatorStyle}
                />

                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        ref={el => tabsRef.current[index] = el}
                        className={`relative flex-1 py-3.5 px-3 text-md font-medium transition-all duration-200 ease-out group ${isActiveTab(tab.path)
                            ? 'text-blue-600'
                            : 'text-gray-500 hover:text-gray-800'
                            }`}
                        onClick={() => handleTabClick(tab.path, index)}
                        onMouseEnter={() => setHoveredTab(index)}
                        onMouseLeave={() => setHoveredTab(null)}
                    >
                        <div className="flex items-center justify-center space-x-1.5">
                            <div className={`transition-transform duration-200 ${isActiveTab(tab.path) || hoveredTab === index ? 'scale-110' : ''}`}>
                                {tab.icon}
                            </div>
                            <span>{tab.label}</span>
                        </div>

                        {hoveredTab === index && !isActiveTab(tab.path) && (
                            <div className="absolute inset-0 bg-gray-100 opacity-70 rounded-md -z-10 transition-all duration-200" />
                        )}

                        {isActiveTab(tab.path) && (
                            <div className="absolute inset-0 bg-blue-50 opacity-70 rounded-md -z-10 transition-all duration-200" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TabNavigation;