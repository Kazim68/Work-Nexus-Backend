const { alloydb } = require('googleapis/build/src/apis/alloydb');
const socketIO = require('socket.io');

let io;

function setupSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: 'http://localhost:5173', // Allow frontend origin
            methods: ['GET', 'POST'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization'],
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected', socket.id);

        // Listen for client to register their userId
        socket.on('register', (userId) => {
            socket.join(userId); // Join room based on userId
            console.log(`User ${userId} joined their own room`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = { setupSocket, getIO };
