import React, { useEffect, useState, useRef } from "react";
import { Box, TextField, Button } from "@mui/material";
import { io } from "socket.io-client";

import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "../services/chatService.js";
import Message from "./Message";

// ===== Constants =====
const SOCKET_URL = "http://localhost:5000";

// ===== Custom Hook =====
function useChatSocket(userId, onReceiveMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    console.log(">> Socket starting ...");
    
    // Tạo socket connection
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current.id);
      
      // Chỉ join room khi đã connect thành công
      if (userId) {
        console.log(">> Client - JoinRoom: ", userId);
        socketRef.current.emit("joinRoom", { userId });
      }
    });
  
    socketRef.current.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err);
    });

    socketRef.current.on("receiveMessage", ({ senderId, message }) => {
      console.log(">> Client - ReceiveMessage: ", { senderId, message });
      if (onReceiveMessage) onReceiveMessage(senderId, message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId]); // Chỉ dependency userId, không phụ thuộc vào onReceiveMessage

  const sendMessage = (receiverId, message) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log(">> sendMessage - FE: ", { senderId: userId, receiverId, message });
      socketRef.current.emit("sendMessage", { senderId: userId, receiverId, message });
    }
  };

  return { sendMessage };
}

// ===== Main Component =====
const ChatBox = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [senderId, setSenderId] = useState("");
  const [messageId, setMessageId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const inputRef = useRef();
  const messagesEndRef = useRef(null);
  const messagesBoxRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId);
  }, []);

  const fetchMessages = async (customOffset = 0) => {
    if (!conversationId) return;
    try {
      const response = await getMessages(conversationId, 20, customOffset);
      if (response.data?.data?.messages) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {}
  };

  const markMessagesAsReadHandler = async () => {
    if (!conversationId) return;
    try {
      const response = await markMessagesAsRead(conversationId);
      if (response.status === 200) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, read: true })));
      }
    } catch (error) {}
  };

  const emitConversationOpened = async () => {
    if (!conversationId) return;
    await markMessagesAsReadHandler();
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages(0);
      emitConversationOpened();
      inputRef.current?.focus();
    }
  }, [conversationId]);

  // Callback function để xử lý tin nhắn nhận được
  const handleReceiveMessage = (senderId, newMessage) => {
    const messageData = {
      _id: Date.now().toString(),
      content: newMessage,
      conversationId,
      sender: { _id: senderId },
      status: "sent",
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, messageData]);
  };

  const { sendMessage: sendMessageSocket } = useChatSocket(
    currentUserId,
    handleReceiveMessage
  );

  useEffect(() => {
    if (messagesBoxRef.current) {
      const box = messagesBoxRef.current;
      box.scrollTop = box.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    setIsSending(true);
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setIsSending(false);
      return;
    }
    const messageId = Date.now().toString();
    setMessageId(messageId);
    const messageData = {
      _id: messageId,
      content: newMessage,
      conversationId,
      sender: { _id: userId },
      status: "sending",
      timestamp: new Date().toISOString(),
      read: false,
    };
    setSenderId(userId);
    setMessages((prev) => [...prev, messageData]);
    
    try {
      // Gửi tin nhắn qua HTTP API để lưu vào database
      const response = await sendMessage(conversationId, newMessage);
      
      if (response.status === 200 || response.status === 201) {
        // Gửi tin nhắn qua socket để realtime
        // conversationId chính là receiverId (friendId)
        sendMessageSocket(conversationId, newMessage);
        
        // Cập nhật status thành sent
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg && msg._id === messageId
                ? {
                    ...msg,
                    status: "sent",
                    _id: response.data?.data?.message?._id || messageId,
                    read: false,
                  }
                : msg
            )
          );
        }, 1000);
        setNewMessage("");
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg && msg._id === messageId ? { ...msg, status: "error" } : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  if (!conversationId) {
    return <div>No conversation selected</div>;
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        ref={messagesBoxRef}
        className="messages"
        sx={{
          border: "1px solid #ccc",
          height: "100%",
          overflowY: "auto",
          padding: "10px",
          backgroundColor: "#fafafa",
          flex: 1,
        }}
      >
        {Array.isArray(messages) &&
          messages.map((msg, index) => {
            if (!msg || !msg._id) return null;
            const isLastMessage = index === messages.length - 1;
            return (
              <Message
                key={`${msg._id}-${index}`}
                message={msg}
                isLastMessage={isLastMessage}
              />
            );
          })}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <TextField
          inputRef={inputRef}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (newMessage.trim()) {
                handleSendMessage();
              }
            }
          }}
          value={newMessage}
          placeholder="Type a message..."
          fullWidth
          disabled={isSending}
          sx={{
            "& .MuiOutlinedInput-root": {
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              },
              "&.Mui-focused": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
              },
            },
          }}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isSending || !newMessage.trim()}
          variant="contained"
          sx={{
            minWidth: "80px",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
            "&:disabled": {
              transform: "none",
              boxShadow: "none",
            },
          }}
        >
          {isSending ? "Đang gửi..." : "Gửi"}
        </Button>
      </Box>
    </Box>
  );
};

export default ChatBox;
