import { useEffect, useState } from 'react';
import socket from './socket/socket.js'; // this line alone connected frontend to backend bcoz abhi import hote time puri file chli thi
import Editor from '@monaco-editor/react';


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


        socket.on('codeChange', (newCode) => {
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
            socket.off('codeChange');
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




    if (!joined) {
        return (
            <>
                <div>
                    <div>
                        <h1>Join Code Room</h1>
                        <input
                            type="text"
                            placeholder='Room Id'
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder='User Name'
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                        <button onClick={joinRoom}>Join Room</button>
                    </div>
                </div>
            </>
        )
    }




    return (
        <>
            <div>
                <div>
                    <div>
                        <h2>Code Room: {roomId}</h2>
                        <button onClick={copyRoomId}>Copy Id</button>
                        {
                            copySuccess
                                ? <span className="copy-success">Room ID copied successfully!</span>
                                : null
                        }
                    </div>
                    <h3>Users in the Room : </h3>
                    <ul>
                        {
                            users.map((user, index) => {
                                return <li key={index}>{user.slice(0, 8)}...</li>;
                            })
                        }
                    </ul>
                    <p>{typing}</p>
                    <select value={language} onChange={handleLanguageChange}>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                    <button onClick={leaveRoom}>Leave Room</button>
                </div>
                <div>
                    {/* Editor component (@monaco-editor/react) renders a code editor with the following configuration: */}
                    <Editor
                        height={"100%"} // Sets the height of the editor to fill its container
                        defaultLanguage={language} // Sets the initial language for syntax highlighting (e.g., 'javascript', 'python')
                        language={language} // Updates the editor's language dynamically if the prop changes
                        value={code} // The current code/content displayed in the editor
                        onChange={handleCodeChange} // Callback function triggered when the code changes
                        theme="vs-dark" // Applies the 'vs-dark' (dark mode) theme to the editor
                        options={{
                            minimap: { enabled: false }, // Disables the minimap on the right side of the editor(jaise vscode mein aata hai)
                            fontSize: 14, // Sets the font size in the editor
                        }}
                    />
                </div>
            </div>
        </>
    )
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

