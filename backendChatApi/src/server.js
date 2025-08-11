require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./database/db.config');
const { app, server, io } = require('./utils/socket'); // Importing socket.io setup file
const path = require('path');

// Importing all Local route modules
const mainRoutes = require('./routes/main.route');
// const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// To serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors(
    {
        // origin: ['*'], // Change this to your frontend URL in production
        origin: 'http://localhost:5173', // Change this to your frontend URL in production
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
        credentials: true, // Allow credentials if needed
    }
)); // Allow all origins for development purposes

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());
app.use(express.json());

// Importing all Local route modules
app.use('/api', mainRoutes);

// Socket.io connection
server.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})