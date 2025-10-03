import { configureStore } from '@reduxjs/toolkit';



import userSlice from "./slices/userSlice";
import chatSlice from "./slices/chatSlice";


// WHY: `configureStore` is the main function that creates the Redux store.
// The `reducer` object tells Redux how to structure the final, top-level state.
// The key 'users' will hold the state from `usersSlice`, 'chats' will hold
// the state from `chatsSlice`, and so on.
export const store = configureStore({
  reducer: {
 
    
    userReducer:userSlice,
    chatReducer:chatSlice

  },
});