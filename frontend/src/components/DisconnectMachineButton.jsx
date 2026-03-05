import { useState,useEffect } from 'react';
import './DisconnectMachineButton.css'; // Adjust the path if necessary
import api from '../api/axiosconfig';

export default function DisconnectMachineButton() {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const BACKEND_URI = import.meta.env.VITE_BACKEND_URI;


  // 1. Fetch the active status when the component loads
  const checkStatus = async () => {
    try {
      const response = await api.get(`${BACKEND_URI}/gateway/token/status`, {
        credentials: 'include'
      });
      console.log("Gateway status response:", response);
      if (response.status === 200) {
        const data = await response.data;
        setIsActive(data.active);
        console.log("Gateway active status:", data.active);
      }
    } catch (error) {
      console.error("Failed to fetch gateway status", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Optional: Poll every 10 seconds to keep the UI up-to-date automatically
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await api.post(`${BACKEND_URI}/gateway/token/shutdown`);
      console.log("Shutdown response:", response);
      if (response.ok) {
        alert("Machine disconnected and shut down successfully!");
      } else {
        const data = await response.data;
        alert(data.message || "No active machine found.");
      }
    } catch (error) {
      console.error("Shutdown Error:", error);
      alert("Server error occurred while disconnecting.");
    } finally {
      setIsDisconnecting(false);
    }
  };

if (isLoading) {
    return <div className="status-indicator">Checking connection...</div>;
  }

  return (
    <div className="gateway-status-container">
      <div className="status-indicator">
        <span className={`status-dot ${isActive ? 'active' : 'inactive'}`}></span>
        {isActive ? 'Gateway Online' : 'Gateway Offline'}
      </div>

      {isActive && (
        <button 
          className="gateway-disconnect-btn"
          onClick={handleDisconnect} 
          disabled={isDisconnecting}
        >
          {isDisconnecting ? 'Disconnecting...' : 'Disconnect Machine'}
        </button>
      )}
    </div>
  );
}
  