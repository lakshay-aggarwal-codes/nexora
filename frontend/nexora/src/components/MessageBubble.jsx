import { FileCode2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { setArtifact } from "../redux/artifactSlice";
import { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

function MessageBubble({ role, content, artifact, images }) {
  const isUser = role === "user";
  const [lightBox, setLightBox] = useState(null);
  const dispatch = useDispatch();

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
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

        <div className="flex min-w-0 flex-col gap-2">
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                loading="lazy"
                onClick={() => setLightBox(img)}
                onError={(e) => e.currentTarget.closest("div").remove()}
                className="aspect-square w-full cursor-pointer rounded-lg
                border border-white/10 object-cover transition
                hover:opacity-80"
                alt=""
              />
            ))}
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-[14px] leading-7 ${
            isUser ? "bg-[#2f2f2f] text-slate-100" : "text-slate-200"
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            <MarkdownRenderer content={content} />
          )}

          {lightBox && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center
              bg-black/80 p-6"
              onClick={() => setLightBox(null)}
            >
              <button
                type="button"
                onClick={() => setLightBox(null)}
                className="absolute right-5 top-5 rounded-full bg-white/10 p-2
                text-white transition hover:bg-white/20"
              >
                <X size={20} />
              </button>
              <img
                src={lightBox}
                alt=""
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {artifact && (
            <button
              type="button"
              onClick={() => dispatch(setArtifact(artifact))}
              className="mt-3 flex items-center gap-2 rounded-lg border
              border-white/10 bg-white/5 px-3 py-2 text-[12.5px]
              font-medium text-slate-200 transition hover:bg-white/10
              cursor-pointer"
            >
              <FileCode2 size={14} />
              Preview {artifact.title || "artifact"}
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
