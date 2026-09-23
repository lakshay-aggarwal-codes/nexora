import { MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";

function Nav() {
  const { selectedConversation } = useSelector((state) => state.conversations);
  const { messages } = useSelector((state) => state.message);
  return (
<> 
    {selectedConversation && 
    <div className="h-14 flex items-center gap-2.5 px-5 border-b border-white/6 bg-[#0d0f14]">
      <div
        className="flex items-center w-7 h-7 rounded-lg bg-indigo-500/10 border
       border-indigo-500/10"
      >
        <MessageSquare size={13} className="text-indigo-400" />
      </div>

      <div className="text-[14px] font-semibold text-slate-100 tracking-tight">
        {selectedConversation?.title || "New Chat"}
      </div>
      <div
        className="text-[10px] font-medium text-slate-600 border border-white/60
       py-2.5 rounded-full px-2"
      >
        {messages?.length} Messages
      </div>
    </div>}
    </>
  );
}

export default Nav;
