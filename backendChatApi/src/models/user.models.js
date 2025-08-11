const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },

    email:{
        type: String,
        require: true,
        unique: true
    },

    password:{
        type: String,
        required: true,
        minlength: 6,
    },

    profilePics:{
        type: String,
        default: "",
    } 
      
}, {timestamps: true})

// Method to get user details without password
// userSchema.index({username:'text'})

module.exports = mongoose.model('User', userSchema);