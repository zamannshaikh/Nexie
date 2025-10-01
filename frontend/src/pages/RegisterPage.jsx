import React, { useState } from 'react';
import '../styles/RegisterPage.css';
import axios from '../api/axiosconfig';
import { useNavigate } from 'react-router-dom';


const RegisterPage = ({ onNavigate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate=useNavigate();
    
    // State to manage password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
       try {
        const response=  await axios.post("/auth/register",{name,email,password},{
             withCredentials: true 

        })
        console.log("Response from backend: ",response)
        navigate("/login")
        
       } catch (error) {
        console.error("Error Registering user: ",error)
       }
        console.log('Registering with:', { name, email, password });
        
    };

    return (
        <div className="register-page">
            {/* Left Panel for Branding (same as login) */}
            <div className="register-panel-left">
                <div className="brand-content">
                    <h1 className="brand-logo">Nexie</h1>
                    <p className="brand-tagline">Your personal AI coding companion.</p>
                </div>
            </div>

            {/* Right Panel for the Form */}
            <div className="register-panel-right">
                <div className="register-form-container">
                    <div className="form-header">
                        <h2>Create an Account</h2>
                        <p>Start your journey with Nexie today.</p>
                    </div>

                    <form onSubmit={handleRegister} className="register-form">
                        <div className="input-group-register">
                            <label htmlFor="fullName"> Name</label>
                            <input
                                type="text"
                                id="fullName"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                         <div className="input-group-register">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        {/* Updated Password Input Group */}
                        <div className="input-group-register">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Minimum 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="8"
                                />
                                <span 
                                    className="password-toggle-icon" 
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </span>
                            </div>
                        </div>
                        {/* Updated Confirm Password Input Group */}
                         <div className="input-group-register">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <span 
                                    className="password-toggle-icon" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </span>
                            </div>
                        </div>

                        <button type="submit" className="btn-register-submit">
                            Create Account
                        </button>
                    </form>
                    
                    <p className="login-link">
                        Already have an account? <a href="/login" >Log In</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;