import axios from '../api/axiosConfig';

// API endpoints cho message status
const MESSAGE_STATUS_API = {
  MARK_AS_DELIVERED: '/api/messages/delivered',
  MARK_AS_READ: '/api/messages/read',
  GET_MESSAGE_STATUS: '/api/messages/status'
};

class MessageStatusService {
  // Đánh dấu tin nhắn đã được nhận
  static async markAsDelivered(messageId, conversationId) {
    try {
      const response = await axios.post(MESSAGE_STATUS_API.MARK_AS_DELIVERED, {
        messageId,
        conversationId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking message as delivered:', error);
      throw error;
    }
  }

  // Đánh dấu tin nhắn đã được đọc
  static async markAsRead(messageId, conversationId) {
    try {
      const response = await axios.post(MESSAGE_STATUS_API.MARK_AS_READ, {
        messageId,
        conversationId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // Lấy trạng thái tin nhắn
  static async getMessageStatus(messageId) {
    try {
      const response = await axios.get(`${MESSAGE_STATUS_API.GET_MESSAGE_STATUS}/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting message status:', error);
      throw error;
    }
  }

  // Đánh dấu tất cả tin nhắn trong conversation là đã đọc
  static async markConversationAsRead(conversationId) {
    try {
      const response = await axios.post('/api/conversations/read', {
        conversationId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }
}

export default MessageStatusService; 