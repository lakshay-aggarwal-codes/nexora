import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import {
  removeConversation,
  renameConversationInStore,
  setConversationPinned,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { deleteConversation as deleteConversationApi } from "../features/deleteConversation";
import { pinConversation as pinConversationApi } from "../features/pinConversation";
import { updateConversation as updateConversationApi } from "../features/updateConversation";

function ConversationItem({ conv, isActive }) {
  const dispatch = useDispatch();
  const menuRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(conv.title || "New Chat");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setConfirmingDelete(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePin = async (e) => {
    e.stopPropagation();
    const nextPinned = !conv.pinned;
    dispatch(setConversationPinned({ id: conv._id, pinned: nextPinned }));
    setMenuOpen(false);
    try {
      await pinConversationApi(conv._id, nextPinned);
    } catch (error) {
      console.error("Failed to pin conversation:", error);
      dispatch(setConversationPinned({ id: conv._id, pinned: conv.pinned }));
    }
  };

  const startRename = (e) => {
    e.stopPropagation();
    setTitleDraft(conv.title || "New Chat");
    setRenaming(true);
    setMenuOpen(false);
  };

  const commitRename = async () => {
    setRenaming(false);
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === conv.title) return;

    dispatch(renameConversationInStore({ id: conv._id, title: trimmed }));
    try {
      await updateConversationApi(conv._id, trimmed);
    } catch (error) {
      console.error("Failed to rename conversation:", error);
      dispatch(
        renameConversationInStore({ id: conv._id, title: conv.title }),
      );
    }
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    setMenuOpen(false);
    setConfirmingDelete(false);
    try {
      await deleteConversationApi(conv._id);
      dispatch(removeConversation(conv._id));
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  return (
    <div
      onClick={() => !renaming && dispatch(setSelectedConversation(conv))}
      className={`group relative flex items-center gap-2.5 cursor-pointer
      mb-0.5 px-3 py-2.5 rounded-[10px] border
      transition-colors duration-150 ${
        isActive
          ? "bg-indigo-500/10 border-indigo-500/18"
          : "bg-transparent border-transparent hover:bg-white/5"
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

      {renaming ? (
        <input
          autoFocus
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.target.blur();
            if (e.key === "Escape") {
              setTitleDraft(conv.title || "New Chat");
              setRenaming(false);
            }
          }}
          className="flex-1 min-w-0 bg-transparent border-b border-indigo-400
          text-[13px] font-medium text-slate-100 outline-none"
        />
      ) : (
        <span
          className={`flex-1 min-w-0 truncate text-[13px] font-medium ${
            isActive ? "text-slate-100" : "text-slate-300"
          }`}
        >
          {conv.title || "New Chat"}
        </span>
      )}

      {!renaming && (
        <div
          ref={menuRef}
          className="relative shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v);
              setConfirmingDelete(false);
            }}
            className={`flex h-6 w-6 items-center justify-center rounded-md
            text-slate-500 hover:bg-white/10 hover:text-white
            transition-opacity duration-150 cursor-pointer ${
              menuOpen ? "opacity-100 bg-white/10" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <MoreHorizontal size={15} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-1 w-44
              overflow-hidden rounded-lg border border-white/10
              bg-[#1a1c23] py-1 shadow-xl"
            >
              <button
                type="button"
                onClick={handlePin}
                className="flex w-full items-center gap-2.5 px-3 py-2
                text-left text-[13px] text-slate-300 hover:bg-white/5
                hover:text-white cursor-pointer"
              >
                {conv.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                {conv.pinned ? "Unpin" : "Pin"}
              </button>

              <button
                type="button"
                onClick={startRename}
                className="flex w-full items-center gap-2.5 px-3 py-2
                text-left text-[13px] text-slate-300 hover:bg-white/5
                hover:text-white cursor-pointer"
              >
                <Pencil size={14} />
                Rename
              </button>

              <button
                type="button"
                onClick={handleDeleteClick}
                className="flex w-full items-center gap-2.5 px-3 py-2
                text-left text-[13px] text-red-400 hover:bg-red-500/10
                cursor-pointer"
              >
                <Trash2 size={14} />
                {confirmingDelete ? "Click again to confirm" : "Delete"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ConversationItem;