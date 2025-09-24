import { useEffect, useState } from 'react';
import socket from './socket/socket.js'; // this line alone connected frontend to backend bcoz abhi import hote time puri file chli thi


function App() {

    const [joined , setJoined] = useState(false); // tells if user joined hai kisi room mein ya nhi


    if(!joined){
        return (
            <>
                <div>User not joined in any room</div>
            </>
        )
    }


    return (
        <>
            <div>User joined in a room</div>
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

