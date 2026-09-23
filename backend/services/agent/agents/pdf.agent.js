 
export const pdfAgent = async (state) => {
  return {
    ...state,
    aiResponse:
      "PDF generation isn't wired up yet on my end, so I can't produce a " +
      "file for that right now. I can still help with the content in " +
      "plain text if that's useful.",
    artifact: null,
  };
};