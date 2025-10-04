import axios from '../../api/axiosconfig';
// Import the action creators from the slice
import {
    chatsFetchStart,
    chatsFetchSuccess,
    chatsFetchFailure,
    chatCreateStart,
    chatCreateSuccess,
    chatCreateFailure,
} from '../slices/chatSlice';

/**
 * Manually fetches all chats for the logged-in user.
 */
export const asyncFetchUserChats = () => async (dispatch) => {
    dispatch(chatsFetchStart()); // Set status to 'loading'
    try {
        const response = await axios.get('/chats/getchats', {
            withCredentials: true,
        });
        dispatch(chatsFetchSuccess(response.data)); // On success, dispatch data
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        dispatch(chatsFetchFailure(errorMessage)); // On failure, dispatch error
    }
};

/**
 * Manually creates a new chat session.
 */
export const asyncCreateNewChat = (title) => async (dispatch) => {
    dispatch(chatCreateStart()); // Set status to 'loading'
    try {
        const response = await axios.post('/chats/createchat',
            { title: title },
            { withCredentials: true }
        );
        dispatch(chatCreateSuccess(response.data)); // On success, dispatch new chat
         return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        dispatch(chatCreateFailure(errorMessage)); // On failure, dispatch error
    }
};