import { Mic, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import sendMessage from "../features/sendMessage";

function ChatInput() {
  const [value, setValue] = useState("");

  const { selectedConversation } = useSelector(
    (state) => state.conversations
  );

  const handleSendMessage = async () => {
    const prompt = value.trim();

    if (!prompt) return;

    const payload = {
      prompt,
      conversationId: selectedConversation?._id,
    };

    try {
      const data = await sendMessage(payload);
      console.log(data);

      setValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/60 bg-[#0d0f14]">
      <div
        className="flex flex-col gap-2 bg-white/30 border border-white/60 rounded-2xl
        px-4 pt-3.5 pb-3"
      >
        <textarea
          onChange={(e) => setValue(e.target.value)}
          value={value}
          placeholder="Ask anything..."
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200
          placeholder:text-slate-600 leading-relaxed
          [&::-webkit-scrollbar]:hidden"
          rows={2}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600
              hover:text-slate-400 hover:bg-white/5 border border-transparent
              hover:border-white/6 transition-all duration-150
              bg-transparent cursor-pointer"
            >
              <Paperclip size={16} />
            </button>

            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600
              hover:text-slate-400 hover:bg-white/5 border border-transparent
              hover:border-white/6 transition-all duration-150
              bg-transparent cursor-pointer"
            >
              <Mic size={16} />
            </button>
          </div>

          <button
            type="button"
            disabled={!value.trim()}
            onClick={handleSendMessage}
            className={`flex items-center justify-center w-8 h-8 rounded-lg
            border-none transition-all
            ${
              value.trim()
                ? "bg-linear-to-br from-indigo-500 to-violet-700 text-white hover:opacity-90 cursor-pointer"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;