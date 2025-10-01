import React, { useState, useEffect, useRef } from 'react';

// --- Styles Component ---
// To resolve the file path issue, styles are now included directly in the component.
const ChatPageStyles = () => (
    <style>{`
        /* --- Root Variables & Base Styles (Monochromatic Theme) --- */
        :root {
            --bg-primary: #0d0d0d;      /* Near Black */
            --bg-secondary: #1f1f1f;    /* Dark Grey */
            --bg-tertiary: #2a2a2a;     /* Medium Grey */
            --text-primary: #e5e5e5;    /* Soft White */
            --text-secondary: #8e8e8e;   /* Muted Grey */
            --border-color: #2a2a2a;
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            --sidebar-width: 280px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        /* Using a more specific selector to avoid interfering with other page elements */
        .chat-page-container, .chat-page-container body, .chat-page-container html {
            font-family: var(--font-family);
            background-color: var(--bg-primary);
            color: var(--text-primary);
            overflow: hidden; /* Prevent body scroll */
        }

        /* --- Main Page Layout (Mobile First) --- */
        .chat-page {
            display: flex;
            height: 100vh;
            width: 100vw;
            position: relative;
            overflow: hidden;
        }

        /* --- Sidebar --- */
        .chat-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            width: var(--sidebar-width);
            background-color: var(--bg-primary);
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-right: 1px solid var(--border-color);
        }

        .chat-sidebar.open {
            transform: translateX(0);
        }

        .sidebar-content {
            padding: 1rem;
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .new-chat-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            width: 100%;
            padding: 0.75rem 1rem;
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .new-chat-button:hover { background-color: var(--bg-tertiary); }

        .chat-history {
            flex-grow: 1;
            margin-top: 1.5rem;
            overflow-y: auto;
        }
        .history-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
            padding: 0 0.5rem 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .chat-history-item {
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 0.95rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: background-color 0.2s;
            color: var(--text-primary);
        }
        .chat-history-item:hover { background-color: var(--bg-secondary); }

        .sidebar-footer { border-top: 1px solid var(--border-color); padding: 1rem 0 0; }
        .user-profile { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; }
        .user-avatar { width: 32px; height: 32px; border-radius: 50%; background-color: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; }
        .user-profile span { font-weight: 500; }

        .sidebar-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            z-index: 999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        .chat-sidebar.open ~ .sidebar-backdrop {
            opacity: 1;
            pointer-events: all;
        }

        /* --- Main Chat Area --- */
        .chat-main {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            height: 100vh;
            width: 100vw;
        }

        .chat-header {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border-color);
            background-color: var(--bg-primary);
            flex-shrink: 0;
        }
        .menu-button {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 99px;
            display: flex;
            transition: background-color 0.2s, color 0.2s;
        }
        .menu-button:hover { background-color: var(--bg-secondary); color: var(--text-primary); }

        .header-title { display: flex; align-items: center; gap: 0.5rem; margin-left: 0.5rem; }
        .header-title h1 { font-size: 1.125rem; font-weight: 600; }

        /* --- Chat Log & Messages --- */
        .chat-log-wrapper {
            flex-grow: 1;
            overflow-y: auto;
            position: relative;
        }
        .chat-log {
            padding: 1.5rem 1rem;
            display: flex;
            flex-direction: column;
        }
        .welcome-message {
            text-align: center;
            margin: auto;
            color: var(--text-secondary);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }
        .welcome-message h2 { font-weight: 500; font-size: 1.5rem; color: var(--text-primary); }

        .message-wrapper {
            display: flex;
            flex-direction: column;
            margin-bottom: 1.5rem;
        }
        .user-wrapper { align-items: flex-end; }
        .bot-wrapper { align-items: flex-start; }

        .message-bubble {
            max-width: 90%;
            padding: 0.75rem 1rem;
            border-radius: 1rem;
            line-height: 1.6;
        }
        .message-content p {
            margin-bottom: 0.5rem;
        }
        .message-content p:last-child {
            margin-bottom: 0;
        }

        .bot-bubble {
            background-color: var(--bg-secondary);
            border-bottom-left-radius: 0.25rem;
        }
        .user-bubble {
            background-color: var(--bg-tertiary);
            color: var(--text-primary);
            border-bottom-right-radius: 0.25rem;
        }

        /* --- Code Blocks --- */
        .code-block-wrapper {
            background-color: #0d1117;
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            margin: 1rem 0;
            overflow: hidden;
        }
        .code-block-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #161b22;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        .copy-button {
            background-color: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            padding: 0.25rem 0.75rem;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            transition: background-color 0.2s, color 0.2s;
        }
        .copy-button:hover { background-color: var(--bg-tertiary); color: var(--text-primary); }
        .code-block-wrapper pre {
            padding: 1rem;
            overflow-x: auto;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            font-size: 0.9rem;
            color: #c9d1d9;
        }

        /* --- Thinking Indicator --- */
        .thinking-indicator span {
            display: inline-block; width: 8px; height: 8px; border-radius: 50%;
            background-color: var(--text-secondary); margin: 0 2px;
            animation: bounce 1.2s infinite ease-in-out;
        }
        .thinking-indicator span:nth-child(1) { animation-delay: -0.24s; }
        .thinking-indicator span:nth-child(2) { animation-delay: -0.12s; }
        @keyframes bounce { 0%, 60%, 100% { transform: scale(0.4); } 30% { transform: scale(1.0); } }

        /* --- Chat Input Area --- */
        .chat-input-area {
            padding: 1rem;
            background-color: var(--bg-primary);
            border-top: 1px solid var(--border-color);
            flex-shrink: 0;
        }
        .chat-input-container {
            max-width: 800px;
            margin: 0 auto;
        }
        .chat-input-form {
            display: flex;
            align-items: flex-end;
            gap: 0.75rem;
            background-color: var(--bg-secondary);
            border-radius: 1rem;
            padding: 0.5rem;
            border: 1px solid var(--border-color);
            transition: border-color 0.2s;
        }
        .chat-input-form:focus-within { border-color: #555; }
        .chat-input-form textarea {
            flex-grow: 1;
            background: none;
            border: none;
            color: var(--text-primary);
            font-size: 1rem;
            resize: none;
            max-height: 150px;
            overflow-y: auto;
            line-height: 1.5;
            font-family: var(--font-family);
            padding: 0.5rem;
        }
        .chat-input-form textarea:focus { outline: none; }
        .send-button {
            background-color: var(--bg-tertiary);
            color: var(--text-primary);
            border: none;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 0.75rem;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }
        .send-button:hover:not(:disabled) { background-color: #3c3c3c; }
        .send-button:disabled { background: var(--bg-tertiary); cursor: not-allowed; color: var(--text-secondary); opacity: 0.6; }

        .disclaimer {
            font-size: 0.75rem;
            text-align: center;
            color: var(--text-secondary);
            padding-top: 0.75rem;
        }

        /* --- Responsive Design for Tablet & Desktop --- */
        @media (min-width: 768px) {
            .chat-sidebar {
                position: relative;
                transform: translateX(0);
                transition: none;
            }
            .sidebar-backdrop {
                display: none;
            }
            .chat-main {
                width: calc(100vw - var(--sidebar-width));
            }
            .chat-header {
                justify-content: center;
            }
            .menu-button {
                display: none;
            }
            .chat-log {
                padding: 2rem;
            }
            .message-bubble {
                max-width: 80%;
            }
        }

        @media (min-width: 1024px) {
            .chat-log {
                padding: 2rem 4rem;
            }
            .message-bubble {
                max-width: 75%;
            }
        }
    `}</style>
);


