import { Mic, Paperclip, ArrowUp } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import sendMessage from "../features/sendMessage";
import { createConversation } from "../features/createConversation";
import {
  addConversation,
  renameConversationInStore,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { addMessage, updateLastMessage } from "../redux/messageSlice";

function ChatInput() {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const dispatch = useDispatch();

  const { selectedConversation } = useSelector(
    (state) => state.conversations
  );

  const handleSendMessage = async () => {
    const prompt = value.trim();

    if (!prompt || isSending) {
      return;
    }

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
        })
      );
      setValue("");
 
      dispatch(
        addMessage({
          role: "assistant",
          content: "Thinking...",
          _id: `local-pending-${Date.now()}`,
          pending: true,
        })
      ); 
      const needsTitle =
        !conversation.title || conversation.title === "New Chat";

      const payload = {
        prompt,
        conversationId: conversation._id,
        generateTitle: needsTitle,
      };

      const data = await sendMessage(payload);
 
      dispatch(
        updateLastMessage({
          content: typeof data === "string" ? data : data?.content ?? data,
          pending: false,
        })
      );
      
      if (data?.title) {
        dispatch(
          renameConversationInStore({
            id: conversation._id,
            title: data.title,
          })
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      dispatch(
        updateLastMessage({
          content: "Something went wrong. Please try again.",
          pending: false,
          error: true,
        })
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="shrink-0 bg-[#212121] px-3 pb-5 pt-3 sm:px-4">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-white/10 bg-[#2f2f2f]">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Nexora..."
            rows={1}
            disabled={isSending}
            className="max-h-48 min-h-13 w-full resize-none bg-transparent
            px-4 pt-4 text-[15px] leading-6 text-white outline-none
            placeholder:text-slate-500 disabled:opacity-60"
          />

          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg
                text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <Paperclip size={17} />
              </button>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg
                text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <Mic size={17} />
              </button>
            </div>

            <button
              type="button"
              disabled={!value.trim() || isSending}
              onClick={handleSendMessage}
              className={`flex h-8 w-8 items-center justify-center rounded-full
              transition ${
                value.trim() && !isSending
                  ? "bg-white text-black hover:bg-slate-200 cursor-pointer"
                  : "bg-white/10 text-slate-600 cursor-not-allowed"
              }`}
            >
              <ArrowUp size={17} />
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] text-slate-600">
          Nexora can make mistakes. Check important information.
        </p>
      </div>
    </div>
  );
}

export default ChatInput;