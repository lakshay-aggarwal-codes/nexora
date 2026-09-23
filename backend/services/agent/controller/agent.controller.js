import axios from "axios";
import { graph } from "../graph/graph.js";
import { generateTitle } from "../utils/generateTitle.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, generateTitle: shouldGenerateTitle } =
      req.body;
 
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

    const [, result, title] = await Promise.all(tasks);

    const aiResponse = result.aiResponse;

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: aiResponse,
    });

    if (shouldGenerateTitle && title) {
      // Fire-and-forget: don't make the user wait on this write.
      axios
        .post(`${process.env.CHAT_SERVICE}/update-conversation`, {
          id: conversationId,
          title,
        })
        .catch((err) =>
          console.error("Failed to persist generated title:", err.message),
        );
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