import axios from "axios";
import { graph } from "../graph/graph.js";
import { generateTitle } from "../utils/generateTitle.js";
import { addMessage } from "../config/memory.js";

export const agent = async (req, res) => {
  try {
    const {
      prompt,
      conversationId,
      generateTitle: shouldGenerateTitle,
    } = req.body;

    const tasks = [
      axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
        conversationId,
        role: "user",
        content: prompt,
      }),

      graph.invoke({
        prompt,
        conversationId,
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

    // Save user message to memory
    await addMessage(conversationId, "user", prompt);

    // Save assistant message to memory
    await addMessage(conversationId, "assistant", aiResponse);

    // Save assistant message to chat service
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: aiResponse,
    });

    // Update conversation title
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

    return res.status(200).json({
      content: aiResponse,
      title: shouldGenerateTitle ? title : undefined,
    });
  } catch (error) {
    console.error("Agent error:", error);

    return res.status(500).json({
      message: `Agent error: ${error.message}`,
    });
  }
};