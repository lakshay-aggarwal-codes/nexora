import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import Nav from "./Nav";
import getMessages from "../features/getMessages";
import { setMessages } from "../redux/messageSlice";

function ChatArea() {
  const { selectedConversation } = useSelector((state) => state.conversations);
  const { messages } = useSelector((state) => state.message);
  const dispatch = useDispatch();
  const [loadingMessages, setLoadingMessages] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    const loadMessages = async () => {
      if (!selectedConversation?._id) {
        dispatch(setMessages([]));
        return;
      }

      setLoadingMessages(true);
      try {
        const data = await getMessages(selectedConversation._id);
        console.log("Loaded messages for", selectedConversation._id, data);
        if (!ignore) {
          dispatch(setMessages(data || []));
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        if (!ignore) dispatch(setMessages([]));
      } finally {
        if (!ignore) setLoadingMessages(false);
      }
    };

    loadMessages();

    return () => {
      ignore = true;
    };
  }, [selectedConversation?._id, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  return (
    <main className="relative flex h-full min-w-0 flex-col overflow-hidden bg-[#212121] text-white">
      <Nav />

      <div className="flex min-h-0 flex-1 flex-col">
        {loadingMessages ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            Loading conversation...
          </div>
        ) : (
          <MessageList bottomRef={bottomRef} />
        )}
        <ChatInput />
      </div>
    </main>
  );
}

export default ChatArea;