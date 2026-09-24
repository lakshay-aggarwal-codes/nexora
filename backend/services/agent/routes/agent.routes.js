import express from "express";
import { agent } from "../controller/agent.controller.js";
import {
  getMemories,
  removeAllMemories,
  removeMemory,
  updateMemorySettings,
} from "../controller/memory.controller.js";

const router = express.Router();

router.post('/chat',agent)
 
router.get("/memories", getMemories);
router.delete("/memories", removeAllMemories);
router.delete("/memories/:id", removeMemory);
router.put("/memory-settings", updateMemorySettings);

export default router
