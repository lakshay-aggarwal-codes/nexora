import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log("userId", userId);
    const conversation = await Conversation.create({
      userId: userId,
    });
    return res.status(200).json(conversation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Create Conersation error ${error}` });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log("userId", userId);
    const conversation = await Conversation.find({
      userId: userId,
    }).sort({ updatedAt: -1 });
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: `Get Conersation error ${error}` });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const { id, title } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(id, {
      title,
    });
    return res.status(200).json(conversation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Update Conersation error ${error}` });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    await Conversation.findByIdAndDelete(id);
    await Message.deleteMany({ conversationId: id });
    return res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Delete Conversation error ${error}` });
  }
};

export const pinConversation = async (req, res) => {
  try {
    const { id, pinned } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { pinned },
      { new: true },
    );
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: `Pin Conversation error ${error}` });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content, images } = req.body;
    const message = await Message.create({
      conversationId,
      content,
      role,
      images
    });
    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json({ message: `Save message error ${error}` });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: `Get messages error ${error}` });
  }
};