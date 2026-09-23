import { FileCode2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setArtifact } from "../redux/artifactSlice";

function MessageBubble({ role, content, artifact }) {
  const isUser = role === "user";
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
  );
}

export default MessageBubble;