import axios from "axios";

// This logic checks if you are in development mode (`npm run dev`).
// If YES, it uses the '/api' proxy path.
// If NO (i.e., in production), it uses your real backend URL from your .env file.
const baseURL = import.meta.env.DEV
  ? '/api'
  // ❗️ Make sure your .env file has VITE_BACKEND_URI for production
  : import.meta.env.BACKEND_URI;

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, // This is still crucial!
});

export default api;