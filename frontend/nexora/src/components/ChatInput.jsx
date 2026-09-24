import { Mic, Paperclip, ArrowUp, Square } from "lucide-react";
import { useState } from "react";
import useSendMessage from "../hooks/useSendMessage";
import useSpeechToText from "../hooks/useSpeechToText";

function ChatInput() {
  const [value, setValue] = useState("");
  const { sendPrompt, isSending } = useSendMessage();
  const { isListening, isSupported, startListening, stopListening } =
    useSpeechToText({ onResult: setValue });

  // useSendMessage already does everything: creates the conversation if there
  // isn't one, asks the backend for a title, calls /api/agent/chat once, and
  // updates the UI. Don't duplicate any of that here.
  const handleSendMessage = async () => {
    const prompt = value.trim();
    if (!prompt || isSending) return;
    if (isListening) stopListening();
    setValue("");
    await sendPrompt(prompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(value);
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
            placeholder={isListening ? "Listening..." : "Message Nexora..."}
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

              {isSupported && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  title={isListening ? "Stop listening" : "Speak"}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg
                  transition cursor-pointer ${
                    isListening
                      ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {isListening ? (
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/40" />
                      <Square size={13} className="relative fill-current" />
                    </span>
                  ) : (
                    <Mic size={17} />
                  )}
                </button>
              )}
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
