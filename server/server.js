const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allows your phone to connect to your PC
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // When someone hits "Broadcast"
    socket.on('send_update', (data) => {
        console.log('Broadcasting message:', data.text);
        // Sends to everyone INCLUDING the sender
        io.emit('receive_update', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Use 3001 for the socket server
server.listen(3001, '0.0.0.0', () => {
    console.log('Server running on http://192.168.1.162:3001');
});