import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'our_super_secret_key';

// Room passwords store (in-memory)
const rooms = new Map();

// Initialize Express app
const app = express();
app.use(cors()); // Allow all origins (adjust in production)
app.use(bodyParser.json()); // Parse JSON body

// HTTP server to use with Socket.IO
const server = http.createServer(app);

// Socket.IO server attached to HTTP server
const io = new Server(server, {
    cors: { origin: '*' }, // Allow all origins for sockets
});

// API route: Signup - create a room with password
app.post('/api/auth/signup', (req, res) => {
    const { roomId, password } = req.body;

    if (!roomId || !password) return res.status(400).json({ msg: 'Room ID and password required' });
    if (rooms.has(roomId)) return res.status(409).json({ msg: 'Room already exists' });

    rooms.set(roomId, password);
    return res.status(201).json({ msg: 'Room created successfully' });
});

// API route: Login - validate password and return JWT token
app.post('/api/auth/login', (req, res) => {
    const { roomId, password } = req.body;

    if (!roomId || !password) return res.status(400).json({ msg: 'Room ID and password required' });
    if (!rooms.has(roomId)) return res.status(404).json({ msg: 'Room not found' });

    if (rooms.get(roomId) !== password) return res.status(401).json({ msg: 'Invalid password' });

    const token = jwt.sign({ roomId }, JWT_SECRET, { expiresIn: '10h' });
    return res.json({ token });
});

// In-memory user tracking per room for Socket.IO
const usersInRoom = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    let currentRoom = null;
    let currentUser = null;

    // User joining a room
    socket.on('join', ({ roomId, userName }) => {
        if (usersInRoom.get(roomId)?.has(userName)) {
            socket.emit('error', 'User already exists in room');
            return;
        }

        // Leave previous room if any
        if (currentRoom) {
            socket.leave(currentRoom);
            usersInRoom.get(currentRoom).delete(currentUser);
            io.to(currentRoom).emit('userJoined', Array.from(usersInRoom.get(currentRoom)));
        }

        currentRoom = roomId;
        currentUser = userName;

        socket.join(roomId);
        if (!usersInRoom.has(roomId)) usersInRoom.set(roomId, new Set());
        usersInRoom.get(roomId).add(userName);

        io.to(roomId).emit('userJoined', Array.from(usersInRoom.get(roomId)));
        console.log('User joined room:', roomId, userName);
    });

    // Code change event (sync code)
    socket.on('codeChange', ({ roomId, code }) => {
        socket.to(roomId).emit('codeUpdate', code); // Broadcast to others except sender
    });

    // Leave room event
    socket.on('leaveRoom', () => {
        if (currentRoom && currentUser) {
            usersInRoom.get(currentRoom).delete(currentUser);
            io.to(currentRoom).emit('userJoined', Array.from(usersInRoom.get(currentRoom)));
            socket.leave(currentRoom);
            currentRoom = null;
            currentUser = null;
        }
    });

    // Language change event
    socket.on('languageChange', ({ roomId, language }) => {
        io.to(roomId).emit('languageUpdate', language);
    });

    // Typing notification
    socket.on('typing', ({ roomId, userName }) => {
        socket.to(roomId).emit('userTyping', userName);
    });

    // On disconnect - cleanup user from room
    socket.on('disconnect', () => {
        if (currentRoom && currentUser) {
            usersInRoom.get(currentRoom).delete(currentUser);
            io.to(currentRoom).emit('userJoined', Array.from(usersInRoom.get(currentRoom)));
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
