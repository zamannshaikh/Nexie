import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store.js'; // Import our store
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
 <BrowserRouter>
    <App />
  </BrowserRouter>
  </Provider>
)
