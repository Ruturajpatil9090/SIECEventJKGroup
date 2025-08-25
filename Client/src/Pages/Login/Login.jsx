import React, { useState } from 'react';
import logo from '../../assets/jkIndia.png';
import { useNavigate } from "react-router-dom"

function LoginPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/eventmaster')
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
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                onClick={handleLogin}
                                className="w-full py-3 px-4 rounded-md text-white font-semibold bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105"
                            >
                                Log In
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