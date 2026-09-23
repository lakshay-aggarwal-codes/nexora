import express from "express";
import {
  createConversation,
  deleteConversation,
  getConversations,
  getMessages,
  pinConversation,
  saveMessage,
  updateConversation,
} from "../controllers/chat.controllers.js";

const router = express.Router();
router.get("/create-conversation", createConversation);
router.get("/get-conversations", getConversations);
router.post("/save-message", saveMessage);
router.get("/get-messages/:conversationId", getMessages);
router.post("/update-conversation", updateConversation);
router.delete("/delete-conversation/:id", deleteConversation);
router.post("/pin-conversation", pinConversation);
export default router;