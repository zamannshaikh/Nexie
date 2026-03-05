import React, { useState, useEffect } from "react";
import "../styles/GatewaySetup.css";
import api from "../api/axiosconfig";

const GatewaySetup = () => {
  const [token, setToken] = useState("Loading your secure token...");
  const [copied, setCopied] = useState(false);
  const BACKEND_URI = import.meta.env.VITE_BACKEND_URI;
  console.log("Backend URI:", BACKEND_URI);

  useEffect(() => {
    // Fetch the token from your Node.js backend
    const fetchToken = async () => {
      try {
        const response = await api.get(
          `${BACKEND_URI}/gateway/token/generate`,
          { withCredentials: true },
        );
        console.log("Token response:", response);
        const data = await response.data;
        if (data.token) setToken(data.token);
      } catch (error) {
        console.error("Error fetching token:", error);
        setToken("Failed to load token. Please refresh.");
      }
    };
    fetchToken();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="gateway-container">
      <div className="gateway-header">
        <h1>Link Local Gateway</h1>
        <p>Give Nexie secure access to execute commands on your machine.</p>
      </div>

      <div className="gateway-steps">
        <div className="step-card">
          <div className="step-number">1</div>
          <h3>Download the Client</h3>
          <p>
            Download the lightweight Nexie Gateway executable for your operating
            system.
          </p>
          <a
            href="/NexieGateway-Mac.zip"
            download="NexieGateway-Mac.zip"
            className="download-btn"
            style={{
              textDecoration: "none",
              display: "inline-block",
              textAlign: "center",
            }}
          >
            Download for Mac
          </a>
        </div>

        <div className="step-card">
          <div className="step-number">2</div>
          <h3>Copy Your Token</h3>
          <p>This is your unique, secure connection token. Do not share it.</p>
          <div className="token-box">
            <code>{token}</code>
            <button className="copy-btn" onClick={copyToClipboard}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="step-card">
          <div className="step-number">3</div>
          <h3>Run and Connect</h3>
          <p>
            Open the downloaded app. It will prompt you to paste the token
            above. Once pasted, Nexie is connected!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GatewaySetup;
