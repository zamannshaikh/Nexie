// import axios from '../../api/axiosconfig';
// // Import the action creators from the slice
// import {
//     chatsFetchStart,
//     chatsFetchSuccess,
//     chatsFetchFailure,
//     chatCreateStart,
//     chatCreateSuccess,
//     chatCreateFailure,
//      chatUpdateStart,
//     chatUpdateSuccess,
//     chatUpdateFailure
// } from '../slices/chatSlice';

// /**
//  * Manually fetches all chats for the logged-in user.
//  */
// export const asyncFetchUserChats = () => async (dispatch) => {
//     dispatch(chatsFetchStart()); // Set status to 'loading'
//     try {
//         const response = await axios.get('/chats/getchats', {
//             withCredentials: true,
//         });
//         dispatch(chatsFetchSuccess(response.data)); // On success, dispatch data
//         return response.data;
//     } catch (error) {
//         const errorMessage = error.response?.data?.message || error.message;
//         dispatch(chatsFetchFailure(errorMessage)); // On failure, dispatch error
//     }
// };

// /**
//  * Manually creates a new chat session.
//  */
// export const asyncCreateNewChat = (title) => async (dispatch) => {
//     dispatch(chatCreateStart()); // Set status to 'loading'
//     try {
//         const response = await axios.post('/chats/createchat',
//             { title: title },
//             { withCredentials: true }
//         );
//         dispatch(chatCreateSuccess(response.data)); // On success, dispatch new chat
//         asyncFetchUserChats(); // Refresh the chat list
//          return response.data;
//     } catch (error) {
//         const errorMessage = error.response?.data?.message || error.message;
//         dispatch(chatCreateFailure(errorMessage)); // On failure, dispatch error
//     }
// };





// export const asyncUpdateChatTitle = (chatId, title) => async (dispatch) => {
//     dispatch(chatUpdateStart()); // Dispatch a start action
//     try {
//         const response = await axios.patch(`/chats/updatechat/${chatId}`, 
//             { title: title },
//             { withCredentials: true }
//         );
//         // On success, dispatch the updated chat object
//         dispatch(chatUpdateSuccess(response.data)); 
//         return response.data;
//     } catch (error) {
//         const errorMessage = error.response?.data?.message || error.message;
//         dispatch(chatUpdateFailure(errorMessage)); // On failure, dispatch error
//     }
// };
import axios from '../../api/axiosconfig';
import {
    chatsFetchStart,
    chatsFetchSuccess,
    chatsFetchFailure,
    chatCreateStart,
    chatCreateSuccess,
    chatCreateFailure,
    chatUpdateStart,
    chatUpdateSuccess,
    chatUpdateFailure
} from '../slices/chatSlice';

export const asyncFetchUserChats = () => async (dispatch) => {
    dispatch(chatsFetchStart());
    try {
        const response = await axios.get('/chats/getchats', {
            withCredentials: true,
        });
        dispatch(chatsFetchSuccess(response.data));
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        dispatch(chatsFetchFailure(errorMessage));
    }
};

export const asyncCreateNewChat = (title) => async (dispatch) => {
    dispatch(chatCreateStart());
    try {
        const response = await axios.post('/chats/createchat',
            { title: title },
            { withCredentials: true }
        );

        // THE KEY FIX: backends often wrap the object like { chat: {...} }
        // This normalizes both cases so we always get the raw chat object
        const newChat = response.data?.chat || response.data;

        console.log("Normalized newChat:", newChat); // Keep until confirmed working

        dispatch(chatCreateSuccess(newChat));
        return newChat; // Return the normalized object directly
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        dispatch(chatCreateFailure(errorMessage));
        return null;
    }
};

export const asyncUpdateChatTitle = (chatId, title) => async (dispatch) => {
    dispatch(chatUpdateStart());
    try {
        const response = await axios.patch(`/chats/updatechat/${chatId}`,
            { title: title },
            { withCredentials: true }
        );
        dispatch(chatUpdateSuccess(response.data));
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        dispatch(chatUpdateFailure(errorMessage));
    }
};