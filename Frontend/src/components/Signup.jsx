import React, { useState } from 'react';
import helloWorldVideo from '../assets/helloworld.mp4';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Signup = () => {

    // room banane k liye bs room id aur password chaiye
    const [roomId, setRoomId] = useState("");
    const [password, setPassword] = useState("");


    const generateRoomId = () => {
        const id = nanoid(22);
        setRoomId(id);
    }

    const handleSignup = async () => {
        if (!roomId || !password) {
            alert('Please fill all fields');
            return;
        }

        try {
            // Just create room — no user info, no token returned
            await axios.post('http://localhost:5000/api/auth/signup', {
                roomId,
                password
            });

            alert('Room created successfully! Now login to enter.');

            // Clear inputs or stay on page
            setRoomId('');
            setPassword('');
        } catch (err) {
            alert(err.response?.data?.msg || 'Room creation failed');
        }
    };


    return (
        <>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className='h-3/4 w-1/2 border-gray-200 shadow-2xl rounded-2xl flex flex-row overflow-hidden'>
                    <div className='w-1/2'>
                        <video
                            autoPlay
                            loop
                            muted
                            className="w-full h-full object-cover scale-100 origin-center pointer-events-none select-none"
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <source src={helloWorldVideo} type="video/mp4" />
                        </video>
                    </div>
                    <div className="bg-white p-8 shadow-xl w-1/2 max-w-md space-y-6 border border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-800 text-center">Join a Code Room</h1>

                        {/* So the input does not maintain its own value anymore. It always “reads” from the roomId state. That’s why this is called a controlled component. */}
                        <input
                            type="text"
                            placeholder="Room ID"
                            value={roomId} // Whatever is in your React state variable roomId will always be displayed in the input box.
                            onChange={(e) => setRoomId(e.target.value)} // Whenever you type something, the input’s new text (e.target.value) is stored in your React state (roomId).
                            // If onChange is not there: The input becomes read-only — you can’t type anything because React state (value={roomId}) controls it.Typing won’t change the state, so the input always shows whatever is in roomId.
                            className="w-full p-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />

                        <input
                            type='password'
                            placeholder='Enter Room Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Need a room?</span>
                            <button
                                onClick={generateRoomId}
                                className="text-xs bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-700 font-medium px-3 py-1 rounded-md transition active:scale-95"
                            >
                                Generate Room ID
                            </button>

                        </div>

                        <button
                            onClick={handleSignup}
                            className="w-full bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-200 active:scale-95"
                        >
                            Create Room
                        </button>

                        {/* Navigation to Login page */}
                        <div className="text-center text-sm text-gray-500">
                            Already have a room?{' '}
                            <Link to="/login" className="text-blue-600 hover:underline">
                                Click here.
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

export default Signup