import { useState } from 'react';
import './DisconnectMachineButton.css'; // Adjust the path if necessary
import api from '../api/axiosconfig';

export default function DisconnectMachineButton() {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await api.post(`${BACKEND_URI}/api/gateway/token/shutdown`);
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

  return (
    <button 
      className="gateway-disconnect-btn"
      onClick={handleDisconnect} 
      disabled={isDisconnecting}
    >
      {/* You can add an SVG icon here next to the text if you want it to perfectly match the 'gap' styling */}
      {isDisconnecting ? 'Disconnecting...' : 'Disconnect Machine'}
    </button>
  );
}