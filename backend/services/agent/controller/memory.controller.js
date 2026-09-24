import {
  clearMemories,
  deleteMemory,
  getMemoryEnabled,
  isValidUserId,
  listMemories,
  setMemoryEnabled,
} from "../memory/store.js";

const requireUser = (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!isValidUserId(userId)) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return userId;
};

export const getMemories = async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const [memories, enabled] = await Promise.all([
      listMemories(userId),
      getMemoryEnabled(userId),
    ]);
    return res.status(200).json({ enabled, memories });
  } catch (error) {
    return res.status(500).json({ message: `Get memories error: ${error.message}` });
  }
};

export const removeMemory = async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const deleted = await deleteMemory(userId, req.params.id);
    if (!deleted) return res.status(404).json({ message: "Memory not found" });
    return res.status(200).json({ message: "Memory deleted" });
  } catch (error) {
    return res.status(500).json({ message: `Delete memory error: ${error.message}` });
  }
};

export const removeAllMemories = async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const deleted = await clearMemories(userId);
    return res.status(200).json({ message: "All memories deleted", deleted });
  } catch (error) {
    return res.status(500).json({ message: `Clear memories error: ${error.message}` });
  }
};

export const updateMemorySettings = async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const { enabled } = req.body ?? {};
  if (typeof enabled !== "boolean") {
    return res.status(400).json({ message: "`enabled` must be true or false" });
  }
  try {
    await setMemoryEnabled(userId, enabled);
    return res.status(200).json({ enabled });
  } catch (error) {
    return res.status(500).json({ message: `Update memory settings error: ${error.message}` });
  }
};
