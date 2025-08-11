import React, { useRef, useState } from 'react'
import useChatStore from '../store/useChatStore';
import { Image, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosApi from '../utils/axios';

// const MessageInput = () => {
const MessageInput = ({ senderId, receiverId }) => {
  const [text, setText] = useState('');
  // const [content, setText] = useState('');
  const [imagePreview, setImagePreview]  = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore()

  //updated use state code
  const [content, setMessageText] = useState('');
  const [file, setFile] = useState(null);

  // Function to handle sending messages
  // This function will be called when the form is submitted
  // const handleSendMessage = async (e) => {
  //   e.preventDefault()
  //   // Check if there is text or an image to send
  //   if (!text.trim() && !imagePreview) {
  //     toast.error("Please enter a message or select an image");
  //     return;
  //   }
    
  //   try {     
  //     // Prepare the message data
  //     const messageData = {
  //       text: text.trim(),
  //       image: imagePreview,
  //     };

  //     // Call the sendMessage function from the store
  //     await sendMessage(messageData);
  //     toast.success("Message sent successfully");
  //     console.log("Message sent::::", messageData);

  //     setText(""); // Clear the text input
  //     setImagePreview(null); // Clear the image preview
  //     if(fileInputRef.current) fileInputRef.current.value = null; // Clear the file input
      
  //   } catch (error) {
  //     console.error("Error sending message:", error.message);
  //     toast.error("Failed to send message", error.response?.data?.message || "An error occurred");
  //   }
  // }

  // // Check if there is text or an image to send
  // const handleImageChange = (e) => {
  //   try {
  //     const file = e.target.files[0];
  //     if(!file?.type?.startsWith('image/')){
  //       toast.error('Please select a valid image file');
  //       return;
  //       }

  //       // Create a FileReader to read the image file
  //       const reader  = new FileReader();
  //       reader.onloadend = () =>{
  //         setImagePreview(reader?.result);
  //       }
  //       reader.readAsDataURL(file);

  //     } catch (error) {
  //       console.error("Error reading file:", error.message);
  //     }
  // };

  // UPDATED CODE HERE TO Send Message
  // Function to send messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!file && !content.trim()) return toast.error("Please type a message or attach a file");
    
    let uploadedFileUrl =  null; // Placeholder for file upload URL if needed

    const formData = new FormData();
    formData.append('senderId', senderId);
    formData.append('receiverId', receiverId);
    formData.append('content', content);
    // formData.append('text', messageText);
    if (file) formData.append('file', file);

    try {

      // If a file is selected, upload it first/ UPDATED CODE
       if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axiosApi.post("/message/fileUpload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      uploadedFileUrl = uploadRes?.data?.fileUrl;
    }
      
      // const res = await axiosApi.post('/message/fileUpload', formData, {
      //   withCredentials: true,
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      //Call the sendMessage function from the store

      // Prepare the message data
      // const messageData = {
      //   content: messageText.trim(),
      //   image: imagePreview,
      // };

      // UPDATED CODE TO SEND MESSAGE
      const messageData = {
          senderId,
          receiverId,
          content: content.trim(),
          mediaType: file ? (file.type.startsWith("image/") ? "image" : "document") : null,
          // mediaUrl: null, // You can update this after uploading, if applicable
          mediaUrl: uploadedFileUrl, // You can update this after uploading, if applicable
          status: "sent",
        };
        if (file) {
            formData.append("file", file);
          }

      // await sendMessage(messageData);
      // await sendMessage(formData);
      console.log('Message sent:', messageData);
      toast.success("Message sent successfully");

      // console.log("Message sent (raw):", messageData);
      console.log("Message sent (data):", messageData);
      setMessageText('');
      setFile(null);
      // Optional: refresh messages, emit socket event, etc.
    } catch (err) {
      console.error("Error sending message:", err.message);
      toast.error('Error sending message');
    }
  };


  // UPDATED CODE  Function to handle File Change or Upload Documents
   const handleFileChange =  async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf',
       'application/msword', 
       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    //  await axiosApi.post("/message/fileUpload",  {
    //         headers: {
    //           "Content-Type": "multipart/form-data",
    //         },
    //         withCredentials: true,
    //       });

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Unsupported file type');
      return;
    }
    setFile(selectedFile);
     // Only show preview if image
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }

  };

  // Function to remove the image preview
  
  const removeImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Clear the file input
    }
  };


  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImagePreview}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* <form onSubmit={handleSendMessage} className="flex items-center gap-2"> */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={content}
            // value={text}
            // onChange={(e) => setText(e.target.value)}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <input
            type="file"
            // accept="image/*"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            className="hidden"
            ref={fileInputRef}
            // onChange={handleImageChange}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          // disabled={!text?.trim() && !imagePreview}
          disabled={!content?.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
}

export default MessageInput
