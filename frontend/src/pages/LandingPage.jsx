import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

// --- NEW: Updated SVG Icons for Features ---
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.5 21.75l-.398-1.188a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.188-.398a2.25 2.25 0 001.423-1.423L16.5 15.75l.398 1.188a2.25 2.25 0 001.423 1.423l1.188.398-1.188.398a2.25 2.25 0 00-1.423 1.423z" /></svg>;
const PuzzleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.75a4.5 4.5 0 014.5 4.5v4.5a4.5 4.5 0 01-4.5 4.5h-4.5a4.5 4.5 0 01-4.5-4.5v-4.5a4.5 4.5 0 014.5-4.5h4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3a4.5 4.5 0 014.5 4.5v4.5a4.5 4.5 0 01-4.5 4.5h-4.5a4.5 4.5 0 01-4.5-4.5V7.5a4.5 4.5 0 014.5-4.5h4.5z" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 01-1.59 0L12 18.75h-2.25m-2.25-3l-3.72 3.72a1.125 1.125 0 01-1.59 0L2.25 18.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75v-3.75m0 0a3.75 3.75 0 00-7.5 0M12 12v-3.75a3.75 3.75 0 017.5 0" /></svg>;

const LandingPage = () => {
    // Typing animation logic remains the same
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(120);

    // NEW: Updated words to reflect broader capabilities
    const wordsToRotate = ["Code & Curiosity", "Work & Wonder", "Logic & Dreams", "Projects & Passion"];
    const navigate=useNavigate();

    const loginHandler = () => navigate("/login");
    const registerHandler = () => navigate("/register");

    useEffect(() => {
        const tick = () => {
            let i = loopNum % wordsToRotate.length;
            let fullText = wordsToRotate[i];
            let updatedText = isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1);

            setText(updatedText);

            if (isDeleting) {
                setTypingSpeed(prev => prev / 1.8);
            }

            if (!isDeleting && updatedText === fullText) {
                setIsDeleting(true);
                setTypingSpeed(2000);
            } else if (isDeleting && updatedText === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
                setTypingSpeed(120);
            }
        };

        let ticker = setInterval(tick, typingSpeed);
        return () => clearInterval(ticker);
    }, [text, isDeleting, loopNum, typingSpeed]);

    // NEW: Updated features data
    const features = [
        { icon: <BrainIcon />, title: "Creative Brainstorming", description: "Break through creative blocks and explore new ideas with an AI partner." },
        { icon: <PuzzleIcon />, title: "Effortless Problem-Solving", description: "From complex code to everyday questions, get clear and concise answers." },
        { icon: <ChatIcon />, title: "Engaging Conversation", description: "Enjoy a casual chat or a deep discussion. Nexie is here to listen." }
    ];

    return (
        <div className="landing-page">
            <div className="background-shapes">
                <div className="shape-1"></div>
                <div className="shape-2"></div>
                <div className="shape-3"></div>
            </div>

            <nav className="navbar">
                <div className="logo">Nexie</div>
                <div className="nav-buttons">
                    <button onClick={loginHandler} className="btn btn-secondary">Login</button>
                    <button onClick={registerHandler} className="btn btn-primary">Sign Up</button>
                </div>
            </nav>

            <main className="hero-section">
                <div className="hero-visual">
                    <div className="visual-circle-1"></div>
                    <div className="visual-circle-2"></div>
                    <div className="visual-circle-3"></div>
                </div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        One companion for...
                        <br/>
                        <span className="animated-text-wrapper">
                           <span className="animated-text">{text}</span>
                           <span className="cursor"></span>
                        </span>
                    </h1>
                    <p className="hero-description">
                        Go beyond tools. Nexie is your creative partner for brainstorming, problem-solving, and conversation.
                    </p>
                    <div className="cta-main">
                         <button onClick={registerHandler} className="btn btn-get-started">Get Started For Free</button>
                    </div>
                </div>
            </main>

            <section className="features-section">
                <h2 className="section-title">Chat smarter, feel closer — with Nexie by your side.</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} Nexie. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;