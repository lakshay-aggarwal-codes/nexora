import {
  Mic,
  Paperclip,
  ArrowUp,
  Square,
  Zap,
  MessageSquare,
  Code2,
  FileText,
  Presentation,
  Globe,
  ImageIcon,
} from "lucide-react";
import { useState } from "react";
import useSendMessage from "../hooks/useSendMessage";
import useSpeechToText from "../hooks/useSpeechToText";

function ChatInput() {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Auto");
  const { sendPrompt, isSending } = useSendMessage();
  const { isListening, isSupported, startListening, stopListening } =
    useSpeechToText({ onResult: setValue });

  const handleSendMessage = async () => {
    const prompt = value.trim();
    if (!prompt || isSending) return;
    if (isListening) stopListening();
    setValue("");
    await sendPrompt(prompt, { agent: selectedAgent.toLowerCase() });
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

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },
    {
      id: "coding",
      icon: Code2,
      label: "coding",
    },
    {
      id: "pdf",
      icon: FileText,
      label: "PDF",
    },
    {
      id: "ppt",
      icon: Presentation,
      label: "PPT",
    },
    {
      id: "image",
      icon: ImageIcon,
      label: "Image",
    },
    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
  ];

  return (
    <div className="shrink-0 bg-[#212121] px-3 pb-5 pt-3 sm:px-4">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-white/10 bg-[#2f2f2f]">
          <div className="flex w-[80%] gap-2 pr-2 flex-wrap">
            {agents.map((agent) => {
              const isActive = selectedAgent === agent.label;
              const Icon = agent.icon;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.label)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border
        px-3 py-1 text-xs font-medium capitalize transition select-none ${
          isActive
            ? "border-blue-500/60 bg-blue-500/20 text-blue-300"
            : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
        }`}
                >
                  <Icon size={14} />
                  {agent.label}
                </div>
              );
            })}
          </div>
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
