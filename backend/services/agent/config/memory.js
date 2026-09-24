import redis from "../../../shared/redis/redis.js";
import { getMessages } from "../utils/getMessages.js";

const CACHE_TTL_SECONDS = 24 * 60 * 60;
const HISTORY_LIMIT = 20;
 
export const getMemory = async (conversationId) => {
  const key = `messages-${conversationId}`;
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const messages = await getMessages(conversationId); 
  if (messages === null) return [];

  const history = messages
    .slice(-HISTORY_LIMIT)
    .map((m) => ({ role: m.role, content: m.content }));
  await redis.set(key, JSON.stringify(history), "EX", CACHE_TTL_SECONDS);

  return history;
};

export const addMessage = async (conversationId, role, content) => {
  const key = `messages-${conversationId}`;
  const rawMessages = await redis.get(key);
  const messages = rawMessages ? JSON.parse(rawMessages) : [];
  messages.push({
    role,
    content,
  });
  while (messages.length > HISTORY_LIMIT) {
    messages.shift();
  }
  // Keep the TTL: a bare SET would drop it and the key would never expire.
  await redis.set(key, JSON.stringify(messages), "EX", CACHE_TTL_SECONDS);
};
