import { MessageSquare, PanelRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleArtifact } from "../redux/artifactSlice";

function Nav() {
  const { selectedConversation } = useSelector(
    (state) => state.conversations
  );

  const { messages = [] } = useSelector((state) => state.message);
  const { isOpen: isArtifactOpen } = useSelector((state) => state.artifact);
  const dispatch = useDispatch();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-[#212121] px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        {selectedConversation && (
          <>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
              <MessageSquare size={15} className="text-slate-400" />
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-100">
                {selectedConversation.title || "New Chat"}
              </div>

              {messages.length > 0 && (
                <div className="text-[11px] text-slate-500">
                  {messages.length} messages
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => dispatch(toggleArtifact())}
        title={isArtifactOpen ? "Hide artifact panel" : "Show artifact panel"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg
        transition cursor-pointer ${
          isArtifactOpen
            ? "bg-white/10 text-white"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <PanelRight size={17} />
      </button>
    </header>
  );
}

export default Nav;