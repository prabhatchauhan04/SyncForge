import { useEffect, useState } from 'react';
import socket from './socket/socket.js'; // this line alone connected frontend to backend bcoz abhi import hote time puri file chli thi
import Editor from '@monaco-editor/react';
import { nanoid } from 'nanoid';
import helloWorldVideo from './assets/helloworld.mp4';



function App() {

    const [joined, setJoined] = useState(false); // tells if user joined hai kisi room mein ya nhi
    const [roomId, setRoomId] = useState(""); // jis bhi room mein user hai currently
    const [userName, setUserName] = useState(""); // user ka naam
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState("// Enter code here");
    const [copySuccess, setCopySuccess] = useState(false); // ye bs thodi der ek message dikhane k liye kaam aajaega jab koi room id copy krega
    const [users, setUsers] = useState([]); // users in current room
    const [typing, setTyping] = useState(""); // kon type kr rha currently



    /*
        Why use useEffect for socket event listeners?
        React components re-render multiple times (on state/prop changes).
        If you add listeners directly in the component body (outside useEffect), they get added again and again on every render.
        Adding listeners repeatedly causes:
        Duplicate event handlers (same event triggers multiple callbacks)
        Unexpected behavior like multiple state updates per event
        Memory leaks, because old listeners are never removed
        useEffect with empty dependency array ([]) runs only once after the component (App.jsx) mounts.
        This means the socket listeners are attached only once, avoiding duplicates.
        Cleanup function inside useEffect (the function returned) removes those listeners when the component unmounts.
        This prevents memory leaks and stale event handling.
    */
    useEffect(() => {

        socket.on('userJoined', (currUsers) => {
            setUsers(currUsers);  // kyunki backend se pura current Users ka array aaraha hai
        });


        socket.on('codeUpdate', (newCode) => {
            setCode(newCode);
        });


        socket.on('userTyping', (user) => {
            setTyping(`${user.slice(0, 8)}... is Typing`);
            setTimeout(() => {
                setTyping("");
            }, 2000);
        });


        socket.on('languageUpdate', (newLanguage) => {
            setLanguage(newLanguage);
        });


        // cleanup function
        return () => {
            socket.off('userJoined');
            socket.off('codeUpdate');
            socket.off('userTyping');
            socket.off('languageUpdate');
        };

    }, []);






    // beforeunload is a browser event triggered right before the user leaves the page, such as when they:
    // Close the tab or window
    // Reload/refresh the page
    // Navigate away to another site or page
    useEffect(() => {

        const handleBeforeUnload = () => {
            socket.emit('leaveRoom');
        }

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }

    }, []);





    // When you update state in your App component (like with setRoomId), React re-runs the entire App() 
    // function, so functions like joinRoom always access the latest roomId and userName values.
    const joinRoom = () => {
        if (userName && roomId) {
            socket.emit('join', { roomId, userName });
            setJoined(true);
        }
    }



    const leaveRoom = () => {
        socket.emit("leaveRoom");
        setJoined(false);
        setRoomId("");
        setUserName("");
        setCode("// start code here");
        setLanguage("javascript");
    };




    const generateRoomId = () => {
        const id = nanoid(36);
        setRoomId(id);
    }




    const copyRoomId = () => {
        window.navigator.clipboard.writeText(roomId);
        setCopySuccess(true);
        setTimeout(() => {
            setCopySuccess(false);
        }, 2000); // 2 seconds baad ht jaega message
    }



    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        socket.emit('languageChange', { roomId, language: newLanguage });
    }



    const handleCodeChange = (newCode) => { // monaco-editor ne hi dediya hume updated value . no need to do e.target.value .
        setCode(newCode);
        socket.emit('codeChange', { roomId, code: newCode });
        socket.emit('typing', { roomId, userName });
    }



    // if user is not joined in a room yet
    if (!joined) {
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
                                type="text"
                                placeholder="Your Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
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
                                onClick={joinRoom}
                                className="w-full bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-200 active:scale-95"
                            >
                                Join Room
                            </button>


                        </div>
                    </div>
                </div>
            </>
        );
    }



    // if user is already joined
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
            {/* Top Bar */}
            <div className="bg-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-semibold">Code Room: <span className="text-violet-600 font-mono">{roomId}</span></h2>
                    <button
                        onClick={copyRoomId}
                        className="mt-1 text-sm text-blue-600 hover:underline"
                    >
                        Copy Room ID
                    </button>
                    {copySuccess && (
                        <span className="ml-3 text-green-600 text-sm">Copied!</span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-white border border-gray-300 text-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                    <button
                        onClick={leaveRoom}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow transition duration-200"
                    >
                        Leave Room
                    </button>
                </div>
            </div>

            {/* Users + Typing + Editor */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto shadow-inner">
                    <h3 className="text-lg font-semibold mb-3">Users in Room:</h3>
                    <ul className="space-y-2">
                        {users.map((user, index) => (
                            <li
                                key={index}
                                className="px-2 py-1 bg-gray-100 rounded-md text-gray-700 font-mono"
                            >
                                {user.slice(0, 8)}...
                            </li>
                        ))}
                    </ul>

                    {typing && (
                        <p className="mt-4 text-sm text-violet-600 italic animate-pulse">{typing}</p>
                    )}
                </div>

                {/* Code Editor */}
                <div className="flex-1 relative">
                    {/* Editor component (@monaco-editor/react) renders a code editor with the following configuration: */}
                    <div className="absolute inset-4 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage={language} // Sets the initial language for syntax highlighting (e.g., 'javascript', 'python')
                            language={language} // Updates the editor's language dynamically if the prop changes
                            value={code} // The current code/content displayed in the editor
                            onChange={handleCodeChange} // Callback function triggered when the code changes
                            theme="light" // Uses light theme for the editor
                            options={{
                                minimap: { enabled: false }, // Disables the minimap on the right side of the editor (like in VS Code)
                                fontSize: 14, // Sets the font size in the editor
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}




export default App




/*
When a client connects, Socket.IO creates a unique socket instance on the server with a distinct socket.id.
This socket object represents that individual connection, and Socket.IO internally registers it in its connection pool.
The backend listens for new connections via:
io.on("connection", (socket) => {
  // 'socket' is the new unique client connection
});
Socket.IO automatically keeps track of all active sockets in memory, associating each socket.id with its connection.
When you call socket.join(roomId), Socket.IO adds that socket.id to an internal data structure mapping rooms to sockets.
This allows the backend to know which sockets are connected and which rooms they belong to, 
enabling targeted event emission like io.to(roomId).emit(...).
In short, Socket.IO manages the lifecycle and tracking of every socket connection internally, so the backend code 
just interacts with these sockets and rooms abstractly without manually storing each socket ID.
Your realtime collaborative code editor uses a **single shared Node.js backend** with Socket.IO to manage multiple clients. Each 
client establishes a **unique socket connection** identified by a `socket.id`, created automatically by Socket.IO upon connection. 
The backend maintains a **shared in-memory Map** (`rooms`) to track which users belong to which room IDs, enabling multi-room support.
When a user joins a room, their **unique socket is added to that room** using `socket.join(roomId)`. This allows 
the backend to group sockets logically so that events like code changes, typing notifications, and language updates can be 
**broadcast only to sockets within that specific room**.
Event listeners (`socket.on(...)`) are scoped per socket, meaning every connected user has their own event handlers on the server side. 
When a user emits an event (e.g., `"codeChange"`), the server broadcasts it to all **other sockets in the same room**, ensuring 
real-time synchronization without cross-room interference.
Socket.IO internally tracks all active sockets and their room memberships, managing connection lifecycles and room assignments 
automatically. This abstraction allows your backend to handle thousands of concurrent users and rooms on a **single server instance**.
The frontend maintains its own socket connection and updates local state based on server events, providing a seamless collaborative 
editing experience. Overall, this design efficiently supports multiple simultaneous rooms, unique users per room, and 
synchronized code collaboration.
*/

