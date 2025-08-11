import { create  } from 'zustand';

const useThemeStore = create((set) => ({
    // Function to set the theme
    // This function will be called to change the theme of the application
    theme: localStorage.getItem('theme') || 'light', // Default to light theme if not set
    setTheme: (theme) => {
        localStorage.setItem('theme', theme); // Save the theme to localStorage
        set({theme})
    },
}));

export default useThemeStore;
