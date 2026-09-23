import {
  Coins,
  LogOut,
  MessageSquare,
  PanelLeftIcon,
  PanelRight,
  PenSquare,
  Plus,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getConversations } from "../features/getConversations";
import { useDispatch, useSelector } from "react-redux";
import {
  addConversation,
  setConversations,
  setSelectedConversation,
} from "../redux/conversationSlice.js";
import { createConversation } from "../features/createConversation";
import logOut from "../features/logOut.js";
import { setUserdata } from "../redux/userSlice.js";
import ConversationItem from "./ConversationItem";

function Sidebar() {
  const [collapse, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const [imageError, setImageError] = useState(false);

  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversations,
  );

  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const getConv = async () => {
      const data = await getConversations();
      dispatch(setConversations(data));
    };

    getConv();
  }, [userData?._id, dispatch]);

  const handleCreateConversation = async () => {
    const data = await createConversation();

    dispatch(addConversation(data));
    dispatch(setSelectedConversation(data));
  };

  const pinnedConversations = conversations.filter((c) => c.pinned);
  const unpinnedConversations = conversations.filter((c) => !c.pinned);

  if (collapse) {
    return (
      <div
        className="flex flex-col items-center h-screen w-14 bg-[#0d0f14]
        border-r border-white/10 py-4 shrink-0 gap-1"
      >
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg
          text-slate-500 hover:text-slate-200 hover:bg-white/5
          transition-colors duration-150 bg-transparent border-none cursor-pointer"
          onClick={() => setCollapsed(false)}
        >
          <PanelRight size={18} />
        </button>

        <button
          onClick={handleCreateConversation}
          className="flex items-center justify-center w-8 h-8 rounded-lg
          text-slate-500 hover:text-slate-200 hover:bg-white/5
          transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <Plus size={17} />
        </button>

        <div
          className="pt-5 flex-1 overflow-y-auto px-2.5 pb-2
          [&::-webkit-scrollbar]:hidden"
        >
          {conversations.map((conv) => {
            const isActive = selectedConversation?._id === conv?._id;

            return (
              <div
                key={conv._id}
                onClick={() => dispatch(setSelectedConversation(conv))}
                className={`flex items-center gap-2.5 cursor-pointer
                mb-0.5 px-3 py-2.5 rounded-[10px] border
                transition-colors duration-150 ${
                  isActive
                    ? "bg-indigo-500/10 border-indigo-500/18"
                    : "bg-transparent border-transparent"
                }`}
              >
                <div
                  className={`flex items-center justify-center shrink-0 w-7 h-7
                  rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "bg-indigo-500/15 border-indigo-400"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  <MessageSquare size={13} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative shrink-0">
          {userData?.avatar && !imageError ? (
            <img
              src={userData.avatar}
              alt="image"
              className="w-9 h-9 rounded-[10px] object-cover
              border-2 border-indigo-500/25"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="flex items-center justify-center w-9 h-9
              rounded-[10px] border-2 border-indigo-500/25"
            >
              <User size={15} className="text-slate-400" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0d0f14] border-r border-white/10">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/6">
          <button
            className="flex items-center justify-center w-7 h-7 rounded-lg
            text-slate-500 hover:text-slate-200 hover:bg-white/5
            transition-colors duration-150 bg-transparent border-none cursor-pointer"
            onClick={() => setCollapsed(true)}
          >
            <PanelLeftIcon size={18} />
          </button>

          <span className="text-[16px] font-semibold text-slate-100 tracking-tight flex-1">
            Nexora
          </span>

          <span
            className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10
            border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide"
          >
            free
          </span>

          <button
            className="flex items-center justify-center w-7 h-7 rounded-lg
            text-slate-500 hover:text-slate-200 hover:bg-white/5
            transition-colors duration-150 bg-transparent border-none cursor-pointer"
            onClick={handleCreateConversation}
          >
            <PenSquare size={14} />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-4 pt-4 pb-1">
          <button
            className="w-full flex items-center justify-center gap-2 text-sm font-medium
            text-white bg-linear-to-br from-indigo-500 to-violet-700 rounded-xl
            py-2.5 border-none cursor-pointer hover:opacity-90
            transition-opacity duration-150"
            onClick={handleCreateConversation}
          >
            <Plus size={15} />
            New Chat
          </button>
        </div>

        {/* Pinned */}
        <div
          className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase
          tracking-widest text-slate-600"
        >
          Pinned
        </div>

        <div className="px-2.5">
          {pinnedConversations.length === 0 ? (
            <div className="px-3 py-2 text-[12px] text-slate-600">
              No pinned chats
            </div>
          ) : (
            pinnedConversations.map((conv) => (
              <ConversationItem
                key={conv._id}
                conv={conv}
                isActive={selectedConversation?._id === conv?._id}
              />
            ))
          )}
        </div>

        {/* Recents Heading */}
        {unpinnedConversations.length === 0 ? (
          <div
            className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase
            tracking-widest text-slate-600"
          >
            No Recent Conversation
          </div>
        ) : (
          <div
            className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase
            tracking-widest text-slate-600"
          >
            Recents
          </div>
        )}

        {/* Conversations */}
        <div
          className="flex-1 overflow-y-auto px-2.5 pb-2
          [&::-webkit-scrollbar]:hidden"
        >
          {unpinnedConversations.map((conv) => (
            <ConversationItem
              key={conv._id}
              conv={conv}
              isActive={selectedConversation?._id === conv?._id}
            />
          ))}
        </div>

        {/* User Section */}
        <div className="mx-2.5 border-t border-white/6">
          <div className="px-3.5 py-3.5">
            {userData ? (
              <div
                className="flex items-center gap-2.5 cursor-pointer
                px-3 py-2.5 rounded-xl hover:bg-white/5
                transition-colors duration-150"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {userData?.avatar && !imageError ? (
                    <img
                      src={userData.avatar}
                      alt="image"
                      className="w-9 h-9 rounded-[10px] object-cover
                      border-2 border-indigo-500/25"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center w-9 h-9
                      rounded-[10px] border-2 border-indigo-500/25"
                    >
                      <User size={15} className="text-slate-400" />
                    </div>
                  )}
                </div>

                {/* User Information */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-slate-100 truncate">
                    {userData?.name || "user"}
                  </p>

                  <p className="text-slate-600 mt-px text-[11px]">
                    {"Free Plan"}
                  </p>
                </div>

                {/* Coins + Logout */}
                <div className="flex gap-1">
                  <button
                    className="flex items-center justify-center shrink-0 w-7 h-7
                    rounded-[7px] bg-transparent text-yellow-600 cursor-pointer
                    hover:bg-white/5 hover:text-yellow-400
                    transition-all duration-150"
                  >
                    <Coins size={16} />
                  </button>

                  <button
                    onClick={() => {
                      logOut();
                      dispatch(setUserdata(null));
                    }}
                    className="flex items-center justify-center shrink-0 w-7 h-7
                    rounded-[7px] bg-transparent text-slate-600 cursor-pointer
                    hover:bg-white/5 hover:text-slate-400
                    transition-all duration-150"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="flex items-center justify-center shrink-0 w-7 h-7
                rounded-[7px] bg-transparent text-slate-600 cursor-pointer
                hover:bg-white/5 hover:text-slate-400
                transition-all duration-150"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;