// import { useState, useRef, useEffect } from "react";
// import { ChevronDown, User, LogOut, UserCircle,Lock } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import CryptoJS from 'crypto-js';

// const ENCRYPTION_KEY = import.meta.env.VITE_REACT_APP_API_ENCRYPTION_KEY;

// const decryptData = (encryptedData) => {
//   try {
//     const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
//     const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//     return JSON.parse(decrypted);
//   } catch (error) {
//     console.error('Decryption error:', error);
//     return null;
//   }
// };

// const ProfileDropdown = () => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [userName, setUserName] = useState('User');
//     const dropdownRef = useRef(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setIsOpen(false);
//             }
//         };

//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);

//     useEffect(() => {
//         const encryptedUserData = sessionStorage.getItem('user_data');
//         if (encryptedUserData) {
//             try {
//                 const userData = decryptData(encryptedUserData);
//                 if (userData && userData.user_name) {
//                     setUserName(userData.user_name);
//                 }
//             } catch (error) {
//                 console.error('Error decrypting user data:', error);
//             }
//         }
//     }, []);

//     const handleLogout = () => {
//         sessionStorage.removeItem('access_token');
//         sessionStorage.removeItem('user_data');
//         setIsOpen(false);
//         navigate("/");
//     };

//     return (
//         <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
//             <div className="relative">
//                 <button
//                     onClick={() => setIsOpen(!isOpen)}
//                     className="flex items-center space-x-2 bg-[#F5EBEB] hover:bg-[#F5EBEB] rounded-full px-3 py-1 md:px-4 md:py-2 transition-colors duration-200"
//                 >
//                     <UserCircle size={24} className="text-[#D92300]" />
//                     <span className="text-[#D92300] font-medium hidden sm:inline-block">
//                         {userName}
//                     </span>
//                     <ChevronDown
//                         size={18}
//                         className={`text-[#D92300] transition-transform hidden sm:block ${isOpen ? "rotate-180" : ""}`}
//                     />
//                 </button>

//                 {isOpen && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-[#F5EBEB] py-1 z-50">
//                         <Link
//                             to="/editprofile"
//                             className="flex items-center px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
//                             onClick={() => setIsOpen(false)}
//                         >
//                             <User size={16} className="mr-2" />
//                             Edit Profile
//                         </Link>
//                            <Link
//                             to="/changepassword"
//                             className="flex items-center px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
//                             onClick={() => setIsOpen(false)}
//                         >
//                             <Lock size={16} className="mr-2" />
//                             Change Password
//                         </Link>
//                         <button
//                             onClick={handleLogout}
//                             className="flex items-center w-full px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
//                         >
//                             <LogOut size={16} className="mr-2" />
//                             Sign Out
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ProfileDropdown;













import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, UserCircle, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CryptoJS from 'crypto-js';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';

const ENCRYPTION_KEY = import.meta.env.VITE_REACT_APP_API_ENCRYPTION_KEY;

const decryptData = (encryptedData) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [userName, setUserName] = useState('User');
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

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

    useEffect(() => {
        const encryptedUserData = sessionStorage.getItem('user_data');
        if (encryptedUserData) {
            try {
                const userData = decryptData(encryptedUserData);
                if (userData && userData.user_name) {
                    setUserName(userData.user_name);
                }
            } catch (error) {
                console.error('Error decrypting user data:', error);
            }
        }
    }, []);

    const handleLogout = () => {
       sessionStorage.clear();
        setIsOpen(false);
        navigate("/");
    };

    return (
        <>
            <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center space-x-2 bg-[#F5EBEB] hover:bg-[#F5EBEB] rounded-full px-3 py-1 md:px-4 md:py-2 transition-colors duration-200"
                    >
                        <UserCircle size={24} className="text-[#D92300]" />
                        <span className="text-[#D92300] font-medium hidden sm:inline-block">
                            {userName}
                        </span>
                        <ChevronDown
                            size={18}
                            className={`text-[#D92300] transition-transform hidden sm:block ${isOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-[#F5EBEB] py-1 z-50">
                            <button
                                onClick={() => {
                                    setShowEditProfile(true);
                                    setIsOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
                            >
                                <User size={16} className="mr-2" />
                                Edit Profile
                            </button>
                            <button
                                onClick={() => {
                                    setShowChangePassword(true);
                                    setIsOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
                            >
                                <Lock size={16} className="mr-2" />
                                Change Password
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-sm text-[#D92300] hover:bg-[#F5EBEB]"
                            >
                                <LogOut size={16} className="mr-2" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <EditProfileModal
                isOpen={showEditProfile}
                onClose={() => setShowEditProfile(false)}
            />
            
            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
        </>
    );
};

export default ProfileDropdown;