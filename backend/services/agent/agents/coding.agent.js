import { getModel } from "../config/llmModel.js";
 
const extractCodeBlock = (text) => {
  const match = text.match(/```(\w+)?\n([\s\S]*?)```/);
  if (!match) return null;

  return {
    type: "code",
    language: match[1] || "text",
    title: "Generated code",
    content: match[2].trim(),
  };
};

export const codingAgent = async (state) => {
  const llm = await getModel("coding");

  const systemPrompt =
    "You are nexora's coding assistant. When you produce code, put it in " +
    "a single fenced code block with the language name right after the " +
    "opening backticks (e.g. ```javascript). Briefly explain the code " +
    "outside the block.";

  const response = await llm.invoke([
    { role: "system", content: systemPrompt },
    { role: "human", content: state.prompt },
  ]);

  const artifact = extractCodeBlock(response.content);

  return {
    ...state,
    aiResponse: response.content,
    artifact,
  };
};