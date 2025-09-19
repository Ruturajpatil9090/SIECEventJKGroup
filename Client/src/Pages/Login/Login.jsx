import React, { useState } from 'react';
import logo from '../../assets/jklogo.png';
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from '../../services/userMasterApi';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_REACT_APP_API_ENCRYPTION_KEY;

const encryptData = (data) => {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
    return encrypted;
};

function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [login] = useLoginMutation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await login({
                User_Name: username.trim(),
                User_Password: password.trim()
            }).unwrap();

            const userData = {
                user_type: response.user_type,
                user_name: response.user_name,
                uid: response.uid,
                user_id: response.user_id,
            };

            const encryptedData = encryptData(userData);
            sessionStorage.setItem('user_data', encryptedData);
            sessionStorage.setItem('access_token', encryptData(response.access_token));
            sessionStorage.setItem('user_id', response.user_id);

            navigate('/taskdashboard/Taskutility');
            //  navigate('/event-list');

        } catch (err) {
            console.error('Login failed:', err);
            setError(err.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden md:max-w-lg">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <img
                            src={logo}
                            alt="Company Logo"
                            className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md transform transition-transform duration-300 hover:scale-110"
                        />
                    </div>

                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                        Welcome Back!
                    </h2>
                    <p className="text-center text-gray-600 mb-8">
                        Please log in to your account.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="Enter your username"
                                required
                                disabled={isLoading}
                                autoComplete='off'
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                                autoComplete='off'
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 rounded-md text-white font-semibold bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Logging in...
                                    </div>
                                ) : (
                                    'Log In'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-600">
                            Don't have an account? <a className="font-medium text-blue-600 hover:underline">Sign up here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;