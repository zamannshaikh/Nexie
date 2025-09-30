import React, { useState, useEffect } from 'react';
import '../styles/LandingPage.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    // State and logic for the animated typing effect (remains the same)
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(120);

    const wordsToRotate = ["Buddy", "Assistant", "Friend", "Mentor"];
    const period = 1800;
    const navigate=useNavigate();
    const loginHandler=()=>{
        navigate("/login")
    }
    const registerHandler=()=>{
        navigate("/register")
    }

    useEffect(() => {
        let ticker = setInterval(() => {
            tick();
        }, typingSpeed);
        return () => { clearInterval(ticker) };
    }, [text]);

    const tick = () => {
        let i = loopNum % wordsToRotate.length;
        let fullText = wordsToRotate[i];
        let updatedText = isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1);

        setText(updatedText);

        if (isDeleting) {
            setTypingSpeed(prevSpeed => prevSpeed / 1.8);
        }

        if (!isDeleting && updatedText === fullText) {
            setIsDeleting(true);
            setTypingSpeed(period);
        } else if (isDeleting && updatedText === '') {
            setIsDeleting(false);
            setLoopNum(loopNum + 1);
            setTypingSpeed(120);
        }
    };

    return (
        <div className="landing-page">
            <div className="aurora-background">
                <div className="aurora-dot"></div>
                <div className="aurora-dot"></div>
                <div className="aurora-dot"></div>
            </div>

            <nav className="navbar animate-fade-in-down">
                <div className="logo">Nexie</div>
                <div className="nav-buttons">
                    <button onClick={loginHandler} className="btn btn-login">Login</button>
                    <button onClick={registerHandler}  className="btn btn-register">Register</button>
                </div>
            </nav>

            <main className="hero-content">
                <h1 className="hero-title animate-fade-in">
                    <span className="gradient-text">Nexie AI.</span> 
                </h1>
                <h2 className="hero-tagline animate-fade-in-up">
                   <span className="animated-text">{text}</span>
                   <span className="cursor"></span>
                </h2>
                <p className="hero-description animate-fade-in-up delay-1">
                    The intelligent assistant designed to streamline your workflow, debug code, and spark creativity.
                </p>
                <div className="cta-main animate-fade-in-up delay-2">
                     <button className="btn btn-get-started">Get Started For Free</button>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;