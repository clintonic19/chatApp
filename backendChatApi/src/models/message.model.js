const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },

    receiverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },

    // text:{
    //     type: String,  
    // },

    content: { type: String },

    mediaUrl: { type: String },
    
    mediaType: { type: String }, // 'image' or 'document'
    
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },

    // image:{
    //     type: String,
    // }   
}, {timestamps: true})

// Method to get user details without password
// userSchema.index({username:'text'})

module.exports = mongoose.model('Message', messageSchema);