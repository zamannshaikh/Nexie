import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import "../styles/ChatPage.css";
import { useSelector, useDispatch } from "react-redux";
import {
  asyncFetchUserChats,
  asyncCreateNewChat,
  asyncUpdateChatTitle,
} from "../store/services/chatService";
import { setActiveChat } from "../store/slices/chatSlice";
import { messageAdd } from "../store/slices/messageSlice"; 
import { asyncFetchMessages } from "../store/services/messageService";
import { asyncLogoutUser } from "../store/services/userService";
import { io } from "socket.io-client";

// --- ICONS and CODEBLOCK (No Changes) ---
const NexieIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke="#b0b0b0"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 17L12 22L22 17"
      stroke="#b0b0b0"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12L12 17L22 12"
      stroke="#b0b0b0"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const UserIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const SendIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 2L11 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="12" x2="20" y2="12"></line>
    <line x1="4" y1="6" x2="20" y2="6"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);
const PlusIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const LogoutIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17L21 12L16 7"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12H9"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };
  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span>{language || "code"}</span>
        <button onClick={copyToClipboard} className="copy-button">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          borderBottomLeftRadius: "0.5rem",
          borderBottomRightRadius: "0.5rem",
        }}
        codeTagProps={{
          style: {
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: "0.9rem",
          },
        }}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// --- Main ChatPage Component ---
