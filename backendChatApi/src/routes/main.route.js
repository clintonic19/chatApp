const express = require('express');
const router = express.Router();

// Importing all Local route modules
const authRoutes = require('./auth.routes');
const messageRoute = require('./message.route');

// Mounting all Local route modules
router.use('/auth', authRoutes);
router.use('/message', messageRoute);





module.exports = router;