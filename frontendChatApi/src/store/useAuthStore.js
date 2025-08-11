import { create  } from 'zustand';
import axiosApi from '../utils/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
   
const BaseUrl = 'http://localhost:3000'; // Ensure this matches your backend socket URL

const useAuthStore = create((set, get) => ({

// Initial state
socket : null, // This will hold the socket instance
authUser: null,
isRegistering: false,
isLoggingIn: false,
isUpdatingProfile: false,
isChangingPassword: false,
onlineUsers: [], // This will hold the list of online users
//   user: null, // This will hold the authenticated user data

//   setUser: (user) => set({ authUser: user }),
//   clearUser: () => set({  user: null }),

isCheckingAuth: true,
//Check if the user is authenticated when the app loads
 checkUserAuth : async () => {
    const token = localStorage.getItem("token");
  if (!token) return;
    try {
      const response = await axiosApi.get('/auth/check', {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
    //   if (response?.data) {
    //   set({ authUser: response?.data });
    // //   set({ authUser:  { ...response.data.user, token }  });
      
    //   // Make sure socket connects after setting authUser
    //    get().connectSocket(); 

    // } else {
    //   set({ authUser: null });
    // }
       set({ authUser: response?.data });
       await get().connectSocket();

    } catch (error) {
        // set({ authUser: null, isCheckingAuth: false });
        console.error('Error checking authentication:', error);
    } finally{
        set({ isCheckingAuth: false });
    }
  },

  //Function to register a user
  // This function will be called when the user submits the registration form
  register: async (data) =>{
      set({ isRegistering: true });
    try {
        // Make a POST request to the backend API to register the user
        const response = await axiosApi.post('/auth/register', data);
        toast.success("Account Registration Successful")
        set({ authUser: response.data });

        get().connectSocket(); // Connect to the socket after successful registration
        console.log("Registration response::", response?.data);
        
    } catch (error) {
        console.error('Error registering user:', error);
        // Handle error (e.g., show a toast notification)
        toast.error('Error registering user' , error.response.data.message);
         
    } finally {
        set({ isRegistering: false });
    }
  },

  //Function to Login the user
  // This function will be called when the user submits the login form
  login: async (data) =>{
      set({ isLoggingIn: true });
    try {
        // Make a POST request to the backend API to register the user
        const response = await axiosApi.post('/auth/login', data,
            { withCredentials: true, } // Include credentials for CORS requests          
       );
       // Save the token in local storage for future requests
       const { token, user } = response.data;
       localStorage.setItem("token", token); // ✅ Save token for future requests
       set({ authUser: user }); // Set the authenticated user data in the store
    //    set({ authUser: { ...user, token } });

        toast.success("Login Successful")
        console.log("Login response:", response?.data);

        //SOCKET.IO  Emit Event to notify other users about the new login
        get().connectSocket();
        console.log("Socket get socket connected:", get().socket);
    } catch (error) {
        console.error('Error logging in user:', error);
        // Handle error (e.g., show a toast notification)
        toast.error('Error logging in user' , error.response?.data?.message);

    } finally {
        set({ isLoggingIn: false });
    }
  },

  //Function to logout the user
  // This function will be called when the user clicks the logout button
logout: async() =>{
    try {
        await axiosApi.post('/auth/logout')
        set({ authUser: null });
        toast.success("Logout Successful")
        // Clear the token from local storage
        // This will prevent the user from accessing protected routes
    
        localStorage.removeItem("token"); // ✅ Remove token from local storage
        //SOCKET.IO  Emit Event to notify other users about the logout
        get().disconnectSocket();
    } catch (error) {
        console.log(" Error logging out User", error);
        toast.error('Error logging out user' , error.response.data.message)       
    }
},

//Function to update the user profile
// This function will be called when the user submits the profile update form
updateProfile: async(data) =>{
    set({ isUpdatingProfile: true });
    try {
        const response = await axiosApi.put('/auth/profile', data,);
        
        const { token, user } = response.data;
        localStorage.setItem("token", token); // ✅ Save token for future requests
        // set({ authUser: user });
        set({ authUser: { ...user, token } });
        toast.success("Profile updated successfully");
        
    } catch (error) {
        console.error('Error updating profile:', error.message);
        toast.error('Error updating profile', error.response.data.message);
    } finally {
        set({ isUpdatingProfile: false });
    }
},

//Function to connect to the socket.io server
// This function will be called when the user logs in or registers
connectSocket: async () => {
    try {
    const {authUser,} = get()
     if(!authUser || !authUser._id || get().socket?.connected) return; // Ensure user is authenticated before connecting
    
     // Create a new socket connection
    // Use the same BaseUrl as your backend server
    const socket = io(BaseUrl, {
        query: {
            userId: authUser?._id, // Pass the user ID as a query parameter
        },
        transports: ['websocket'], // Use WebSocket transport
    });

    set({ socket : socket }); // Store the socket instance in the store
    console.log('Connecting to socket with userId:', authUser?._id);

    // Listen for the 'connect' event to confirm connection
    // socket.connect();
    socket.on('connect', () => {
                console.log('Socket connected::', socket.id);
        });
    
    // socket.on('connected', (userId, onlineUsers) =>{
    //     set({onlineUsers, userId}); // Update the online users in the store
    //     console.log('Socket connected:', socket.id);
    // });
    
    //OVERRIDE
    socket.on('connected', (data) => {
        set({
            onlineUsers: data.onlineUsers,
            userId: data.socketId,
        });
        console.log("Connected data::", data.socketId);
    });
   
    
   } catch (error) {
       console.error('Error connecting to socket:', error.message);
       toast.error('Error connecting to socket', error.message);
   }
},

disconnectSocket: async () => {
    const { socket } = get();
    try {
        if (socket) {
        socket.disconnect(); // Disconnect the socket
        set({ socket: null }); // Clear the socket instance from the store
        console.log('Socket disconnected');
    };
        // toast.success('Socket disconnected successfully');
    } catch (error) {
        console.error('Error disconnecting socket:', error.message);
        toast.error('Error disconnecting socket', error.message);
        
    }
},

//   setRegistering: (isRegistering) => set({ isRegistering }),
//   setLoggingIn: (isLoggingIn) => set({ isLoggingIn }),
//   setUpdatingProfile: (isUpdatingProfile) => set({ isUpdatingProfile }),
//   setChangingPassword: (isChangingPassword) => set({ isChangingPassword }),
}));

export default useAuthStore;
