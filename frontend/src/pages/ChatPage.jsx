import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown'; // --- MODIFICATION: Added this import
import "../styles/ChatPage.css";
import { useSelector, useDispatch } from 'react-redux';
import { asyncFetchUserChats, asyncCreateNewChat } from '../store/services/chatService';
import { setActiveChat } from '../store/slices/chatSlice';
import { io } from "socket.io-client";
import { asyncFetchMessages, asyncAddMessage } from "../store/services/messageService";

// --- SVG Icons (No changes here) ---
const NexieIcon = ({ size = 24 }) => ( 
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg> 
);
const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"></line>
    <line x1="4" y1="6" x2="20" y2="6"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// --- CodeBlock Component (No changes here) ---
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
        console.error('Fallback: unable to copy', err);
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

// --- Main ChatPage ---
const ChatPage = () => {
  // --- No changes to state, refs, or selectors ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  const chatLogRef = useRef(null);
  const textareaRef = useRef(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userReducer);
  const { chatsById, activeChatId, status: chatStatus } = useSelector((state) => state.chatReducer);
  const chatHistory = Object.values(chatsById);
  const { messagesByChatId } = useSelector((state) => state.messageReducer);

  const messages = Array.isArray(messagesByChatId[activeChatId]) 
    ? messagesByChatId[activeChatId] 
    : [];

  // --- No changes to useEffect hooks ---
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
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  useEffect(() => {
    const newSocket = io("http://localhost:5000/", { withCredentials: true });
    setSocket(newSocket);

    newSocket.on("response", (data) => {
      const aiMessage = {
        sender: "bot",
        text: typeof data === "string" ? data : data?.content || JSON.stringify(data),
      };
      dispatch(asyncAddMessage(activeChatId, aiMessage));
      setIsLoading(false);
    });

    return () => newSocket.disconnect();
  }, [dispatch, activeChatId]);

  // --- No changes to handler functions ---
  const handleNewChat = async () => {
    const title = prompt("Enter a title for your new chat:");
    if (title && title.trim() !== '') {
      try {
        await dispatch(asyncCreateNewChat(title));
        dispatch(asyncFetchUserChats());
        setSidebarOpen(false);
      } catch (error) {
        console.error("Failed to create chat:", error);
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessage = { sender: "user", text: userInput };
    dispatch(asyncAddMessage(activeChatId, newMessage));
    setUserInput("");
    setIsLoading(true);

    socket.emit("message", { chat: activeChatId, content: userInput });
  };

  // --- MODIFICATION: Removed the entire `parseMessage` function ---

  const activeChatTitle = chatsById[activeChatId]?.title || 'New Chat';

  const renderChatHistory = () => {
    if (chatStatus === 'loading') {
      return <p className="history-loading">Loading chats...</p>;
    }
    return chatHistory.map(chat => (
      <div 
        key={chat._id}
        className={`chat-history-item ${chat._id === activeChatId ? 'active' : ''}`}
        onClick={() => {
          dispatch(setActiveChat(chat._id));
          dispatch(asyncFetchMessages(chat._id));
        }}
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
        {/* Sidebar (No changes here) */}
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
                <div className="user-avatar"><UserIcon /></div>
                <span>{user.name}</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>

        {/* Main */}
        <main className="chat-main">
          <header className="chat-header">
            <button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </button>
            <div className="header-title">
              <NexieIcon size={28} />
              <h1>Nexie </h1>
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
             
             {/* --- MODIFICATION: Updated message rendering logic --- */}
             {messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`message-wrapper ${msg.sender === "user" ? "user-wrapper" : "bot-wrapper"}`}
                >
                  <div className={`message-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
                    <div className="message-content">
                      <ReactMarkdown
                        children={String(msg.text ?? "")}
                        components={{
                          code(props) {
                            const {children, className, node, ...rest} = props
                            const match = /language-(\w+)/.exec(className || '')
                            return match ? (
                              <CodeBlock
                                language={match[1]}
                                code={String(children).replace(/\n$/, '')}
                              />
                            ) : (
                              <code {...rest} className={className}>
                                {children}
                              </code>
                            )
                          }
                        }}
                      />
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

          {/* Chat Input Area (No changes here) */}
          {activeChatId && (
            <div className="chat-input-area">
              <div className="chat-input-container">
                <form onSubmit={handleSendMessage} className="chat-input-form">
                  <textarea
                    ref={textareaRef}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) handleSendMessage(e);
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
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;