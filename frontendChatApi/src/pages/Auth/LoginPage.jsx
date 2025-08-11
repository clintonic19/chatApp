import React, { useState } from 'react'
import useAuthStore from '../../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, MessageSquare } from 'lucide-react';
import Loader from '../../components/Loader';
import ImagePattern from '../../components/ImagePattern';
import { useEffect } from 'react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { authUser } = useAuthStore()
    const [formData, setFormData] = useState({
      email: "",
      password: "",
    });
  
    const { login, isLoggingIn } = useAuthStore();
  
    const validateForm = () => {
      if (!formData.email.trim()) return toast.error("Email is required");
      if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
      if (!formData.password) return toast.error("Password is required");
      if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
  
      return true;
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
  
      const success = validateForm();
      
      if (success === true) login(formData);
      // Redirect to login page after successful registration
            // setTimeout(() => {
            //   navigate('/');
            // },1500)
      // console.log("Form Data:", formData);
    };

    useEffect(() => {
  if (authUser) {
    navigate('/');
  }
}, [authUser, navigate]);
  
    return (
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* left side */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* LOGO */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div 
                  className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary/20 transition-colors"
                >
                  <MessageSquare className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Login</h1>
                <p className="text-base-content/60">Get started with your account</p>
              </div>
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Session */}  
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium mb-2">Email:</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    className={`input input-bordered w-full pl-10`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

               {/* Password Session */}
  
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium mb-2">Password:</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`input input-bordered w-full pl-10`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-base-content/40" />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>
  
              <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    {/* <Loader2 className="size-5 animate-spin" />
                    Loading... */}
                    <Loader className="animate-spin text-2xl text-white"/>
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
  
            <div className="text-center">
              <p className="text-base-content/60">
                Don't have an account?{" "}
                <Link to="/register" className=" text-red-500 hover:underline">
                  Register here.
                </Link>
              </p>
            </div>
          </div>
        </div>
  
        {/* right side */}
  
        <ImagePattern
          title="Join our community"
          subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
        />
      </div>
    );
}

export default LoginPage
