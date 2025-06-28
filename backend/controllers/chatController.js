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
  chat.messages.forEach(message => {
    if (message.sender._id.toString() !== userId.toString() && !message.read) {
      message.read = true;
    }
  });
  await chat.save();
  res.status(200).json({
    status: 'success',
    data: {
      messages: chat.messages
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
      messages: [{ sender: senderId, content }]
    });
  } else {
    chat.messages.push({ sender: senderId, content });
    await chat.save();
  }
  res.status(200).json({
    status: 'success',
    message: 'Message saved successfully'
  });
});
