import { create  } from 'zustand';
import axiosApi from '../utils/axios';
import toast from 'react-hot-toast';
import useAuthStore from './useAuthStore';

const useChatStore = create((set, get) => ({

messages: [],
users: [],
selectedUser: null,
isUsersLoading: false,
isMessagesLoading: false,

// Function to fetch users
getAllUsers: async()=>{
    set({ isUsersLoading: true });
    try {          
        // Make sure to include the token in the request headers
        const response = await axiosApi.get("/message/users", { withCredentials: true});
        set({ users: response?.data?.users });
        console.log("Users fetched successfully:", response?.data.users);
        console.log("Online Users:", response?.data.onlineUsers);
        console.log("Online GetUsers:", get().onlineUsers);

    } catch (error) {
        console.error('Error fetching users:', error.message);
        toast.error('Error fetching users', error.response?.data?.message);
    } finally {
        set({ isUsersLoading: false });
    }
},

// Function to fetch messages for a selected user
getMessagesByUserId: async(userId) =>{

 let selectedUserId = userId;

    // Extract _id from object if needed
    if (typeof userId === 'object' && userId !== null && userId._id) {
        selectedUserId = userId._id;
    }

    if (typeof selectedUserId !== 'string') {
        console.error("Invalid userId:", userId);
        toast.error("Invalid user ID provided for message fetch");
        return;
    }
    set({  selectedUser: selectedUserId , isMessagesLoading: true });
    // set({ isMessagesLoading: true, selectedUser: userId });
    console.log("Fetching messages for user:::", userId);
  
    try {
        const response = await axiosApi.get(`/message/${selectedUserId}`, { withCredentials: true });
        // set({ messages: response?.data?.data });
        set({ messages: response?.data?.messages });
        console.log("Fetched messages::", response?.data?.messages);
    } catch (error) {
        console.error('Error fetching messages:', error.message);
        toast.error('Error fetching messages', error.response?.data?.message);
    } finally {
        set({ isMessagesLoading: false });
    }
},

// Function to send to real-time messages
sendMessage: async(messageData) =>{
    const {selectedUser, messages} = get();
    // const userId = (typeof selectedUser === "object" ? selectedUser._id : selectedUser) || null;
    try {
        const response = await axiosApi.post(`/message/send/${selectedUser._id}`, messageData );

        set({ messages: [...messages, response?.data.messages] });
        // set({ messages: [...messages, response?.data.users] });
        console.log("Message sent successfully:", response?.data.messages);
        console.log("Message sent successfully:::", response?.data);
    } catch (error) {
        console.error('Error sending message:', error.message);
        toast.error('Error sending message', error.response?.data?.message);
    }
},

subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) {
        console.error("No user selected for subscription");
        return;
    }

    // Assuming you have a socket connection established
    // const socket = window.io(); // Adjust this based on your socket setup
    const socket = useAuthStore.getState().socket; // Get the socket from auth store
    socket?.off('newMessage'); // Unsubscribe from any previous listeners to avoid duplicates
    //Work on Later
    socket?.on("newMessage", (newMessage) => {
        // Here you would typically check if the newMessage is for the selectedUser
        // For example, if newMessage.receiverId matches selectedUser._id
        const messageSentFromSelectedUser = newMessage.receiverId === selectedUser._id;
        // const messageSentFromSelectedUser= newMessage.senderId === selectedUser || newMessage.receiverId === selectedUser
        if (!messageSentFromSelectedUser) return;
        
        if(newMessage !== newMessage.userId){
            return; // Ignore messages not for the selected user
            
        }
        console.log("Message not for the selected user:", newMessage, selectedUser._id);
        console.log("Message not for the selected user:", messageSentFromSelectedUser);
        // and update the messages state accordingly
        set({ 
            messages: [...get().messages, newMessage]
         }); 
        console.log("New message received:", newMessage);
    });
},

unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket; // Get the socket from auth store
    socket?.off('newMessage'); // Unsubscribe from the 'newMessage' event
    // socket.off(`newMessage:${get().selectedUser?._id}`); // Unsubscribe from the specific user's messages
    // set({ messages: [] }); // Clear messages when unsubscribing
    console.log("Unsubscribed from messages for user:", get().selectedUser?._id);
},

setSelectedUser: (selectedUser) => set({ selectedUser }),

}));

export default useChatStore;