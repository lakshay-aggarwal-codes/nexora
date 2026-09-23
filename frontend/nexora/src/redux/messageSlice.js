import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",

  initialState: {
    messages: [],
  },

  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
 
    updateLastMessage: (state, action) => {
      if (state.messages.length > 0) {
        state.messages[state.messages.length - 1] = {
          ...state.messages[state.messages.length - 1],
          ...action.payload,
        };
      }
    },
  },
});

export const { setMessages, addMessage, updateLastMessage } =
  messageSlice.actions;

export default messageSlice.reducer;
