const express = require('express');
const User = require('../models/user.models'); // Assuming the user model is in models/user.models.js
const { hashPassword, generateToken, comparePassword } = require('../utils/password.encrypt');
const { cloudinary } = require('../utils/cloudinary');

const registerUser = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        // Validate input
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

         //check for password strength
        if(password.length < 6){
            return res.status(400).json({ 
                message: "Password must be at least 6 characters long" 
            });
        }

      

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "false", 
                message: "User already exists"
             });
        }

        const securedPassword = await hashPassword(password);
        if (!securedPassword) {
            return res.status(500).json({
                status: "false",
                message: "Error hashing password"
            });
        }

        // Create new user
        const newUser = new User({ 
            fullname,
             email, 
            password: securedPassword
        });
        
        // Respond with success message
        // Note: Do not send the password back in the response
        if(newUser){
            //generate JWT token
            generateToken(newUser._id, res);

            // Save the new user to the database
            await newUser.save();

            res.status(201).json({ 
                status: true,
                message: "User registered successfully" ,
                    user: {
                        _id: newUser._id,
                        fullname: newUser.fullname,
                        email: newUser.email,
                        // profilePics: profilePics.newUser.profilePics,
                        // token: res.cookie('token') // Assuming you want to send the token in the response
                    }
            });
        }else{
            return res.status(500).json({ 
                status: false,
                message: "User registration failed" 
            });
        }
    
        // res.status(201).json({ 
        //     status: true,
        //     message: "User registered successfully" ,
        //     data:{
        //         newUser
        //     }
        // });
        
    } catch (error) {
        console.error("Error in registerUser:", error.message);
        res.status(500).json({ 
            status: false, 
            message: "Internal server error" 
        });
    }
};

const loginUser = async (req, res) => {
    try {
         const { email, password } = req.body;

        // Validate input
        if ( !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        //check for password strength
        if(password.length < 6){
            return res.status(400).json({ 
                message: "Password must be at least 6 characters long" 
            });
        }

        // Check if user already exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: "false", 
                message: "Invalid email and password"
             });
        }
        // Compare the provided password with the stored hashed password
        // Using the comparePassword function to check if the password matches
        const isPasswordMatch = await comparePassword(password, user?.password); // Compare the password with the hashed password
       
        if (!isPasswordMatch) {
            return res.status(401).json({
                status: "false",
                message: "Invalid email and password"
            });
        }
        const token = generateToken(user._id, res); // Generate JWT token for the user
        
        // Respond with success message
        res.status(200).json({ 
            status: true,
            message: "User logged in successfully",
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                // profile: profile.user.profile,
            },
            token: token // Send the token in the response
        })
    } catch (error) {
        console.error("Error in loginUser:", error.message);
        res.status(500).json({ 
            status: false, 
            message: "Internal server error" 
        });
        
    }
};

const logoutUser = async (req, res) => {
    try {   
    res.cookie("token", "", {httpOnly: true, expires: new Date(0)}); // Clear the token cookie
    res.status(200).json({success: true, message: 'Logout successful'});       
    } catch (error) {
        console.log("Error in logoutUser:", error.message);
        res.status(500).json({
            status: false, 
            message: "Internal server error" 
        });
    }
};

const updateProfile = async(req, res) =>{
    try {
        const { profilePics } = req.body;
        const userId = req.user._id; // Assuming the user ID is attached to the request object by the auth middleware
        
        //check for profile data
        if (!profilePics) {
            return res.status(400).json({
                status: false, 
                message: "Profile data is required" 
            })
        }
        //upload to cloudinary
        const uploadProfilePic = await cloudinary.uploader.upload(profilePics);
        if (!uploadProfilePic) {
            return res.status(500).json({
                status: false,
                message: "Error uploading profile picture"
            });
        }
        // Update user profile
        const updatedProfile = await User.findByIdAndUpdate(
            // Assuming the profile field is where you want to store the profile picture URL         
            userId, 
            {profilePics: uploadProfilePic.secure_url }, 
            {new:true}
        );

        res.status(200).json({
            status: true,
            message: "Profile updated successfully",
            updatedProfile
        });

    } catch (error) {
        console.error("Error in updateProfile:", error.message);
        res.status(500).json({ 
            status: false, 
            message: "Internal server error" 
        });       
    }
}

const checkAuth = async (req, res) => {
  try {
        const user = await User.findById(req.user.userId); //FIND USER BY ID USING THE USERID FROM VERIFY MIDDLEWARE
        if(!user){
            return res.status(401).json({success: false, message: 'Unauthorized User'});
        }
        res.status(200).json({ success: true, user:{...user._doc, password: undefined, }}); 
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({success: false, message: 'Server Error'});     
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    updateProfile,
    checkAuth
}