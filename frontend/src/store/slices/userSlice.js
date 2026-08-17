// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {

//   user: '',
// };

// const usersSlice = createSlice({
//   name: 'users',
//   initialState,
//   reducers: {
//     // This action allows you to change the current user.
//     setCurrentUser: (state, action) => {
//       state.user = action.payload;
//     },
//      removeCurrentUser: (state, action) => {
//       state.user = null;
//     },
//   },
// });

// export const { setCurrentUser ,removeCurrentUser} = usersSlice.actions;
// export default usersSlice.reducer;








import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // Changed from '' to null (better practice for objects)
  accessToken: null, // Holds the short-lived token
  isAuthenticated: false, // Easy flag for your React Router protected routes
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // This action now expects an object containing BOTH the user and the token
    setCurrentUser: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    // Clears out everything on logout
    removeCurrentUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCurrentUser, removeCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;