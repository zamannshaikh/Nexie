// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//     chatsById: {},
//     activeChatId: null,
//     messagesById: {}, 
//     status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
//     error: null,
// };

// const chatSlice = createSlice({
//     name: 'chats',
//     initialState,
//     reducers: {
//         // --- Synchronous actions ---
//         setActiveChat: (state, action) => {
//             state.activeChatId = action.payload;
//         },

//         // --- Actions for fetching chats ---
//         chatsFetchStart: (state) => {
//             state.status = 'loading';
//             state.error = null;
//         },
//         // chatsFetchSuccess: (state, action) => {
//         //     state.status = 'succeeded';
//         //     state.chatsById = {}; // Clear old chats
//         //     action.payload.forEach(chat => {
//         //         state.chatsById[chat._id] = chat;
//         //     });
//         // },
//     chatsFetchSuccess: (state, action) => {
//     state.status = 'succeeded';
//     // MERGE — never clears, never touches activeChatId
//     action.payload.forEach(chat => {
//         state.chatsById[chat._id] = chat;
//     });
// },
//         chatsFetchFailure: (state, action) => {
//             state.status = 'failed';
//             state.error = action.payload;
//         },

//         // --- Actions for creating a new chat ---
//         chatCreateStart: (state) => {
//             state.status = 'loading';
//             state.error = null;
//         },
//         // chatCreateSuccess: (state, action) => {
//         //     state.status = 'succeeded';
//         //     const newChat = action.payload;
//         //     state.chatsById[newChat._id] = newChat;
//         //     state.activeChatId = newChat._id; // Set new chat as active
//         // },
// chatCreateSuccess: (state, action) => {
//     state.status = 'succeeded';
//     const newChat = action.payload;
//     state.chatsById[newChat._id] = newChat; // Adds to sidebar immediately
//     // activeChatId intentionally NOT set here — component handles it explicitly
// },
//         chatCreateFailure: (state, action) => {
//             state.status = 'failed';
//             state.error = action.payload;
//         },
//         chatUpdateStart: (state) => {
//             state.status = 'loading';
//         },
//         chatUpdateSuccess: (state, action) => {
//             state.status = 'succeeded';
//             const updatedChat = action.payload;
//             // Find the chat by its ID and update it
//             state.chatsById[updatedChat._id] = updatedChat;
//         },
//         chatUpdateFailure: (state, action) => {
//             state.status = 'failed';
//             state.error = action.payload;
//         },
//     },
// });

// // Export all the action creators
// export const {
//     setActiveChat,
//     chatsFetchStart,
//     chatsFetchSuccess,
//     chatsFetchFailure,
//     chatCreateStart,
//     chatCreateSuccess,
//     chatCreateFailure,
//     chatUpdateStart,
//     chatUpdateSuccess,
//     chatUpdateFailure,
// } = chatSlice.actions;


// export default chatSlice.reducer;



import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    chatsById: {},
    activeChatId: null,
    messagesById: {},
    status: 'idle',
    error: null,
};

const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        setActiveChat: (state, action) => {
            state.activeChatId = action.payload;
        },
        chatsFetchStart: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        chatsFetchSuccess: (state, action) => {
            state.status = 'succeeded';
            // MERGE not replace — never wipes activeChatId or newly created chats
            action.payload.forEach(chat => {
                state.chatsById[chat._id] = chat;
            });
        },
        chatsFetchFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
        chatCreateStart: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        chatCreateSuccess: (state, action) => {
            state.status = 'succeeded';
            const newChat = action.payload;
            // Guard: only add if _id exists (catches bad response shape)
            if (newChat?._id) {
                state.chatsById[newChat._id] = newChat;
                // activeChatId intentionally NOT set here
                // Component sets it explicitly after confirming _id exists
            }
        },
        chatCreateFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
        chatUpdateStart: (state) => {
            state.status = 'loading';
        },
        chatUpdateSuccess: (state, action) => {
            state.status = 'succeeded';
            const updatedChat = action.payload;
            state.chatsById[updatedChat._id] = updatedChat;
        },
        chatUpdateFailure: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const {
    setActiveChat,
    chatsFetchStart,
    chatsFetchSuccess,
    chatsFetchFailure,
    chatCreateStart,
    chatCreateSuccess,
    chatCreateFailure,
    chatUpdateStart,
    chatUpdateSuccess,
    chatUpdateFailure,
} = chatSlice.actions;

export default chatSlice.reducer;