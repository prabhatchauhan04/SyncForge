import express from 'express'; // Importing Express (web framework)
import http from 'http'; // Importing Node's built-in HTTP module
import { Server } from 'socket.io';



// Create an Express application
const app = express();



// Create an HTTP server and pass the Express app as the request handler
const server = http.createServer(app); // This means: the HTTP server will delegate incoming HTTP requests to your Express 'app' 



// ab iss line se socket.io humare server k upar baith gya ki ab mein dekhunga connection requests aur communicaiton sab.
const io = new Server(server , {
    cors: {
        origin: '*',
    },
}); // creates a new Socket.IO server instance and attaches it to the existing HTTP server (server)
/*
The Server class comes from the socket.io package, and when you pass the raw Node HTTP server (server) to it, Socket.IO can:
Listen for WebSocket (and fallback) connection requests on the same HTTP server port.
Upgrade HTTP connections to WebSocket connections when needed.
Handle real-time bidirectional communication between client and server.
Why do this?
Express hides the underlying HTTP server when you just use app.listen(), so you don’t get direct access to the raw server.
But Socket.IO needs direct access to the raw HTTP server to listen and upgrade connections properly.
*/



// Define a port (from env or default)
const port = process.env.PORT || 5000;



const rooms = new Map(); 



io.on('connection', (socket) => {
    console.log('User connected : ' , socket.id);

    // ab user connect ho chuka hai backend se

    // bcoz initially abhi user connect hi hua hai and woh kisi room mein nhi hai
    let currentRoom = null;
    let currentUser = null;

    

});
/*
io.on('connection', (socket) => { ... })
This sets up an event listener for new client connections to the Socket.IO server.
What happens here?
Every time a new client connects (e.g., a browser loads a page and establishes a Socket.IO connection), the callback function is triggered.
The argument socket represents the individual socket connection for that client.
You can use this socket object to:
Listen for events from that client.
Emit events/messages back to that client.
Broadcast to other clients.
This is how you manage real-time communication with multiple clients individually and collectively.
*/



// Start the server
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});




/*
Socket.IO is composed of two parts:
A server that integrates with (or mounts on) the Node.JS HTTP Server (the socket.io package)
A client library that loads on the browser side (the socket.io-client package)

Why are we using http.createServer() here ?!
------------------------------------------------------------------------------------------------------------------------------------------------
app.listen(port)  : Express shortcut to create and start an HTTP server	 (Simple apps without WebSockets)
--------------------------------------------------------------- V S ----------------------------------------------------------------------------
server = http.createServer(app) and server.listen(port)  : Manually create an HTTP server and pass in the Express app	
(Needed when you want to integrate tools like Socket.IO, WebSocket, or manage server behavior at a lower level)
------------------------------------------------------------------------------------------------------------------------------------------------
app → your Express application
Think: request handlers, middleware, routing logic.

server → a raw HTTP server instance created by Node.js using http.createServer(app)
Think: the actual thing listening for TCP connections on a port.
------------------------------------------------------------------------------------------------------------------------------------------------
🧠 Visual Metaphor
app = Your Express logic (like a receptionist handling incoming requests)
server = The building itself that receives people at the door and hands them to the receptionist
------------------------------------------------------------------------------------------------------------------------------------------------
Node JS :
Node JS is an open-source and cross-platform runtime environment for executing JavaScript code outside of a browser. You need to remember that 
Node JS is not a framework and it’s not a programming language. Most people are confused and 
understand it’s a framework or a programming language. We often use Node.js for building back-end services like APIs for Web Apps or Mobile Apps. 
It’s used in production by large companies such as Paypal, Uber, Netflix, Walmart, and so on. 
Express JS :
Express is a small framework that sits on top of Node JS’s web server functionality to simplify its APIs and add helpful new features. It makes 
it easier to organize your application’s functionality with middleware and routing. It adds helpful utilities to Node JS’s HTTP objects. It 
facilitates the rendering of dynamic HTTP objects.
🧠 Easy Example:
Node.js = the engine.
Express.js = a car built on that engine.
(basically express toh node ki functionalities ko hi use kr rha backend pr . bs code km likhna pade isliye express use krte .)
------------------------------------------------------------------------------------------------------------------------------------------------
To use socketio we need direct access to server but express uss code ko chupa deta hai . isliye direct hum node se http.createServer() krwa rhe.
app.listen(...) is just syntactic sugar for:--
const server = http.createServer(app); // app is a callback function here jo requests wagerah handle krlega
server.listen(...);

ex -> 
🛠️ Basic Usage:
const express = require('express');
const app = express();
app.listen(3000); // Starts a server on port 3000 
app is NOT a server — it's a function. app is a callback .
app.listen() creates and returns an http.Server that listens for HTTP requests and routes them through Express.

💡 What is express()?
const app = express();
express() returns a function with signature (req, res) => {}.
This function is designed to be passed into Node’s http.createServer() as the request handler.
It does not create a server on its own.

🧠 So what does app.listen() actually do?
Internally, Express does this:
const http = require('http');
app.listen = function () {
  const server = http.createServer(this); // 'this' refers to the app function
  return server.listen.apply(server, arguments);
};
*/
