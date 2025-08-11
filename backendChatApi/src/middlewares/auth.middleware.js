const jwt = require('jsonwebtoken');
const User = require('../models/user.models');

// const authMiddleware = async (req, res, next)=>{
//     try {
//         // Check if the request has an Authorization header
//     const authHeader = req.headers.authorization
//     if (!authHeader || !authHeader?.startsWith('Bearer ')) {
//         return res.status(401).json({
//             status: "false",
//             message: "Unauthorized access. No token provided"
//         });
//     } 

//     // Extract the token from the Authorization header
//     const token = authHeader?.split(' ')[1] || req.cookies.token;
//     if (!token) {
//         return res.status(401).json({
//             status: "false",
//             message: "Unauthorized access. Token not found"
//         });
//     }

//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded) {
//         return res.status(401).json({
//             status: "false",
//             message: "Unauthorized access. Invalid token"
//         });
//     }

//     // Attach the user information to the request object
//     // req.user = decoded; // Assuming the token contains user information
//     req.user = {
//         userId: decoded.userId // Attach userId to the request body
//     }
//     console.log("Authentication successful, user ID:", decoded.userId);
//     console.log("User fetched successfully:", req.user);
//     console.log("Authorization header:", req.headers['authorization']);

//     next(); // Call the next middleware or route handler
    
//     //  const token = req.cookie.token || req.headers.authorization?.split(' ')[1] || req.headers.Authorization?.split(' ')[1];

//     // if(!token){
//     //     return res.status(401).json({success: false, message: 'Unauthorized User Access'});
//     // };

//     //     //DESTRUCTURE THE TOKEN USING JWT
//     //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
//     //     if(!decoded){
//     //         return res.status(401).json({success: false, message: 'Invalid Token'});
//     //     }
//     //     req.userId = decoded.userId;
//     //     next();

//     } catch (error) {
//         console.error("Authentication error:", error.message);
//         return res.status(401).json({
//             status: "false",
//             message: "Unauthorized access"
//         });
        
//     }


// }


// Updated authMiddleware to use async/await and handle errors more gracefully


const authMiddleware = async (req, res, next) => {
  try {
    // Try to get token from header or cookie
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const tokenFromCookie = req.cookies?.token || req.cookie.token;

    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access. No token found in header or cookie",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.userId) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access. Invalid token",
      });
    }

    req.user = { userId: decoded.userId };

    console.log("✅ Authenticated user ID:", decoded.userId);
    console.log("Authorization header:", authHeader);
    
    console.log("User fetched successfully:", req.user);
    next();
  } catch (error) {
    console.error("❌ Authentication error:", error.message);
    return res.status(401).json({
      status: false,
      message: "Unauthorized access",
    });
  }
};

module.exports = authMiddleware;


module.exports = { authMiddleware };