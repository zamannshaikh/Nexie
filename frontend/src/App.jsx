import React, { useEffect } from "react";
import "./App.css";
import MainRoutes from "./routes/MainRoutes";
import { useDispatch } from "react-redux";
import { asyncGetCurrentUser } from "./store/services/userService";
import { useNavigate } from "react-router-dom";

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const user = await dispatch(asyncGetCurrentUser());

      // asyncGetCurrentUser should return the user or null
      if (user) {
        navigate("/chat");
      } else {
        // optional fallback
      }
    };

    init();
  }, [dispatch, navigate]);

  return (
    <div>
      <MainRoutes />
    </div>
  );
};

export default App;
