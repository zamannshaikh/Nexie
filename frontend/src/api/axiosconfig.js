import axios from "axios";

// This logic checks if you are in development mode (`npm run dev`).
// If YES, it uses the '/api' proxy path.
// If NO (i.e., in production), it uses your real backend URL from your .env file.
const baseURL = import.meta.env.DEV
  ? '/api'
  // ❗️ Make sure your .env file has VITE_BACKEND_URI for production
  : import.meta.env.VITE_BACKEND_URI;

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, // This is still crucial!
});








// Variable to hold the Access Token in memory
let currentAccessToken = null;

export const setAccessToken = (token) => {
    currentAccessToken = token;
};

// Request Interceptor: Attach the token to every outgoing request
api.interceptors.request.use(
    (config) => {
        if (currentAccessToken) {
            config.headers['Authorization'] = `Bearer ${currentAccessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Catch 403s and silently refresh
api.interceptors.response.use(
    (response) => response, // If successful, just return the response
    async (error) => {
        const originalRequest = error.config;

        // If error is 403 and we haven't already retried this exact request
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.warn("🔄 [AUTH LOG] Access token expired. Initiating silent refresh...");
            try {
                // Attempt to get a new token
                const response = await axios.get(`${baseURL}/auth/refresh`, {
                    withCredentials: true // Must send the cookie
                });

                // Update our in-memory token
                currentAccessToken = response.data.accessToken;

                // Update the failed request's header and try again
                originalRequest.headers['Authorization'] = `Bearer ${currentAccessToken}`;
                return api(originalRequest);
                
            } catch (refreshError) {
                // If the refresh fails (e.g., refresh token is expired/revoked), log the user out
                currentAccessToken = null;
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;