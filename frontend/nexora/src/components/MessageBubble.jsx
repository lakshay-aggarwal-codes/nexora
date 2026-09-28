import { FileCode2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { setArtifact } from "../redux/artifactSlice";
import MarkdownRenderer from "./MarkdownRenderer";

function MessageBubble({ role, content, artifact, images = [] }) {
  const isUser = role === "user";
  const [lightBox, setLightBox] = useState(null);
  const [failedImages, setFailedImages] = useState([]);
  const dispatch = useDispatch();

  const visibleImages = images.filter((img) => !failedImages.includes(img));

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
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
          {/* Images */}
          {visibleImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {visibleImages.map((img) => (
                <img
                  key={img}
                  src={img}
                  loading="lazy"
                  onClick={() => setLightBox(img)}
                  onError={() => setFailedImages((prev) => [...prev, img])}
                  className="aspect-square w-full cursor-pointer rounded-lg
                  border border-white/10 object-cover transition
                  hover:opacity-80"
                  alt=""
                />
              ))}
            </div>
          )}

          {/* Message content */}
          <div
            className={`rounded-2xl px-4 py-3 text-[15px] leading-7 ${
              isUser ? "bg-[#2f2f2f] text-slate-100" : "text-slate-200"
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap wrap-break-word">{content}</div>
            ) : (
              <MarkdownRenderer content={content} />
            )}

            {/* Artifact preview button */}
            {artifact && (
              <button
                type="button"
                onClick={() => dispatch(setArtifact(artifact))}
                className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg
                border border-white/10 bg-white/5 px-3 py-2 text-[12.5px]
                font-medium text-slate-200 transition hover:bg-white/10"
              >
                <FileCode2 size={14} />
                Preview {artifact.title || "artifact"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox (outside the bubble so it isn't affected by parent styles) */}
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
    </div>
  );
}

export default MessageBubble;