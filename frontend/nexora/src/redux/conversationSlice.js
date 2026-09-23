import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",

  initialState: {
    conversations: [],
    selectedConversation: null,
  },

  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },

    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },

    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },

    removeConversation: (state, action) => {
      const id = action.payload;
      state.conversations = state.conversations.filter((c) => c._id !== id);
      if (state.selectedConversation?._id === id) {
        state.selectedConversation = null;
      }
    },

    renameConversationInStore: (state, action) => {
      const { id, title } = action.payload;
      const conv = state.conversations.find((c) => c._id === id);
      if (conv) conv.title = title;
      if (state.selectedConversation?._id === id) {
        state.selectedConversation.title = title;
      }
    },

    setConversationPinned: (state, action) => {
      const { id, pinned } = action.payload;
      const conv = state.conversations.find((c) => c._id === id);
      if (conv) conv.pinned = pinned;
      if (state.selectedConversation?._id === id) {
        state.selectedConversation.pinned = pinned;
      }
    },

    setConvTitle: (state, action) => {
      const { title, conversationId } = action.payload;
      state.conversations = state.conversations.map((conv) =>
        conv._id == conversationId ? { ...conv, title } : conv,
      );
      if(state.selectedConversation?._id == conversationId){
        state.selectedConversation = {...state.selectedConversation, title}
      }
    },
  },
});

export const {
  setConversations,
  addConversation,
  setSelectedConversation,
  removeConversation,
  renameConversationInStore,
  setConversationPinned,
  setConvTitle
} = conversationSlice.actions;

export default conversationSlice.reducer;
