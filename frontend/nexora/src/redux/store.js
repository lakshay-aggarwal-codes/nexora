import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import conversationReducer from "./conversationSlice";
import messaggeReducer from "./messageSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    conversations: conversationReducer,
    message: messaggeReducer
  },
});
