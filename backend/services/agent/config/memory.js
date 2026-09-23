import redis from "../../../shared/redis/redis.js";
import { getMessages } from "../utils/getMessages.js";

const CACHE_TTL_SECONDS = 24 * 60 * 60;

export const getMemory = async (conversationId) => {
  const key = `messages-${conversationId}`;
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const messages = await getMessages(conversationId);
  await redis.set(
    key,
    JSON.stringify(messages || []),
    "EX",
    CACHE_TTL_SECONDS
  );

  return messages;
};

export const addMessage = async (conversationId, role, content) => {
  const key = `messages-${conversationId}`;
  const rawMessages = await redis.get(key);
  const messages = rawMessages ? JSON.parse(rawMessages) : [];
  messages.push({
    role,
    content,
  });
  if(messages.length>20){
    messages.shift()
  }
  await redis.set(key, JSON.stringify(messages))
};
