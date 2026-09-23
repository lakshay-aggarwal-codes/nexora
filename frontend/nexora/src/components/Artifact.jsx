import { FileX2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { closeArtifact } from "../redux/artifactSlice";

function Artifact() {
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.artifact);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-l border-white/10 bg-[#181818] text-white">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 px-4">
        <span className="truncate text-sm font-medium text-slate-200">
          {current?.title || "Artifact"}
        </span>

        <button
          type="button"
          onClick={() => dispatch(closeArtifact())}
          className="flex h-8 w-8 items-center justify-center rounded-lg
          text-slate-400 transition hover:bg-white/5 hover:text-white
          cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-auto [&::-webkit-scrollbar]:hidden">
        {!current ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <FileX2 size={28} className="text-slate-600" />
            <p className="text-sm text-slate-500">
              No file to show yet. Ask Nexora to write code or generate a
              document, and a preview will appear here.
            </p>
          </div>
        ) : current.type === "code" ? (
          <div className="p-4">
            {current.language && (
              <div className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">
                {current.language}
              </div>
            )}
            <pre className="overflow-x-auto rounded-xl bg-black/40 p-4 text-[13px] leading-6 text-slate-200 [&::-webkit-scrollbar]:hidden">
              <code>{current.content}</code>
            </pre>
          </div>
        ) : (
          <div className="whitespace-pre-wrap p-4 text-sm text-slate-300">
            {current.content}
          </div>
        )}
      </div>
    </div>
  );
}

export default Artifact;