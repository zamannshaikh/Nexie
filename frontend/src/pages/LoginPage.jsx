import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { asyncLoginUser, asyncLoginWithGoogle } from '../store/services/userService';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import '../styles/LoginPage.css';

// --- SVG Icons ---
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>);
const EyeSlashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9 9 0 0 1 12 3c7 0 10 7 10 7a13.4 13.4 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /><circle cx="12" cy="12" r="3" strokeDasharray="2 4" /></svg>);

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
// handling login with email
    const onSubmit = async (data) => {
        try {
         await dispatch(asyncLoginUser(data.email, data.password));
         navigate("/chat");
         reset();
           
            
            
        } catch (err) {
            console.error("Login failed:", err);
        }
    };
// funtion to handle login with google
    const handleGoogleSuccess = async (credentialResponse) => {
        const idToken = credentialResponse.credential;
        console.log("Google Credential:", jwtDecode(credentialResponse.credential));
        try {
            await dispatch(asyncLoginWithGoogle(idToken));
            navigate("/chat");
        } catch (error) {
            console.log("Google login failed:", error);
        }
    };

    const handleGoogleError = () => {
        console.error("Google Login Failed");
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-panel-left">
                <div className="brand-content">
                    <h1 className="brand-logo">Nexie</h1>
                    <p className="brand-tagline">Your personal AI coding companion.</p>
                </div>
            </div>
            <div className="login-panel-right">
                <div className="login-form-container">
                    <div className="form-header">
                        <h2>Log In</h2>
                        <p>Welcome back! Please enter your details.</p>
                    </div>
                    

                    <div className="social-login-provider">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline" // <-- The only change is here
                            size="large"
                            text="continue_with"
                            shape="rectangular"
                            width="360" // Use a fixed width for better alignment
                        />
                    </div>


                    <div className="divider"><span>OR</span></div>
                    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" type="email" placeholder="you@example.com"
                                {...register("email", {
                                    required: "Email is required.",
                                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Please enter a valid email." }
                                })}
                            />
                            {errors.email && <p className="error-message">{errors.email.message}</p>}
                        </div>
                        <div className="input-group">
                            <div className="label-wrapper">
                                <label htmlFor="password">Password</label>
                                <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                            </div>
                            <div className="password-input-wrapper">
                                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                    {...register("password", {
                                        required: "Password is required.",
                                        minLength: { value: 8, message: "Password must be at least 8 characters." }
                                    })}
                                />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {errors.password && <p className="error-message">{errors.password.message}</p>}
                        </div>
                        <button type="submit" className="btn-login-submit">
                            Log In
                        </button>
                    </form>
                    <p className="signup-link">
                        Don't have an account? <Link to="/register">Sign up for free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

