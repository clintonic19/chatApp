const express = require('express');
const User = require('../models/user.models');
const Message = require('../models/message.model');
const { cloudinary } = require('../utils/cloudinary');
const { getSocketIdFromReceiver, io } = require('../utils/socket');

const getAllUser = async (req, res) => {
  try {
    const loggedInUser = req.user._id; // Get the logged-in user from the request
    // if (!loggedInUser) {
    //   return res.status(401).json({ 
    //     status: false, 
    //     message: "Unauthorized access," 
    //   });
    // };

    const user = await User.find({ _id: { $ne:loggedInUser } }) // Exclude the current user
      .select("-password -__v") // Exclude password and version field
        .sort({ createdAt: -1 }); // Sort by creation date in descending order

        res.status(200).json({ 
          status: true, 
            message: "Users retrieved successfully",
            users: user
        });
  } catch (error) {
    console.error("Error in getAllUser:", error.message);
    res.status(500).json({ 
      status: false, 
      message: "Internal server error" 
    });
    
  }
};

const getAllMessages = async (req, res) => {
  try {

        const{  userId } = req.params; // Get the recipient/receiver ID from the request body
        const messageSenderId = req.user.userId; // Get the sender ID from the request
        // if (!userId || !messageSenderId) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Sender ID and recipient ID are required"
        //     });
        // }
        
        const messages = await Message.find({
            // Filter messages where either the sender or receiver matches the IDs
            $or:[
                // {senderId: messageSenderId, receiverId: id}, 
                // {senderId: id, receiverId: messageSenderId}

                {senderId: messageSenderId, receiverId: userId}, 
                {senderId: userId, receiverId: messageSenderId}
            ]
        })
        console.log("getAllMessages Sender ID:", req.user?.userId);
        console.log("getAllMessages Receiver ID:", req.params?.userId);

        res.status(200).json({
            status: true,
            message: "Messages retrieved successfully",
            messages: messages
        });
  
  } catch (error) {
    console.error("Error in getAllMessages:", error.message);
    res.status(500).json({
        status: false,
        message: "Internal server error"
    });
  }
};


const sendMessages = async (req, res) => {
  try {
    //Get the messages as text, images from the body
    // const { text, image } = req.body
    // const { senderId, receiverId, content } = req.body;
    const {  content } = req.body;
    const { id: messageReceiverId} = req.params;
    const messageSenderId = req.user._id;
     const file = req.files?.[0];

     //updated code to handle file uploads
    // if (!file && !content?.trim()) {
    //   return res.status(400).json({ status: false, message: 'No file uploaded' });
    // };

    //   if (!senderId || !receiverId || !content) {
    //   if ( !content) {
    //   return res.status(400).json({ message: 'Missing required fields' });
    // };

    // let mediaUrl = null;
    // let mediaType = null;
    //  if (file) {
    //   // mediaUrl = file.path || `/uploads/${file.filename}`;
    //   const relativePath = file?.path?.split('uploads')?.[1]?.replace(/\\/g, '/');
    //   const mediaUrl = relativePath ? `/uploads${relativePath}` : null;
    //   mediaType = file.mimetype.startsWith("image/") ? "image" : "document";
    // }
   

    console.log('Received file:: :', req.file);
    console.log('Received body:  ::', req.body);

    // Check the Document type and set the media type accordingly to the 
    // mediaType variable with url path
    const mediaType = file?.mimetype?.startsWith('image/') ? 'image' : 'document';
    // const mediaUrl = req?.file?.path || `/uploads/${req?.file?.filename}`;
    const relativePath = file?.path?.split('uploads')?.[1]?.replace(/\\/g, '/');
    const mediaUrl = relativePath ? `/uploads${relativePath}` : null;
    
    //Upload Base64 images to cloudinary;
    // let imageUrl = "";
    // if(imageUrl){
    //     const upload = await cloudinary.uploader.upload(image);
    //     imageUrl = upload.secure_url;
    // }
    
      //Create new Message into DB
    const newMessage = new Message({
        senderId: messageSenderId,
        receiverId: messageReceiverId,
        // text: text || "",
        content: content || "", // Use content for text messages
        // image: imageUrl || "",
        mediaUrl, // Store relative path or use cloud URL if using Cloudinary
        mediaType: mediaType ||"", // Store the type of media (image/document)
        status: "sent" // Set initial status to "sent"
    });

    await newMessage.save();
    console.log("New Message:::", newMessage);

    // Emit the new message to the receiver's socket
    // This will allow the receiver to receive the message in real-time
    const receiverSocketId = getSocketIdFromReceiver(messageReceiverId);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({
        status: true,
        message: "Message sent successfully",
        messages: newMessage
    });
      
  } catch (error) {
    console.error("Error in sendMessages:", error.message);
    res.status(500).json({
        status: false,
        message: "Internal server error"
    });   
  }
};

//Function to handle delete messages
const deleteMessages = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    // Find the message by ID and ensure it belongs to the user
    const message = await Message.findOneAndDelete({ _id: messageId, senderId: userId });

    if (!message) {
      return res.status(404).json({ status: false, message: "Message not found or unauthorized" });
    }

    // Delete media from Cloudinary or local storage
    if (message.mediaUrl) {
      await deleteMediaFile(message.mediaUrl); 
    }

    await Message.deleteOne({ _id: messageId });

      // Optional: emit socket to receiver to update UI
    const receiverSocketId = getSocketIdFromReceiver(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }
    console.log("Message deleted:", messageId);

    res.status(200).json({ status: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessages:", error.message);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports = {
    getAllUser,
    getAllMessages,
    sendMessages,
    deleteMessages
}
