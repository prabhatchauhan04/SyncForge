import io from 'socket.io-client'; // This imports the Socket.IO client library.




const socket = io('http://localhost:5000' , {
    autoConnect: false // Disable automatic connection jo hojata bs frontend page khulte hi 
});
/*
This creates a new Socket.IO client instance and immediately connects it to the server at http://localhost:5000.
What happens here under the hood:
The client tries to open a WebSocket connection to the server at that address.
If WebSockets are unavailable, it will fallback to other transport methods like long polling.
Once connected, the client and server can send/receive events in real-time.
The socket object you get is your communication channel with the server.
*/



export default socket;// This exports the socket instance so it can be used in other parts of the application, such as in Editor.jsx.