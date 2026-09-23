import { MessageSquare, MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";

function Nav() {
  const { selectedConversation } = useSelector(
    (state) => state.conversations
  );

  const { messages = [] } = useSelector((state) => state.message);

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
        className="flex h-8 w-8 items-center justify-center rounded-lg
        text-slate-400 transition hover:bg-white/5 hover:text-white
        cursor-pointer"
      >
        <MoreHorizontal size={18} />
      </button>
    </header>
  );
}

export default Nav;