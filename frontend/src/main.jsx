import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store.js'; // Import our store
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

console.log("App's Actual Origin:", window.location.origin);
console.log("Client ID being used:", import.meta.env.VITE_GOOGLE_CLIENT_ID); // Or process.env.REACT_APP_GOOGLE_CLIENT_ID if using CRA


createRoot(document.getElementById('root')).render(
   <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>


  <Provider store={store}>
 <BrowserRouter>
    <App />
  </BrowserRouter>
  </Provider>
     </GoogleOAuthProvider>
)
