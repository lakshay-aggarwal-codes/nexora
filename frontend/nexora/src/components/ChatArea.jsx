import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import Nav from "./Nav";
import getMessages from "../features/getMessages";
import { setMessages } from "../redux/messageSlice";

function ChatArea() {
  const { selectedConversation } = useSelector(
    (state) => state.conversations
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation?._id) {
        dispatch(setMessages([]));
        return;
      }

      try {
        const { data } = await getMessages(selectedConversation._id);
        dispatch(setMessages(data || []));
      } catch (error) {
        console.error("Failed to load messages:", error);
        dispatch(setMessages([]));
      }
    };

    loadMessages();
  }, [selectedConversation, dispatch]);

  return (
    <main className="relative flex h-full min-w-0 flex-col overflow-hidden bg-[#212121] text-white">
      <Nav />

      <div className="flex min-h-0 flex-1 flex-col">
        <MessageList />
        <ChatInput />
      </div>
    </main>
  );
}

export default ChatArea;