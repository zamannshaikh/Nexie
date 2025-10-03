import { createSlice } from '@reduxjs/toolkit';

const initialState = {

  user: '',
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // This action allows you to change the current user.
    setCurrentUser: (state, action) => {
      state.user = action.payload;
    },
     removeCurrentUser: (state, action) => {
      state.user = null;
    },
  },
});

export const { setCurrentUser ,removeCurrentUser} = usersSlice.actions;
export default usersSlice.reducer;