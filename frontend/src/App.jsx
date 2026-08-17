// import React, { useEffect } from "react";
// import "./App.css";
// import MainRoutes from "./routes/MainRoutes";
// import { useDispatch } from "react-redux";
// import { asyncGetCurrentUser } from "./store/services/userService";
// import { useNavigate } from "react-router-dom";

// const App = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const init = async () => {
//       const user = await dispatch(asyncGetCurrentUser());

//       // asyncGetCurrentUser should return the user or null
//       if (user) {
//         navigate("/chat");
//       } else {
//         // optional fallback
//       }
//     };

//     init();
//   }, [dispatch, navigate]);

//   return (
//     <div>
//       <MainRoutes />
//     </div>
//   );
// };

// export default App;











import React, { useEffect, useState } from "react";
import "./App.css";
import MainRoutes from "./routes/MainRoutes";
import { useDispatch } from "react-redux";
import { asyncGetCurrentUser } from "./store/services/userService";
import { useNavigate } from "react-router-dom";

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // NEW: Add a loading state to prevent premature rendering
  const [isInitializing, setIsInitializing] = useState(true); 

  useEffect(() => {
    const init = async () => {
      // Wait for the thunk to finish checking the session
      const user = await dispatch(asyncGetCurrentUser());

      console.log("USer from app.jsx : ",user)
      
      // Stop the loading screen
      setIsInitializing(false); 

      if (user) {
        // Optional: If you want to force them to chat when opening the app
        navigate("/chat"); 
      }
    };

    init();
  }, [dispatch, navigate]);

  // NEW: Do not render routes until we know if the user is logged in or not
  if (isInitializing) {
    return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Loading user session...
        </div>
    );
  }

  return (
    <div>
      <MainRoutes />
    </div>
  );
};

export default App;
