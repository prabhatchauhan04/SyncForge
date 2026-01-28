import { usersInRoom } from '../store/users.store.js';

export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        let currentRoom = null;
        let currentUser = null;

        socket.on('join', ({ roomId, userName }) => {
            if (usersInRoom.get(roomId)?.has(userName)) {
                socket.emit('error', 'User already exists in room');
                return;
            }

            if (currentRoom) {
                socket.leave(currentRoom);
                usersInRoom.get(currentRoom).delete(currentUser);
                io.to(currentRoom).emit(
                    'userJoined',
                    Array.from(usersInRoom.get(currentRoom))
                );
            }

            currentRoom = roomId;
            currentUser = userName;

            socket.join(roomId);
            if (!usersInRoom.has(roomId))
                usersInRoom.set(roomId, new Set());

            usersInRoom.get(roomId).add(userName);

            io.to(roomId).emit(
                'userJoined',
                Array.from(usersInRoom.get(roomId))
            );
        });

        socket.on('codeChange', ({ roomId, code }) => {
            socket.to(roomId).emit('codeUpdate', code);
        });

        socket.on('leaveRoom', () => {
            if (currentRoom && currentUser) {
                usersInRoom.get(currentRoom).delete(currentUser);
                io.to(currentRoom).emit(
                    'userJoined',
                    Array.from(usersInRoom.get(currentRoom))
                );
                socket.leave(currentRoom);
                currentRoom = null;
                currentUser = null;
            }
        });

        socket.on('languageChange', ({ roomId, language }) => {
            io.to(roomId).emit('languageUpdate', language);
        });

        socket.on('typing', ({ roomId, userName }) => {
            socket.to(roomId).emit('userTyping', userName);
        });

        socket.on('disconnect', () => {
            if (currentRoom && currentUser) {
                usersInRoom.get(currentRoom).delete(currentUser);
                io.to(currentRoom).emit(
                    'userJoined',
                    Array.from(usersInRoom.get(currentRoom))
                );
            }
        });
    });
};
