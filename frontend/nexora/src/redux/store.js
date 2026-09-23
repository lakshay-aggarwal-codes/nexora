import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import conversationReducer from "./conversationSlice";
import messaggeReducer from "./messageSlice";
import artifactReducer from "./artifactSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    conversations: conversationReducer,
    message: messaggeReducer,
    artifact: artifactReducer,
  },
});