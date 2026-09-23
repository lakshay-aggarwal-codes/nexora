import { Mic, Paperclip, ArrowUp } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import sendMessage from "../features/sendMessage";

function ChatInput() {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { selectedConversation } = useSelector(
    (state) => state.conversations
  );

  const handleSendMessage = async () => {
    const prompt = value.trim();

    console.log("SEND FUNCTION CALLED");
    console.log("Prompt:", prompt);
    console.log("Selected conversation:", selectedConversation);

    if (!prompt) {
      console.log("No message to send");
      return;
    }

    const payload = {
      prompt,
      conversationId: selectedConversation?._id,
    };

    console.log("Payload:", payload);

    try {
      setIsSending(true);

      const data = await sendMessage(payload);

      console.log("Server response:", data);

      setValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    console.log("KEY:", e.key);

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