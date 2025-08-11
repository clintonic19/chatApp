import axios from 'axios';

const axiosApi = axios.create({
  
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // Include credentials for CORS requests
  headers: {
    'Content-Type': 'application/json',
  },
  
});

// axiosApi.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`; // This is what the backend needs
//     // axiosApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   }
//   return config;

// }, (error) => {
//   return Promise.reject(error);
// });

// example1@gmail.com
export default axiosApi;