// --- SVG Icons for the new UI (Monochromatic) ---
const NexieIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const UserIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const SendIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const MenuIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>);
const PlusIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);

// --- Enhanced CodeBlock Component ---
const CodeBlock = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            });
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = code;
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(textArea);
        }
    };
    
    return (
        <div className="code-block-wrapper">
            <div className="code-block-header">
                <span>{language || 'code'}</span>
                <button onClick={copyToClipboard} className="copy-button">
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre><code>{code}</code></pre>
        </div>
    );
};


// --- Main ChatPage Component ---
const ChatPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        { id: 1, title: "React component styling guide" },
        { id: 2, title: "Python script for data analysis" },
        { id: 3, title: "Next.js routing issue debug" },
        { id: 4, title: "How to setup a docker container" },
    ]);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const chatLogRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages, isLoading]);
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [userInput]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput("");
        setIsLoading(true);

        setTimeout(() => {
            const botResponse = `Of course! Here is a basic functional component in React using hooks:
\`\`\`javascript
import React, { useState } from 'react';

const Counter = () => {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
        </div>
    );
};

export default Counter;
\`\`\`
This example demonstrates the \`useState\` hook for managing state within a component. Let me know if you'd like me to explain it further!`;
            
            setMessages([...newMessages, { sender: 'bot', text: botResponse }]);
            setIsLoading(false);
        }, 1500);
    };

    const parseMessage = (text) => {
        const parts = text.split(/(\`\`\`(\w*)\n[\s\S]*?\`\`\`)/g);
        return parts.map((part, index) => {
            if (part.startsWith('```')) {
                const language = part.match(/```(\w*)/)?.[1] || '';
                const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
                return <CodeBlock key={index} code={code.trim()} language={language} />;
            }
            return part.trim() && <p key={index}>{part.trim()}</p>;
        });
    };

    return (
        <div className="chat-page-container">
            <ChatPageStyles />
            <div className="chat-page">
                <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-content">
                        <button className="new-chat-button">
                            <PlusIcon /> New Chat
                        </button>
                        <div className="chat-history">
                            <h3 className="history-title">Recent</h3>
                            {chatHistory.map(chat => (
                                <div key={chat.id} className="chat-history-item">
                                    {chat.title}
                                </div>
                            ))}
                        </div>
                        <div className="sidebar-footer">
                            <div className="user-profile">
                                <div className="user-avatar">
                                    <UserIcon />
                                </div>
                                <span>Jane Doe</span>
                            </div>
                        </div>
                    </div>
                </aside>
                
                <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>
                
                <main className="chat-main">
                    <header className="chat-header">
                        <button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <MenuIcon />
                        </button>
                        <div className="header-title">
                            <NexieIcon size={28}/>
                            <h1>Nexie</h1>
                        </div>
                    </header>
                    
                    <div className="chat-log-wrapper">
                        <div className="chat-log" ref={chatLogRef}>
                            {messages.length === 0 && !isLoading && (
                                 <div className="welcome-message">
                                    <NexieIcon size={48} />
                                    <h2>How can I help you today?</h2>
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <div key={index} className={`message-wrapper ${msg.sender}-wrapper`}>
                                    <div className={`message-bubble ${msg.sender}-bubble`}>
                                       <div className="message-content">
                                            {parseMessage(msg.text)}
                                       </div>
                                    </div>
                                </div>
                            ))}
                             {isLoading && (
                                <div className="message-wrapper bot-wrapper">
                                    <div className="message-bubble bot-bubble">
                                        <div className="message-content thinking-indicator">
                                            <span/>
                                            <span/>
                                            <span/>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="chat-input-area">
                        <div className="chat-input-container">
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
                                <button type="submit" className="send-button" disabled={!userInput.trim() || isLoading}>
                                    <SendIcon />
                                </button>
                            </form>
                        </div>
                        <p className="disclaimer">
                            Nexie may produce inaccurate information. Please verify important details.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ChatPage;

