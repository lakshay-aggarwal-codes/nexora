import { useState } from "react";
import { Copy, Check, RotateCcw, Share2 } from "lucide-react";

function MessageActions({ content, onRetry, showRetry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: content || "" });
      } else {
        await navigator.clipboard.writeText(content || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (error) {
      console.error("Failed to share message:", error);
    }
  };

  return (
    <div className="mt-1 flex items-center gap-1 text-slate-500">
      <button
        type="button"
        onClick={handleCopy}
        title="Copy"
        className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-white/10 hover:text-white cursor-pointer"
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>

      <button
        type="button"
        onClick={handleShare}
        title="Share"
        className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-white/10 hover:text-white cursor-pointer"
      >
        <Share2 size={15} />
      </button>

      {showRetry && (
        <button
          type="button"
          onClick={onRetry}
          title="Try again"
          className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <RotateCcw size={15} />
        </button>
      )}
    </div>
  );
}

export default MessageActions;