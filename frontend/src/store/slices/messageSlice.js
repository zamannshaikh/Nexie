import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messagesByChatId: {}, // { chatId: [ { _id, sender, text, createdAt } ] }
  status: "idle",       // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    // --- Fetch messages actions ---
    messagesFetchStart: (state) => {
      state.status = "loading";
      state.error = null;
    },
    messagesFetchSuccess: (state, action) => {
      state.status = "succeeded";
      const { chatId, messages } = action.payload;
      // ✅ Store normalized array for that chatId
      state.messagesByChatId[chatId] = messages;
    },
    messagesFetchFailure: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },

    // --- Add new message to a chat ---
    messageAdd: (state, action) => {
      const { chatId, message } = action.payload;
      if (!state.messagesByChatId[chatId]) {
        state.messagesByChatId[chatId] = [];
      }
      state.messagesByChatId[chatId].push(message);
    },
  },
});

export const {
  messagesFetchStart,
  messagesFetchSuccess,
  messagesFetchFailure,
  messageAdd,
} = messageSlice.actions;

export default messageSlice.reducer;
