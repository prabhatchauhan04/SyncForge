import express from 'express';
import jwt from 'jsonwebtoken';
import { rooms } from '../store/rooms.store.js';
import { JWT_SECRET } from '../config/constants.js';

const router = express.Router();

// Signup - create room
router.post('/signup', (req, res) => {
    const { roomId, password } = req.body;

    if (!roomId || !password)
        return res.status(400).json({ msg: 'Room ID and password required' });

    if (rooms.has(roomId))
        return res.status(409).json({ msg: 'Room already exists' });

    rooms.set(roomId, password);
    return res.status(201).json({ msg: 'Room created successfully' });
});

// Login - validate room password
router.post('/login', (req, res) => {
    const { roomId, password } = req.body;

    if (!roomId || !password)
        return res.status(400).json({ msg: 'Room ID and password required' });

    if (!rooms.has(roomId))
        return res.status(404).json({ msg: 'Room not found' });

    if (rooms.get(roomId) !== password)
        return res.status(401).json({ msg: 'Invalid password' });

    const token = jwt.sign({ roomId }, JWT_SECRET, { expiresIn: '10h' });
    return res.json({ token });
});

// Verify JWT token
router.post('/verify-token', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ msg: 'No token provided' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ msg: 'Token valid', roomId: decoded.roomId });
    } catch {
        res.status(401).json({ msg: 'Invalid or expired token' });
    }
});

export default router;
