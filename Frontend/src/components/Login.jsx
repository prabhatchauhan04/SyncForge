import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {

    const [roomId, setRoomId] = useState('');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!roomId || !userName || !password) {
            setError('Please fill all fields');
            return;
        }

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                roomId,
                password,
            });

            // Save token and username locally
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userName', userName);
            localStorage.setItem('roomId', roomId);

            // Navigate to editor with roomId param
            navigate(`/editor/${roomId}`);
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="h-3/4 w-1/2 border-gray-200 shadow-2xl rounded-2xl flex flex-col p-8 space-y-6 border max-w-md">
                <h1 className="text-3xl font-bold text-gray-800 text-center">Login to Code Room</h1>

                {error && <p className="text-red-600 text-center">{error}</p>}

                <input
                    type="text"
                    placeholder="Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <input
                    type="text"
                    placeholder="Your Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <input
                    type="password"
                    placeholder="Room Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-200 active:scale-95"
                >
                    Login
                </button>

                <div className="text-center text-sm text-gray-500">
                    Don't have a room?{' '}
                    <Link to="/signup" className="text-blue-600 hover:underline">
                        Click here.
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
