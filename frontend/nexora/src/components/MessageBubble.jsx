function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {content}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center
          rounded-full text-xs font-semibold ${
            isUser
              ? "bg-white/10 text-white"
              : "bg-indigo-500/15 text-indigo-300"
          }`}
        >
          {isUser ? "You" : "N"}
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-[14px] leading-7 ${
            isUser
              ? "bg-[#2f2f2f] text-slate-100"
              : "text-slate-200"
          }`}
        >
          <div className="whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;