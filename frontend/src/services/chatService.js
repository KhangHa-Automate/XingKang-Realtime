import api from '../api/axiosConfig';

export const getConversations = async () => {
  return api.get('/chats');
};

export const getMessages = async (conversationId, limit = 20, offset = 0) => {
  return api.get(`/chats/${conversationId}?limit=${limit}&offset=${offset}`);
};

export const sendMessage = async (conversationId, content) => {
  return api.post(`/chats/${conversationId}`, { content });
};

export const markMessagesAsRead = async (conversationId) => {
  return api.patch(`/chats/${conversationId}/read`);
};
