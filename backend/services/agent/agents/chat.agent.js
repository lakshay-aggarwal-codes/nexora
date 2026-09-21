import { getModel } from "../config/llmModel";

export const chatAgent = async (state) => {
  const llm = await getModel("chat");
  const systemPrompt = "you are nexora, an intelligent ai assistant";
  const response = (await llm).invoke([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "human",
      content: state.prompt,
    },
  ]);
  return{
    ...state,
    aiResponse:(await response).content
  }
};
