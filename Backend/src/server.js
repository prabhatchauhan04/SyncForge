import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { socketHandler } from './sockets/socket.handler.js';

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*' },
});

socketHandler(io);

export default server;
