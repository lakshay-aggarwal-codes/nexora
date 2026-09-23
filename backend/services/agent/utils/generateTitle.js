import { getModel } from "../config/llmModel.js";

export const generateTitle = async (prompt) => {
  const llm = await getModel("chat");

  const response = await llm.invoke([
    {
      role: "system",
      content:
        "You generate short chat titles, like ChatGPT does. Reply with " +
        "ONLY a concise 3-6 word title that summarizes the user's message. " +
        "No quotes, no trailing punctuation, no prefix like 'Title:'.",
    },
    {
      role: "human",
      content: prompt,
    },
  ]);

  return response.content.trim().replace(/^["']|["']$/g, "");
};