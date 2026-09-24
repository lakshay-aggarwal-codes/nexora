import { getModel } from "../config/llmModel.js";

export const router = async (state) => {
  if (state.agent && state.agent !== "auto") {
    return {
      ...state,
      agent: state.agent,
    };
  }
  const llm = await getModel("router");
  const prompt = `You are an agent router.
   Available agents:
   - chat
   - search
   - coding
   - pdf 
   - ppt 
   - image

   Rules:
   chat:
   General conversation,
   explainations,
   learning,
   questions.

   search:
   Current events,
   latest information,
   news,
   recent develoopments,
   internet lookup.

   coding:
   Generate code,
   debug code,
   build projects,
   architecture,
   API design.

   pdf:
   Questions about generate PDFs or document context.

   ppt:
   Questions about generate PPTs or ppt context.   

   vision:
    Generate image,
    create image

   Return only one word:
   chat
   search
   coding
   pdf 
   ppt
   vision

   User Query:
    ${state.prompt}
   `;
  const response = (await llm).invoke(prompt);
  return {
    ...state,
    agent: (await response).content.trim().toLowerCase(),
  };
};
