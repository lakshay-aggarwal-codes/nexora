import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";

function MessageList() {
  const { selectedConversation } = useSelector(
    (state) => state.conversations
  );

  const { messages = [] } = useSelector((state) => state.message);

  const suggestions = [
    "Explain Redis",
    "Build a dashboard",
    "Write a Netflix clone",
    "Help me debug my code",
  ];

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {isEmpty || !selectedConversation ? (
        <div className="flex min-h-full w-full items-center justify-center px-4 pb-8">
          <div className="w-full max-w-3xl">
            <div className="mb-8 text-center">
              <div className="mb-3 text-3xl font-semibold tracking-tight text-white">
                Nexora
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                How can I help you?
              </h1>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/4
                  px-4 py-3 text-left text-sm text-slate-300
                  transition hover:bg-white/8 hover:text-white
                  cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          <div className="space-y-8">
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg?._id || index}
                role={msg?.role}
                content={msg?.content}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageList;