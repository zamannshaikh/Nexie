import axios from "../../api/axiosconfig";
import {
  messagesFetchStart,
  messagesFetchSuccess,
  messagesFetchFailure,
  messageAdd,
} from "../slices/messageSlice";

// ✅ Fetch all messages of a specific chat
export const asyncFetchMessages = (chatId) => async (dispatch) => {
  try {
    dispatch(messagesFetchStart());
    console.log("Fetching messages for chat:", chatId);

    const response = await axios.get(`/chats/messages/${chatId}`, {
      withCredentials: true,
    });
    console.log("Response from backend:", response.data);

// ✅ Make sure we always use the array
const rawMessages = Array.isArray(response.data)
  ? response.data
  : response.data.messages || []; // if wrapped in object

    // ✅ Normalize backend response -> frontend format
    const normalizedMessages = rawMessages.map((msg) => ({
      _id: msg._id,
      sender: msg.role,   // role → sender
      text: msg.content,  // content → text
      createdAt: msg.createdAt, // optional: keep timestamp
    }));

    dispatch(messagesFetchSuccess({ chatId, messages: normalizedMessages }));
  } catch (error) {
    console.error("Error fetching messages:", error);
    dispatch(messagesFetchFailure(error.message));
  }
};

// ✅ Add new message (user send or socket receive)
export const asyncAddMessage = (chatId, message) => (dispatch) => {
  // ensure message matches the normalized shape
  const normalizedMessage = {
    _id: message._id || Date.now().toString(), // fallback id
    sender: message.sender,
    text: message.text,
    createdAt: message.createdAt || new Date().toISOString(),
  };

  dispatch(messageAdd({ chatId, message: normalizedMessage }));
};
