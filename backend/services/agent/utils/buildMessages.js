import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
 
export const buildMessages = ({ systemPrompt, history, prompt }) => {
  const past = Array.isArray(history) ? [...history] : [];
 
  const last = past[past.length - 1];
  if (last && last.role === "user" && last.content === prompt) past.pop();

  return [
    new SystemMessage(systemPrompt),
    ...past.map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
    ),
    new HumanMessage(prompt),
  ];
};
