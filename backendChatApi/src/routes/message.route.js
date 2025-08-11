const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { getAllUser, getAllMessages, sendMessages, deleteMessages } = require('../controllers/message.controller');
const upload = require("../utils/multerConfig");



const router = express.Router();


//GET ALL AUTHENTICATED USER MESSAGES
router.get("/users", authMiddleware, getAllUser)
router.get("/:id", authMiddleware, getAllMessages)
router.post("/send/:id", authMiddleware, sendMessages);
router.delete('/:id', authMiddleware, deleteMessages);
router.post('/fileUpload', upload.array('file'), authMiddleware, sendMessages)
// router.post('/fileUpload', upload.single('file'), authMiddleware, sendMessages)

module.exports = router;