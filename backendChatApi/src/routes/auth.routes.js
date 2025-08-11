const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, updateProfile, checkAuth } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post("/register", registerUser) // Assuming you want to register with POST method
router.post("/login", loginUser) // Assuming you want to login with POST method
router.post("/logout", logoutUser) // Assuming you want to logout with POST method
router.put("/profile", authMiddleware, updateProfile) // Assuming you want to update profile with PUT method
router.get("/check", authMiddleware, checkAuth) // Assuming you want to update profile with PUT method

module.exports = router;