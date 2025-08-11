import { Routes, Route, Navigate } from "react-router-dom"
import NavBar from "./components/NavBar"
import HomePage from "./pages/HomePage"
import RegisterPage from "./pages/Auth/RegisterPage"
import LoginPage from "./pages/Auth/LoginPage"
import ProfilePage from "./pages/ProfilePage"
import SettingsPage from "./pages/SettingsPage"
import useAuthStore from "./store/useAuthStore"
import useThemeStore from "./store/useThemeStore"
import { useEffect } from "react"
import Loader from "./components/Loader"
import { Toaster } from "react-hot-toast"

function App() {
  const { authUser, onlineUsers, checkUserAuth, isCheckingAuth } = useAuthStore()
  const {theme} = useThemeStore()
  // Check if the user is authenticated when the app loads
  // This will be called once when the app starts
  // and will set the authUser state if the user is authenticated
  console.log("Online Users::", onlineUsers)
  
  
  useEffect(() => {
    checkUserAuth()
  }, [checkUserAuth])

  // if(isCheckingAuth && !authUser) return <div><Loader/></div> 
  // if(authUser && ! isCheckingAuth ) return <div><Loader/></div> 

  console.log("Auth User::", authUser)

  return(
   <main>
     <div data-theme = {theme}>

       <NavBar />
       <Routes>
          <Route path="/" element={ authUser ? < HomePage /> : <Navigate to='/login'/> } />
          <Route path="/register" element={ !authUser ? < RegisterPage /> : <Navigate to='/login'/> } />
          <Route path="/login" element={ !authUser ?< LoginPage/> : <Navigate to='/'/> } />
          <Route path="/profile" element={ authUser ?   < ProfilePage/> : <Navigate to='/login'/> } />
          <Route path="/settings" element={ authUser ? < SettingsPage/> : <Navigate to='/login'/>  } />
       </Routes>
<Toaster richColors position='top-center'/>
    </div>
   </main>

    
  )
  
}

export default App
