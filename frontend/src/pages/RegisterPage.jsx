import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { asyncRegisterUser } from '../store/services/userService';
import '../styles/RegisterPage.css';

// SVG Icons for the form fields (no changes here)
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="input-icon"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="input-icon"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="input-icon"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const EyeOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="password-toggle-icon-svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const EyeClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="password-toggle-icon-svg"><path d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.367z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3a9.953 9.953 0 013.477.61l-1.071 1.071A8.003 8.003 0 0010 4.5C6.11 4.5 2.688 6.873 1.5 10c1.188 3.127 4.61 5.5 8.5 5.5a8.003 8.003 0 003.477-.93l-1.07-1.07A6 6 0 0110 14.5c-1.42 0-2.73-.49-3.768-1.31L.458 10z" clipRule="evenodd" /></svg>;


const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        if (password !== confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        setIsLoading(true);
        try {
            // **THE FIX IS HERE**
            // Reverted to passing arguments separately to match your original, working code.
            await dispatch(asyncRegisterUser(name, email, password));

            // If the dispatch action completes without an error, we can assume
            // success and navigate the user to the login page.
            navigate('/login');

        } catch (err) {
            // This will catch any errors if your async thunk is configured to reject on failure.
            setError(err.message || 'Registration failed. Please check your details and try again.');
            console.error("Error in registration: ", err);
        } finally {
            setIsLoading(false); // Reset loading state regardless of outcome
        }
    };

    return (
        <div className="register-page">
            <div className="register-panel-left">
                <div className="brand-content">
                    <h1 className="brand-logo">Nexie</h1>
                    <p className="brand-tagline">Your personal AI coding companion.</p>
                </div>
            </div>

            <div className="register-panel-right">
                <div className="register-form-container">
                    <div className="form-header">
                        <h2>Create an Account</h2>
                        <p>Start your journey with Nexie today.</p>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <form onSubmit={handleRegister} className="register-form">
                        <div className="input-group-register">
                            <label htmlFor="fullName">Name</label>
                            <div className="input-wrapper">
                                <UserIcon />
                                <input
                                    type="text"
                                    id="fullName"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group-register">
                            <label htmlFor="email">Email</label>
                             <div className="input-wrapper">
                                <MailIcon />
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group-register">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <LockIcon />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Minimum 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="8"
                                />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                                </button>
                            </div>
                        </div>
                        <div className="input-group-register">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="input-wrapper">
                                <LockIcon />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-register-submit" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                    
                    <div className="social-login-divider">
                        <span>OR</span>
                    </div>
                    <div className="social-login-buttons">
                        <button className="btn-social google">
                            <svg className="google-icon" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path><path d="M1 1h22v22H1z" fill="none"></path></svg>
                            <span>Sign up with Google</span>
                        </button>
                    </div>

                    <p className="login-link">
                        Already have an account? <Link to="/login">Log In</Link> 
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;