import { setCurrentUser,removeCurrentUser } from "../slices/userSlice"; 
import axios from "../../api/axiosconfig"
 
 
 
 export const asyncRegisterUser=  (name,email,password)=> async(dispatch,getState)=>{
    try {
        const response = await axios.post("/auth/register",{name,email,password},
            {  withCredentials: true }
        );
        console.log(response.data);
        dispatch(setCurrentUser(response.data));
    } catch (error) {
        console.error("Error fetching user:", error);
        
    }
}






// In your services file (e.g., userServices.js)

export const asyncLoginUser = (email, password) => async (dispatch) => {
    try {
        const response = await axios.post("/auth/login", { email, password }, {
            withCredentials: true,
        });

        const user = response.data;

        // 1. Dispatch to update Redux state
        dispatch(setCurrentUser(user));

        // 2. Save user to Local Storage
        // We use JSON.stringify because local storage can only store strings.
        localStorage.setItem('user', JSON.stringify(user));

    } catch (error) {
        console.error("Error logging in:", error);
    }
};



export const asyncLogoutUser = () => async (dispatch) => {
    try {
        // Step 1: Tell the server to end the session (optional but recommended)
        await axios.post("/auth/logout", {}, { withCredentials: true });

        // Step 2: Clear the user from local storage
        localStorage.removeItem("user");

        // Step 3: Clear the user from the Redux state
        dispatch(removeCurrentUser());

        console.log("User logged out from server and client.");
    } catch (error) {
        console.error("Error logging out user:", error);
    }
};










// Get Current User
export const asyncGetCurrentUser = () => async (dispatch) => {
    try {
        const response = await axios.get("/auth/currentUser", {
            withCredentials: true, // ensures cookies/session are sent
        });

        const user = response.data;

        // 1. Dispatch to Redux
        dispatch(setCurrentUser(user));

        // 2. Save to Local Storage
        localStorage.setItem("user", JSON.stringify(user));

        console.log("Fetched current user:", user);
    } catch (error) {
        console.error("Error fetching current user:", error);

        // If unauthorized or session expired, clear state
        localStorage.removeItem("user");
        dispatch(removeCurrentUser());
    }
};




















