import { setCurrentUser,removeCurrentUser } from "../slices/userSlice"; 
import axios from "../../api/axiosconfig";

import { setAccessToken } from "../../api/axiosconfig";

 
 
 
 export const asyncRegisterUser=  (name,email,password)=> async(dispatch,getState)=>{
    try {
        const response = await axios.post("/auth/register",{name,email,password},
            {  withCredentials: true }
        );
        console.log("from registration : ",response.data)
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

        const {user,accessToken}= response.data;
        console.log("from login : ", user)
        setAccessToken(accessToken);

        // 1. Dispatch to update Redux state
        dispatch(setCurrentUser({ 
            user: user, 
            accessToken: accessToken 
        }));

        return user;

    } catch (error) {
        console.error("Error logging in:", error);
        throw error; // Re-throw the error so the component can handle it
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
// export const asyncGetCurrentUser = () => async (dispatch) => {
//     try {
//         const response = await axios.get("/auth/currentUser", {
//             withCredentials: true, // ensures cookies/session are sent
//         });

//         const user = response.data;

//         // 1. Dispatch to Redux
//         dispatch(setCurrentUser(user));

//         // 2. Save to Local Storage
//         localStorage.setItem("user", JSON.stringify(user));

//         console.log("Fetched current user:", user);
//     } catch (error) {
//         console.error("Error fetching current user:", error);

//         // If unauthorized or session expired, clear state
//         localStorage.removeItem("user");
//         dispatch(removeCurrentUser());
//     }
// };


export const asyncGetCurrentUser = () => async (dispatch) => {
    try {
         console.log("RAN!!!");
        // 1. Silently ask the backend for a new Access Token using the HttpOnly cookie
        const refreshResponse = await axios.get("/auth/refresh");
        console.log("Current user ==> ",refreshResponse);
        const { accessToken } = refreshResponse.data;
        console.log("ACess Token ==> ",accessToken);
        // 2. Save the token to our Axios interceptor memory
        setAccessToken(accessToken);

        // 3. NOW fetch the user profile using the custom 'api' instance
        // Because we used setAccessToken, the interceptor will automatically attach it!
        const userResponse = await axios.get("/auth/currentUser");
        const user = userResponse.data;

        // 4. Dispatch BOTH to Redux as a single object
        dispatch(setCurrentUser({ user: user, accessToken: accessToken }));

        console.log("Session restored:", user);
        return user; 
        
    } catch (error) {
        console.log("No active session found. User needs to log in : ",error);
        
        // Ensure everything is wiped clean if the refresh cookie is missing/expired
        dispatch(removeCurrentUser());
        return null; 
    }
};






// New thunk for Google login
export const asyncLoginWithGoogle = (credential) => async (dispatch) => {


    try {
        // 2. Make the API call
        const response = await axios.post('/auth/google', { token: credential });

        const { user, accessToken } = response.data;


        console.log("from user Service data :",user, accessToken);

        // 1. Give the token to your Axios interceptor
        setAccessToken(accessToken);

        // 2. Dispatch them both to Redux
        dispatch(setCurrentUser({ user, accessToken }));

        // Return the data so the component can use it if needed
        return user;

    } catch (error) {
        // 4. On failure, figure out the error message
        let errorMessage = 'An unknown error occurred.';
        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || 'Login failed on the backend.';
            console.error("Google login failed on the backend:", error.response.data);
        } else {
            errorMessage = error.message;
            console.error("Google login failed:", error.message);
        }


        

        // Re-throw the error so the component's .catch() block can handle it
        throw new Error(errorMessage);
    }
};




















