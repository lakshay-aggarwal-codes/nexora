 
export const pptAgent = async (state) => {
  return {
    ...state,
    aiResponse:
      "PowerPoint generation isn't wired up yet on my end, so I can't " +
      "produce a file for that right now. I can still draft the slide " +
      "content in plain text if that's useful.",
    artifact: null,
  };
};