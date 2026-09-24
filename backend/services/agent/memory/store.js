import mongoose from "mongoose";
import redis from "../../../shared/redis/redis.js";
import { Memory, MemorySetting } from "../models/memory.model.js";
import { normalizeForCompare } from "./guards.js";
import { MAX_MEMORIES_PER_USER, MEMORY_CACHE_TTL_SECONDS } from "./config.js";

const cacheKey = (userId) => `user-memory-${userId}`;

export const isValidUserId = (userId) =>
  typeof userId === "string" &&
  userId.length > 0 &&
  userId !== "undefined" &&
  userId !== "null";

const invalidateCache = async (userId) => {
  try {
    await redis.del(cacheKey(userId));
  } catch (err) {
    console.error("Memory cache invalidate failed:", err.message);
  }
}; 
export const loadUserMemory = async (userId) => {
  if (!isValidUserId(userId)) return { state: "unavailable", items: [] };

  try {
    const cached = await redis.get(cacheKey(userId));
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error("Memory cache read failed:", err.message);
  }

  try {
    const setting = await MemorySetting.findOne({ userId }).lean();
    const enabled = setting ? setting.enabled !== false : true;

    let items = [];
    if (enabled) {
      const docs = await Memory.find({ userId })
        .sort({ importance: -1, updatedAt: -1 })
        .limit(MAX_MEMORIES_PER_USER)
        .select("content category importance")
        .lean();
      items = docs.map((d) => ({
        id: String(d._id),
        content: d.content,
        category: d.category,
        importance: d.importance,
      }));
    }

    const result = { state: enabled ? "on" : "off", items };
    try {
      await redis.set(
        cacheKey(userId),
        JSON.stringify(result),
        "EX",
        MEMORY_CACHE_TTL_SECONDS,
      );
    } catch (err) {
      console.error("Memory cache write failed:", err.message);
    }
    return result;
  } catch (err) {
    console.error("Load user memory failed:", err.message);
    return { state: "unavailable", items: [] };
  }
};

const pruneOverflow = async (userId) => {
  const count = await Memory.countDocuments({ userId });
  if (count <= MAX_MEMORIES_PER_USER) return 0;
  const overflow = await Memory.find({ userId })
    .sort({ importance: 1, updatedAt: 1 })  
    .limit(count - MAX_MEMORIES_PER_USER)
    .select("_id")
    .lean();
  const res = await Memory.deleteMany({
    _id: { $in: overflow.map((o) => o._id) },
    userId,
  });
  return res.deletedCount || 0;
};
 
export const applyOperations = async (userId, ops, { conversationId } = {}) => {
  const stats = { added: 0, updated: 0, deleted: 0, skippedDuplicates: 0 };
  if (!isValidUserId(userId) || !ops?.length) return stats;

  const existing = await Memory.find({ userId }).select("content").lean();
  const seen = new Set(existing.map((m) => normalizeForCompare(m.content)));
  const source = conversationId ? String(conversationId) : undefined;

  for (const op of ops) {
    if (op.op === "add") {
      const norm = normalizeForCompare(op.content);
      if (seen.has(norm)) {
        stats.skippedDuplicates++;
        continue;
      }
      await Memory.create({
        userId,
        content: op.content,
        category: op.category,
        importance: op.importance,
        sourceConversationId: source,
      });
      seen.add(norm);
      stats.added++;
    } else if (op.op === "update") {
      const res = await Memory.updateOne(
        { _id: op.id, userId },
        {
          $set: {
            content: op.content,
            category: op.category,
            importance: op.importance,
            sourceConversationId: source,
          },
        },
      );
      if (res.matchedCount) {
        seen.add(normalizeForCompare(op.content));
        stats.updated++;
      }
    } else if (op.op === "delete") {
      const res = await Memory.deleteOne({ _id: op.id, userId });
      stats.deleted += res.deletedCount || 0;
    }
  }

  await pruneOverflow(userId);
  await invalidateCache(userId);
  return stats;
};
 

export const listMemories = async (userId) => {
  const docs = await Memory.find({ userId })
    .sort({ importance: -1, updatedAt: -1 })
    .limit(MAX_MEMORIES_PER_USER)
    .lean();
  return docs.map((d) => ({
    id: String(d._id),
    content: d.content,
    category: d.category,
    importance: d.importance,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));
};

export const deleteMemory = async (userId, id) => {
  if (!mongoose.isValidObjectId(id)) return false;
  const res = await Memory.deleteOne({ _id: id, userId });
  await invalidateCache(userId);
  return (res.deletedCount || 0) > 0;
};

export const clearMemories = async (userId) => {
  const res = await Memory.deleteMany({ userId });
  await invalidateCache(userId);
  return res.deletedCount || 0;
};

export const getMemoryEnabled = async (userId) => {
  const setting = await MemorySetting.findOne({ userId }).lean();
  return setting ? setting.enabled !== false : true;
};

export const setMemoryEnabled = async (userId, enabled) => {
  await MemorySetting.updateOne(
    { userId },
    { $set: { enabled: !!enabled } },
    { upsert: true },
  );
  await invalidateCache(userId);
  return !!enabled;
};
