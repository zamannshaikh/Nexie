import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import '../styles/LoginPage.css';

import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { asyncLoginUser ,asyncLoginWithGoogle} from '../store/services/userService';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';




// SVG Icons (no changes here)
const GoogleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg> );
const GitHubIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> );
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>);
const EyeSlashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9 9 0 0 1 12 3c7 0 10 7 10 7a13.4 13.4 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/><circle cx="12" cy="12" r="3" stroke-dasharray="2 4"/></svg>);

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();



    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            // The 'access_token' is used to get user info from Google's APIs.
            // For simple sign-in, we just need to send it to our backend.
            // However, the standard ID token flow is more common.
            // Let's adjust to get the ID token instead.
            // Note: The library has evolved. `google-auth-library` on the backend
            // typically expects an ID token, not an access token.
            // A simpler component, `GoogleLogin`, provides this directly.
            // Let's switch to that for simplicity.
        },
        onError: () => {
            console.error('Google Login Failed');
            // TODO: Show an error message to the user
        },
    });
  
    const onSubmit = async (data) => {
        try {
   
            await dispatch(asyncLoginUser(data.email, data.password));

      
            reset();
            navigate("/chat");
        } catch (err) {
            // The thunk already logs errors, but you could add
            // UI feedback here (like a toast notification) if the
            // thunk is set up to re-throw the error.
            console.error("Login failed on the component side:", err);
        }
    };


    // Let's use the simpler `GoogleLogin` component approach which is better for this flow.
    const handleGoogleSuccess = (credentialResponse) => {
        // credentialResponse contains the JWT ID token
        const idToken = credentialResponse.credential;
        dispatch(asyncLoginWithGoogle(idToken))
            .unwrap() // .unwrap() will throw an error if the thunk is rejected
            .then(() => {
                navigate("/chat");
            })
            .catch((err) => {
                console.error("Failed to login with Google:", err);
                // Optionally, show a UI error message here
            });
    };



     const handleGoogleError = () => {
        console.error("Google Login Failed");
        // Optionally, show a UI error message
    };


    return (
        <div className="login-page-v2">
            {/* Left Panel for Branding */}
            <div className="login-panel-left">
                <div className="brand-content">
                    <h1 className="brand-logo">Nexie</h1>
                    <p className="brand-tagline">Your personal AI coding companion.</p>
                </div>
            </div>

            {/* Right Panel for the Form (No changes here) */}
            <div className="login-panel-right">
                <div className="login-form-container">
                    <div className="form-header">
                        <h2>Log In</h2>
                        <p>Welcome back! Please enter your details.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="login-form-v2">
                        <div className="social-login-buttons">
                              {/* NEW: We will replace the button with the GoogleLogin component */}
                            {/* The component handles the click and pop-up for you */}
                             <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                text="continue_with"
                                shape="rectangular"
                                width="300px" // Adjust width as needed
                             />
                            <button type="button" className="btn-social"><GitHubIcon /> Continue with GitHub</button>
                        </div>
                        
                        <div className="divider"><span>OR</span></div>

                        <div className="input-group-v2">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                {...register("email", { required: "Email is required.", pattern: { value: /^\S+@\S+\.\S+$/, message: "Please enter a valid email address." } })}
                            />
                            {errors.email && <p className="error-message">{errors.email.message}</p>}
                        </div>

                        <div className="input-group-v2">
                            <div className="label-wrapper">
                                <label htmlFor="password">Password</label>
                                <a href="#" className="forgot-password-v2">Forgot Password?</a>
                            </div>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="••••••••"
                                    {...register("password", { required: "Password is required.", minLength: { value: 8, message: "Password must be at least 8 characters long." } })}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {errors.password && <p className="error-message">{errors.password.message}</p>}
                        </div>

                        <button type="submit" className="btn-login-submit-v2">
                            Log In
                        </button>
                    </form>
                    
                    <p className="signup-link-v2">
                        Don't have an account? <a href="/register">Sign up for free</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;