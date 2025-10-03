import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    chatsById: {},
    activeChatId: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        // --- Synchronous actions ---
        setActiveChat: (state, action) => {
            state.activeChatId = action.payload;
        },

        // --- Actions for fetching chats ---
        chatsFetchStart: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        chatsFetchSuccess: (state, action) => {
            state.status = 'succeeded';
            state.chatsById = {}; // Clear old chats
            action.payload.forEach(chat => {
                state.chatsById[chat._id] = chat;
            });
        },
        chatsFetchFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },

        // --- Actions for creating a new chat ---
        chatCreateStart: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        chatCreateSuccess: (state, action) => {
            state.status = 'succeeded';
            const newChat = action.payload;
            state.chatsById[newChat._id] = newChat;
            state.activeChatId = newChat._id; // Set new chat as active
        },
        chatCreateFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

// Export all the action creators
export const {
    setActiveChat,
    chatsFetchStart,
    chatsFetchSuccess,
    chatsFetchFailure,
    chatCreateStart,
    chatCreateSuccess,
    chatCreateFailure,
} = chatSlice.actions;

export default chatSlice.reducer;