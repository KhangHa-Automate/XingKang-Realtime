import { useState, useEffect, useCallback } from 'react';
import MessageStatusService from '../services/messageStatusService.js';

// Đã xóa toàn bộ phần liên quan đến socket.io

export const useMessageStatus = (conversationId, currentUserId) => {
  const [messageStatuses, setMessageStatuses] = useState({});

  // Cập nhật trạng thái tin nhắn
  const updateMessageStatus = useCallback((messageId, status) => {
    setMessageStatuses(prev => ({
      ...prev,
      [messageId]: status
    }));
  }, []);

  // Đánh dấu tin nhắn đã được nhận
  const markAsDelivered = useCallback(async (messageId) => {
    try {
      await MessageStatusService.markAsDelivered(messageId, conversationId);
      updateMessageStatus(messageId, 'delivered');
      
      // Emit socket event
      // socket.emit("messageDelivered", {
      //   messageId,
      //   conversationId,
      //   userId: currentUserId
      // });
    } catch (error) {
      console.error("Error marking message as delivered:", error);
    }
  }, [conversationId, currentUserId, updateMessageStatus]);

  // Đánh dấu tin nhắn đã được đọc
  const markAsRead = useCallback(async (messageId) => {
    try {
      await MessageStatusService.markAsRead(messageId, conversationId);
      updateMessageStatus(messageId, 'read');
      
      // Emit socket event
      // socket.emit("messageRead", {
      //   messageId,
      //   conversationId,
      //   userId: currentUserId
      // });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }, [conversationId, currentUserId, updateMessageStatus]);

  // Đánh dấu tất cả tin nhắn trong conversation là đã đọc
  const markConversationAsRead = useCallback(async () => {
    try {
      await MessageStatusService.markConversationAsRead(conversationId);
      
      // Emit socket event
      // socket.emit("conversationOpened", {
      //   conversationId,
      //   userId: currentUserId
      // });
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  }, [conversationId, currentUserId]);

  // Lắng nghe cập nhật trạng thái từ socket
  useEffect(() => {
    const handleMessageStatusUpdated = (data) => {
      updateMessageStatus(data.messageId, data.status);
    };

    // socket.on("messageStatusUpdated", handleMessageStatusUpdated);

    return () => {
      // socket.off("messageStatusUpdated", handleMessageStatusUpdated);
    };
  }, [updateMessageStatus]);

  return {
    messageStatuses,
    updateMessageStatus,
    markAsDelivered,
    markAsRead,
    markConversationAsRead
  };
}; 