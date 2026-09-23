import MarkdownRenderer from "./MarkdownRenderer";
import MessageActions from "./MessageActions";

function MessageBubble({ role, content, pending, error, showRetry, onRetry }) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center
          rounded-full text-xs font-semibold ${
            isUser ? "bg-white/10 text-white" : "bg-indigo-500/15 text-indigo-300"
          }`}
        >
          {isUser ? "You" : "N"}
        </div>

        <div className="flex min-w-0 flex-col">
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser ? "bg-[#2f2f2f] text-slate-100" : "text-slate-200"
            } ${error ? "border border-red-500/30" : ""}`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap text-[15px] leading-7">{content}</div>
            ) : pending ? (
              <div className="flex items-center gap-1 py-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              </div>
            ) : (
              <MarkdownRenderer content={content} />
            )}
          </div>

          {!isUser && !pending && (
            <MessageActions content={content} onRetry={onRetry} showRetry={showRetry} />
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;