import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";


const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 bg-[#F5EBEB] hover:bg-[#F5EBEB] rounded-full px-3 py-1 md:px-4 md:py-2 transition-colors duration-200"
                >
                    <UserCircle size={24} className="text-[#D92300]" />
                    <span className="text-[#D92300] font-medium hidden sm:inline-block">
                        ABC (1)
                    </span>
                    <ChevronDown
                        size={18}
                        className={`text-[#D92300] transition-transform hidden sm:block ${isOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-[#F5EBEB] py-1 z-50">
                        <Link
                            to="/editprofile"
                            className="flex items-center px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
                            onClick={() => setIsOpen(false)}
                        >
                            <User size={16} className="mr-2" />
                            Edit Profile
                        </Link>
                        <a
                            href=""
                            className="flex items-center px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
                        >
                            <LogOut size={16} className="mr-2" />
                            Sign Out
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileDropdown;