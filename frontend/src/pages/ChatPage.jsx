import React, { useState, useEffect, useRef } from 'react';
import "../styles/ChatPage.css";
import { useSelector, useDispatch } from 'react-redux';
import { asyncFetchUserChats, asyncCreateNewChat } from '../store/services/chatService';
import { setActiveChat } from '../store/slices/chatSlice';


// --- SVG Icons (no changes) ---
const NexieIcon = ({ size = 24 }) => ( <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const UserIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const SendIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const MenuIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>);
const PlusIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);


// --- Enhanced CodeBlock Component (no changes) ---
const CodeBlock = ({ code, language }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => { /* ... */ };
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
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const chatLogRef = useRef(null);
    const textareaRef = useRef(null);
    
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.userReducer);
    const { chatsById, activeChatId, status: chatStatus } = useSelector((state) => state.chatReducer);
    const chatHistory = Object.values(chatsById);

    useEffect(() => {
        if (chatStatus === 'idle' && user) {
            dispatch(asyncFetchUserChats());
        }
    }, [chatStatus, user, dispatch]);

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

    const handleNewChat = () => {
        dispatch(asyncCreateNewChat('new chat from chatpage'));
        setMessages([]);
        setSidebarOpen(false);
    };
    
    // --- Restored Logic: handleSendMessage function ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput("");
        setIsLoading(true);

        // This is still the mock response. We'll connect this to the real API later.
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

    // --- Restored Logic: parseMessage function ---
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

    const activeChatTitle = chatsById[activeChatId]?.title || 'New Chat';

    const renderChatHistory = () => {
        if (chatStatus === 'loading') {
            return <p className="history-loading">Loading chats...</p>;
        }
        return chatHistory.map(chat => (
            <div 
                key={chat._id}
                className={`chat-history-item ${chat._id === activeChatId ? 'active' : ''}`}
                onClick={() => dispatch(setActiveChat(chat._id))}
            >
                {chat.title}
            </div>
        ));
    };

    if (!user) {
        return <div>Loading user...</div>;
    }

    return (
        <div className="chat-page-container">
            <div className="chat-page">
                <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-content">
                        <button className="new-chat-button" onClick={handleNewChat}>
                            <PlusIcon /> New Chat
                        </button>
                        <div className="chat-history">
                            <h3 className="history-title">Recent</h3>
                            {renderChatHistory()}
                        </div>
                        <div className="sidebar-footer">
                            <div className="user-profile">
                                <div className="user-avatar">
                                    <UserIcon />
                                </div>
                                <span>{user.name}</span>
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
                           <h1>{activeChatTitle}</h1>
                        </div>
                    </header>
                    
                    <div className="chat-log-wrapper">
                        <div className="chat-log" ref={chatLogRef}>
                            {messages.length === 0 && !isLoading && (
                                 <div className="welcome-message">
                                    <NexieIcon size={48} />
                                    <h2>Hey {user.name}, how can I help you today?</h2>
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
                                            <span/><span/><span/>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* --- Restored Logic: Chat Input Area JSX --- */}
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