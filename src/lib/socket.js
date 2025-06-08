const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { resolve } = require('path');
const { Server } = require('socket.io');

const app = express();

// creating server
const sslOptions = {
    key: fs.readFileSync(resolve(__dirname, './mkcert/127.0.0.1-key.pem')),
    cert: fs.readFileSync(resolve(__dirname, './mkcert/127.0.0.1.pem')),
};

let server;
if (process.env.NODE_ENV === 'development') {
    server = https.createServer(sslOptions, app);
} else {
    server = http.createServer(app);
}

const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:3000',
            'http://localhost:5173',
            process.env.FRONTEND_URL,
        ],
        credentials: true,
    },
});

const onlineUsers = {};

const getSocketId = (id) => {
    return onlineUsers[id];
};

io.on('connection', (socket) => {
    // connected
    console.log('a user connected', socket.id);

    // disconnected
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });

    // get user id
    const id = socket.handshake.auth.id;
    onlineUsers[id] = socket.id;

    // events
    socket.on('message', (msg) => {
        console.log('message: ' + msg);
        io.emit('message', msg);
    });
});

module.exports = { express, app, server, io, getSocketId };
