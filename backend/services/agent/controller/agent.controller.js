import axios from "axios";
import { graph } from "../graph/graph.js";
import { generateTitle } from "../utils/generateTitle.js";
import { addMessage, getMemory } from "../config/memory.js";
import {
  buildMemoryPrompt,
  loadUserMemory,
  updateMemoryFromTurn,
} from "../memory/index.js";

export const agent = async (req, res) => {
  try {
    const {
      prompt,
      conversationId,
      agent,
      generateTitle: shouldGenerateTitle,
    } = req.body;
 
    const userId = req.headers["x-user-id"];
 
    const [history, memory] = await Promise.all([
      getMemory(conversationId),
      loadUserMemory(userId),  
    ]);

    const tasks = [
      axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
        conversationId,
        role: "user",
        content: prompt,
      }),

      graph.invoke({
        prompt,
        conversationId,
        agent,
        userId,
        history,
        memoryContext: buildMemoryPrompt(memory),
      }),
    ];

    if (shouldGenerateTitle) {
      tasks.push(generateTitle(prompt));
    }

    const results = await Promise.all(tasks);

    const chatSaveResult = results[0];
    const graphResult = results[1];
    const title = shouldGenerateTitle ? results[2] : undefined;

    const aiResponse = graphResult.aiResponse;
 
    await addMessage(conversationId, "user", prompt);
 
    await addMessage(conversationId, "assistant", aiResponse);
 
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: aiResponse,
      images:results.images
    });
 
    if (shouldGenerateTitle && title) {
      await axios
        .post(`${process.env.CHAT_SERVICE}/update-conversation`, {
          id: conversationId,
          title,
        })
        .catch((err) => {
          console.error(
            "Failed to persist generated title:",
            err.message
          );
        });
    }

    res.status(200).json({
      content: aiResponse,
      title: shouldGenerateTitle ? title : undefined,
      images : results.images
    });
 
    void updateMemoryFromTurn({
      userId,
      conversationId,
      history,
      prompt,
      aiResponse,
    });
    return;
  } catch (error) {
    console.error("Agent error:", error);

    return res.status(500).json({
      message: `Agent error: ${error.message}`,
    });
  }
};