const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const socket = useRef(null);
  const chatLogRef = useRef(null);
  const textareaRef = useRef(null);


  

  
  

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.userReducer);
  const { chatsById, activeChatId } = useSelector((state) => state.chatReducer);
  const { messagesByChatId } = useSelector((state) => state.messageReducer);

  const chatHistory = Object.values(chatsById).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
  const messages = messagesByChatId[activeChatId] || [];

  const prevChatCount = useRef(chatHistory.length);
  



  // This useEffect hook will run whenever chatHistory changes
  useEffect(() => {
    // Check if the number of chats has increased
    if (chatHistory.length > prevChatCount.current) {
      // The newest chat is the first one in the sorted list
      const newestChat = chatHistory[0];
      if (newestChat) {
        // Dispatch the action to set the newest chat as active
        dispatch(setActiveChat(newestChat._id));
      }
    }
    // Update the ref with the current count for the next render
    prevChatCount.current = chatHistory.length;
  }, [chatHistory, dispatch]);


  // Effect to fetch initial user chats
  useEffect(() => {
    if (user) {
      dispatch(asyncFetchUserChats());
    }
  }, [user, dispatch]);

  // Effect to manage the socket connection
  useEffect(() => {
    socket.current = io("https://nexie-1inf.onrender.com/", { withCredentials: true });
    // socket.current.on("response", (data) => {
    //   const aiMessage = {
    //     _id: `bot-${Date.now()}`,
    //     sender: "bot",
    //     text:
    //       typeof data === "string"
    //         ? data
    //         : data?.content || JSON.stringify(data),
    //   };
    //   // We need to get the activeChatId from the store *inside* the listener
    //   // to avoid stale closures.
    //   const currentActiveChatId = store.getState().chatReducer.activeChatId;
    //   dispatch(messageAdd({ chatId: currentActiveChatId, message: aiMessage }));
    //   setIsLoading(false);
    // });
   
     // NEW LISTENER for the "working" signal
    const handleResponsePending = (data) => {
      const currentActiveChatId = store.getState().chatReducer.activeChatId;
      if (data.chat === currentActiveChatId) {
        setIsLoading(true);
      }
    };


    // UPDATED LISTENER for the final response
    const handleResponse = (data) => {
      const currentActiveChatId = store.getState().chatReducer.activeChatId;
      // Ensure the incoming message is for the currently active chat
      if (data.chat === currentActiveChatId) {
        const aiMessage = {
          _id: `bot-${Date.now()}`,
          chat: data.chat,
          content: data.content,
          role: "model",
          sender: "bot", // For UI consistency
          text: data.content // For UI consistency
        };
        dispatch(messageAdd({ chatId: currentActiveChatId, message: aiMessage }));
        setIsLoading(false); // Turn off loading indicator
      }
    };

       // Attach the new and updated listeners
    socket.current.on("response_pending", handleResponsePending);
    socket.current.on("response", handleResponse);
    return () => {
      socket.current.off("response_pending", handleResponsePending);
      socket.current.off("response", handleResponse);
      socket.current.disconnect();
    };
  }, [dispatch]);

  // Effect for auto-scrolling & textarea height
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const handleNewChat =  () => {
   dispatch(asyncCreateNewChat("New Chat"));
    dispatch(asyncFetchUserChats());
  
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    dispatch(asyncLogoutUser());
    navigate("/");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const activeChat = chatsById[activeChatId];
    if (!activeChat) {
      console.error("Cannot send message, no active chat selected.");
      return;
    }

    // Check if this is the first message in a default-named chat.
    if (activeChat.title === "New Chat" && messages.length === 0) {
      const newTitle =
        userInput.trim().slice(0, 40) +
        (userInput.trim().length > 40 ? "..." : "");
      dispatch(asyncUpdateChatTitle(activeChatId, newTitle));
    }

    const userMessage = {
      _id: `user-${Date.now()}`,
      sender: "user",
      text: userInput,
    };

    // THIS IS THE FIX: Dispatch the synchronous action for an instant UI update.
    dispatch(messageAdd({ chatId: activeChatId, message: userMessage }));
    socket.current.emit("message", { chat: activeChatId, content: userInput });

    setUserInput("");
    setIsLoading(true);
  };

  const selectChat = (chatId) => {
    dispatch(setActiveChat(chatId));
    if (!messagesByChatId[chatId]) {
      dispatch(asyncFetchMessages(chatId));
    }
  };

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <div className="chat-page-container">
      <div className="chat-page">
        <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-content">
            <button className="new-chat-button" onClick={handleNewChat}>
              <PlusIcon /> New Chat
            </button>
            <div className="chat-history">
              <h3 className="history-title">Recent</h3>
              {chatHistory.map((chat) => (
                <div
                  key={chat._id}
                  className={`chat-history-item ${
                    chat._id === activeChatId ? "active" : ""
                  }`}
                  onClick={() => selectChat(chat._id)}
                >
                  {chat.title}
                </div>
              ))}
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
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <main className="chat-main">
          <header className="chat-header">
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MenuIcon />
            </button>
            <div className="header-title">
              <NexieIcon size={28} />
              <h1>Nexie</h1>
            </div>
            <button
              className="logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              <LogoutIcon />
            </button>
          </header>
          <div className="chat-log-wrapper">
            <div className="chat-log" ref={chatLogRef}>
              {messages.length === 0 && !isLoading && (
                <div className="welcome-message">
                  <NexieIcon size={48} />
                  <h2>Hey {user.name}, how can I help you today?</h2>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message-wrapper ${
                    msg.sender === "user" ? "user-wrapper" : "bot-wrapper"
                  }`}
                >
                  <div
                    className={`message-bubble ${
                      msg.sender === "user" ? "user-bubble" : "bot-bubble"
                    }`}
                  >
                    <div className="message-content">
                      <ReactMarkdown
                        children={String(msg.text ?? "")}
                        components={{
                          code(props) {
                            const { children, className } = props;
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            return match ? (
                              <CodeBlock
                                language={match[1]}
                                code={String(children).replace(/\n$/, "")}
                              />
                            ) : (
                              <code className={className}>{children}</code>
                            );
                          },
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
                      <span />
                      <span />
                      <span />
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
                    if (e.key === "Enter" && !e.shiftKey) handleSendMessage(e);
                  }}
                  placeholder="Message Nexie..."
                  rows="1"
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!userInput.trim() || isLoading}
                >
                  <SendIcon />
                </button>
              </form>
            </div>
            <p className="disclaimer">
              Nexie may produce inaccurate information. Please verify important
              details.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
export default ChatPage;

// You need to import your store here to prevent stale closures in the socket listener
import { store } from "../store/store";
