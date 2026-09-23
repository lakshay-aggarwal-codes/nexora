 
export const imageGenAgent = async (state) => {
  return {
    ...state,
    aiResponse:
      "Image generation isn't wired up yet on my end, so I can't create " +
      "an image for that right now.",
    artifact: null,
  };
};