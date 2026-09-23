import axios from "axios"; 

const CACHE_TTL_SECONDS = 24 * 60 * 60;

export const getMessages = async (conversationId) => {
  try {
    const { data } = await axios.get(
      `${process.env.CHAT_SERVICE}/get-messages/${conversationId}`
    );

    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return null;
  }
};