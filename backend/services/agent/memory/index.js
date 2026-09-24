import { getModel } from "../config/llmModel.js";
import { extractOperations } from "./extractor.js";
import { shouldAttemptExtraction } from "./guards.js";
import { applyOperations, isValidUserId, loadUserMemory } from "./store.js";

export { loadUserMemory } from "./store.js";
export { buildMemoryPrompt } from "./context.js";
 
export const updateMemoryFromTurn = async (
  { userId, conversationId, history, prompt, aiResponse },
  deps = {},
) => {
  try {
    if (!isValidUserId(userId)) return null;
    if (!shouldAttemptExtraction(prompt)) return null;
 
    const memory = await loadUserMemory(userId);
    if (memory.state !== "on") return null;

    const llm = deps.llm ?? (await getModel("memory"));
    const ops = await extractOperations(
      { existing: memory.items, history, prompt, aiResponse },
      llm,
    );
    if (!ops.length) return { added: 0, updated: 0, deleted: 0 };

    const stats = await applyOperations(userId, ops, { conversationId });
    console.log(
      `[memory] user=${userId} +${stats.added} ~${stats.updated} -${stats.deleted}`,
    );
    return stats;
  } catch (err) {
    console.error("[memory] update failed:", err.message);
    return null;
  }
};
