import api from "../../utils/axios";

export const updateConversation = async (id, title) => {
  const { data } = await api.post("/api/chat/update-conversation", {
    id,
    title,
  });
  return data;
};