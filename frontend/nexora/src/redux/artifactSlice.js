import { createSlice } from "@reduxjs/toolkit";

const artifactSlice = createSlice({
  name: "artifact",

  initialState: {
    isOpen: true,
    current: null,  
  },

  reducers: {
    toggleArtifact: (state) => {
      state.isOpen = !state.isOpen;
    },

    openArtifact: (state) => {
      state.isOpen = true;
    },

    closeArtifact: (state) => {
      state.isOpen = false;
    },

    setArtifact: (state, action) => {
      state.current = action.payload;
      if (action.payload) {
        state.isOpen = true;
      }
    },
  },
});

export const { toggleArtifact, openArtifact, closeArtifact, setArtifact } =
  artifactSlice.actions;

export default artifactSlice.reducer;