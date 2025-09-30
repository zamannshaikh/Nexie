import React from 'react'
import { Routes, Route, Link } from "react-router-dom";
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ChatPage from '../pages/ChatPage';

const MainRoutes = () => {
  return (
    <>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/chat" element={<ChatPage />} />
        
      </Routes>
    </>
  )
}

export default MainRoutes