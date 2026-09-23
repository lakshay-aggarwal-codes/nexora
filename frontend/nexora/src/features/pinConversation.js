import api from "../../utils/axios";

export const pinConversation = async (id, pinned) => {
  const { data } = await api.post("/api/chat/pin-conversation", {
    id,
    pinned,
  });
  return data;
};