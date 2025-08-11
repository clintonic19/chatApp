const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
// const cors = require('cors');

const app = express();
const server = http.createServer(app);
//
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    withCredentials: true, // Allow credentials to be sent with requests
    credentials: true, // Allow credentials to be sent with requests
  },
});

function getSocketIdFromReceiver(userId){
    // This function will return the socketId of the userId
    // This will be used to send messages to the specific user
    return userSocketMap[userId];
};

//Online users or active users storage
//{userId: socketId} where userId is the id of the user and socketId is the id of the socket connection
// This will help us to identify which user is connected to the socket
//{ userId: socketId }
const userSocketMap = {};
// Middleware
// app.use(cors());

// Socket.io connection listener
io.on("connection", (socket) =>{
    console.log("New User Connected:", socket.id);
    
    // Assuming userId is sent in the query params
    const userId = socket.handshake.query.userId; // Get userId from the query params
    // If userId is provided, store the socketId in the userSocketMap
    // This allows us to track which user is connected to which socket

     if (!userId || userId === 'undefined') {
    console.warn("Invalid socket connection: userId is undefined or malformed.");
    return socket.disconnect();
  }

    // Check if userId is valid before storing
    if (userId) {
        userSocketMap[userId] = socket.id; // Store the userId and socketId
        console.log(`User ${userId} connected with socket ID:: ${socket.id}`);
    };

    // Emit an event to notify the user that they are connected
    // socket.emit("connected", Object.keys(userSocketMap),
    //     { message: "You are connected to the chat", socketId: socket.id }
    // );

        io.emit ("connected", {
            message: "You are connected to the chat",
            socketId: socket.id,
            onlineUsers: Object.keys(userSocketMap),
        });

        console.log("socketId::::::::", socket.id);
    
        console.log("userId:::::", userId)
        console.log("userSocketMap:::::", userSocketMap);
        console.log("Handshake query:::::", socket.handshake.query);
        
    // Handle incoming messages
        socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        delete userSocketMap[userId]; // Remove the user from the userSocketMap
        console.log(`User ${userId} disconnected`);
        // Emit an event to notify other users about the disconnection
        // Emit an event to notify disconnected user
        socket.broadcast.emit("disconnected", Object.keys(userSocketMap),
        { message: "You are disconnected from the chat::", socketId: socket.id }
    );
    });
});

module.exports = {
    io, app, server, getSocketIdFromReceiver
}