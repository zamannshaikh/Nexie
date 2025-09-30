import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatPage.css';

// SVG Icons for the UI
const NexieIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.5C12 2.5 6.5 5 6.5 12C6.5 19 12 21.5 12 21.5C12 21.5 17.5 19 17.5 12C17.5 5 12 2.5 12 2.5Z" stroke="url(#grad1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8V13" stroke="url(#grad2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 16.5C12.8284 16.5 13.5 15.8284 13.5 15C13.5 14.1716 12.8284 13.5 12 13.5C11.1716 13.5 10.5 14.1716 10.5 15C10.5 15.8284 11.1716 16.5 12 16.5Z" fill="url(#grad3)"/>
        <defs>
            <linearGradient id="grad1" x1="6.5" y1="2.5" x2="17.5" y2="21.5" gradientUnits="userSpaceOnUse"><stop stopColor="#2dd4bf"/><stop offset="1" stopColor="#a78bfa"/></linearGradient>
            <linearGradient id="grad2" x1="12" y1="8" x2="12" y2="13" gradientUnits="userSpaceOnUse"><stop stopColor="#2dd4bf"/><stop offset="1" stopColor="#a78bfa"/></linearGradient>
            <linearGradient id="grad3" x1="10.5" y1="13.5" x2="13.5" y2="16.5" gradientUnits="userSpaceOnUse"><stop stopColor="#2dd4bf"/><stop offset="1" stopColor="#a78bfa"/></linearGradient>
        </defs>
    </svg>
);
const UserIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#a8a29e"/></svg>);
const SendIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>);
const MenuIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);
const PlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);

// CodeBlock component for syntax highlighting and copy functionality
const CodeBlock = ({ code }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div className="code-block">
            <pre><code>{code}</code></pre>
            <button onClick={copyToClipboard} className="copy-button">
                {copied ? 'Copied!' : 'Copy Code'}
            </button>
        </div>
    );
};

// Main ChatPage component
const ChatPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        { id: 1, title: "React component styling" },
        { id: 2, title: "Python script for data analysis" },
        { id: 3, title: "Next.js routing issue" },
    ]);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatLogRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto-scroll to the bottom of the chat log on new messages
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);
    
    // Auto-resize textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [userInput]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput("");
        setIsLoading(true);

        // Simulate a bot response
        setTimeout(() => {
            const botResponse = `Sure, here is an example of a simple React component:
\`\`\`javascript
import React from 'react';

const MyComponent = () => {
    return (
        <div>
            <h1>Hello, Nexie!</h1>
        </div>
    );
};

export default MyComponent;
\`\`\`
Let me know if you need anything else!`;
            
            setMessages([...newMessages, { sender: 'bot', text: botResponse }]);
            setIsLoading(false);
        }, 1500);
    };

    // Helper to parse messages with code blocks
    const parseMessage = (text) => {
        const parts = text.split(/(\`\`\`[\s\S]*?\`\`\`)/g);
        return parts.map((part, index) => {
            if (part.startsWith('```')) {
                const language = part.match(/```(\w+)/)?.[1] || '';
                const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
                return <CodeBlock key={index} code={code.trim()} language={language} />;
            }
            return part;
        });
    };

    return (
        <div className="chat-page">
            <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button className="new-chat-button">
                        <PlusIcon /> New Chat
                    </button>
                </div>
                <div className="chat-history">
                    {chatHistory.map(chat => (
                        <div key={chat.id} className="chat-history-item">
                            {chat.title}
                        </div>
                    ))}
                </div>
                <div className="sidebar-footer">
                    <div className="user-profile">
                        <UserIcon />
                        <span>User Name</span>
                    </div>
                </div>
            </aside>
            
            {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>}
            
            <main className="chat-main">
                <header className="chat-header">
                    <button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <MenuIcon />
                    </button>
                    <h1>Nexie</h1>
                </header>
                
                <div className="chat-log" ref={chatLogRef}>
                    {messages.length === 0 && !isLoading && (
                         <div className="welcome-message">
                            <NexieIcon />
                            <h2>How can I help you today?</h2>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.sender}-message`}>
                           <div className="message-icon">
                                {msg.sender === 'user' ? <UserIcon /> : <NexieIcon />}
                            </div>
                           <div className="message-content">
                                {parseMessage(msg.text)}
                           </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="message-bubble bot-message">
                            <div className="message-icon"><NexieIcon /></div>
                            <div className="message-content thinking-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="chat-input-area">
                    <form onSubmit={handleSendMessage} className="chat-input-form">
                        <textarea
                            ref={textareaRef}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Message Nexie..."
                            rows="1"
                        />
                        <button type="submit" disabled={!userInput.trim() || isLoading}>
                            <SendIcon />
                        </button>
                    </form>
                    <p className="disclaimer">
                        Nexie may display inaccurate info. Please verify important information.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
