import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import sendMessageApi from "../features/sendMessage";
import { createConversation } from "../features/createConversation";
import {
  addConversation,
  renameConversationInStore,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { addMessage, updateLastMessage } from "../redux/messageSlice";
function extractContent(data) {
  if (typeof data === "string") return data;
  if (data == null) return "";
  if (typeof data.content === "string") return data.content;
  if (typeof data.message === "string") return data.message;
  if (typeof data.content?.text === "string") return data.content.text;
  if (typeof data.text === "string") return data.text;
  return JSON.stringify(data);
}
function useSendMessage() {
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversations);

  const sendPrompt = async (prompt) => {
    if (!prompt?.trim() || isSending) return;

    try {
      setIsSending(true);

      let conversation = selectedConversation;
      if (!conversation?._id) {
        conversation = await createConversation();
        dispatch(addConversation(conversation));
        dispatch(setSelectedConversation(conversation));
      }

      dispatch(
        addMessage({
          role: "user",
          content: prompt,
          _id: `local-${Date.now()}`,
        }),
      );

      dispatch(
        addMessage({
          role: "assistant",
          content: "Thinking...",
          _id: `local-pending-${Date.now()}`,
          pending: true,
        }),
      );

      const needsTitle =
        !conversation.title || conversation.title === "New Chat";

      const data = await sendMessageApi({
        prompt,
        conversationId: conversation._id,
        generateTitle: needsTitle,
      });

      dispatch(
        updateLastMessage({
          content: extractContent(data),
          pending: false,
        }),
      );

      if (data?.title) {
        dispatch(
          renameConversationInStore({
            id: conversation._id,
            title: data.title,
          }),
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      dispatch(
        updateLastMessage({
          content: "Something went wrong. Please try again.",
          pending: false,
          error: true,
        }),
      );
    } finally {
      setIsSending(false);
    }
  };

  const retryLast = async (prompt) => {
    if (!prompt?.trim() || isSending) return;

    try {
      setIsSending(true);
      dispatch(
        updateLastMessage({
          content: "Thinking...",
          pending: true,
          error: false,
        }),
      );

      const data = await sendMessageApi({
        prompt,
        conversationId: selectedConversation?._id,
        generateTitle: false,
      });

      dispatch(
        updateLastMessage({
          content: extractContent(data),
          pending: false,
        }),
      );
    } catch (error) {
      console.error("Failed to retry message:", error);
      dispatch(
        updateLastMessage({
          content: "Something went wrong. Please try again.",
          pending: false,
          error: true,
        }),
      );
    } finally {
      setIsSending(false);
    }
  };

  return { sendPrompt, retryLast, isSending };
}

export default useSendMessage;
