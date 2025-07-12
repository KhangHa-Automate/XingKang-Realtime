const Chat = require('../models/Chat');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getConversations = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const conversations = await Chat.find({
    participants: userId
  })
    .populate({
      path: 'participants',
      select: 'username status'
    })
    .select('-messages')
    .sort('-updatedAt');

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    data: {
      conversations
    }
  });
});

exports.getMessages = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const recipientId = req.params.id;
  const user = await User.findById(userId);
  if (!user.friends.includes(recipientId)) {
    return next(new AppError('You are not friends with this user', 403));
  }
  let chat = await Chat.findOne({
    participants: { $all: [userId, recipientId] }
  })
    .populate({
      path: 'messages.sender',
      select: 'username'
    });

  if (!chat) {
    chat = await Chat.create({
      participants: [userId, recipientId],
      messages: []
    });
  }

  // Pagination
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const totalMessages = chat.messages.length;
  const start = Math.max(totalMessages - limit - offset, 0);
  const end = totalMessages - offset;
  const paginatedMessages = chat.messages.slice(start, end);

  // Đánh dấu tin nhắn đã đọc nếu là receiver
  paginatedMessages.forEach(message => {
    if (message.sender._id.toString() !== userId.toString() && !message.read) {
      message.read = true;
    }
  });
  await chat.save();

  res.status(200).json({
    status: 'success',
    data: {
      messages: paginatedMessages,
      total: totalMessages
    }
  });
});

exports.saveMessage = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  const senderId = req.user._id;
  const recipientId = req.params.id;
  const user = await User.findById(senderId);
  if (!user.friends.includes(recipientId)) {
    return next(new AppError('You are not friends with this user', 403));
  }
  let chat = await Chat.findOne({
    participants: { $all: [senderId, recipientId] }
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [senderId, recipientId],
      messages: [{ sender: senderId, content, read: false }]
    });
  } else {
    chat.messages.push({ sender: senderId, content, read: false });
    await chat.save();
  }
  
  // Populate sender info for response
  const populatedChat = await Chat.findById(chat._id)
    .populate({
      path: 'messages.sender',
      select: 'username'
    });
  
  const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

  // Đã xóa các phần emit socket event và log liên quan đến socket

  res.status(200).json({
    status: 'success',
    data: {
      message: newMessage
    }
  });
});

exports.markMessagesAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const recipientId = req.params.id;
  
  const user = await User.findById(userId);
  if (!user.friends.includes(recipientId)) {
    return next(new AppError('You are not friends with this user', 403));
  }
  
  const chat = await Chat.findOne({
    participants: { $all: [userId, recipientId] }
  });
  
  if (!chat) {
    return next(new AppError('Chat not found', 404));
  }
  
  // Mark all messages from recipient as read
  let updated = false;
  chat.messages.forEach(message => {
    if (message.sender.toString() === recipientId && !message.read) {
      message.read = true;
      updated = true;
    }
  });
  
  if (updated) {
    await chat.save();
    
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Messages marked as read'
  });
});
