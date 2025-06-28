const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const filteredBody = {};
  if (req.body.username) filteredBody.username = req.body.username;
  if (req.body.email) filteredBody.email = req.body.email;
  if (req.body.phoneNumber) filteredBody.phoneNumber = req.body.phoneNumber;

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.sendFriendRequest = catchAsync(async (req, res, next) => {
  const sender = req.user;
  const receiver = await User.findById(req.params.id);

  if (!receiver) {
    return next(new AppError('No user found with that ID', 404));
  }

  if (sender.friends.includes(receiver._id)) {
    return next(new AppError('You are already friends with this user', 400));
  }

  if (receiver.friendRequests.includes(sender._id)) {
    return next(new AppError('Friend request already sent', 400));
  }

  receiver.friendRequests.push(sender._id);
  await receiver.save();

  res.status(200).json({
    status: 'success',
    message: 'Friend request sent successfully'
  });
});

exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const friendId = req.params.id;

  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!friend) {
    return next(new AppError('No user found with that ID', 404));
  }

  if (!user.friendRequests.includes(friendId)) {
    return next(new AppError('No friend request from this user', 400));
  }

  // Remove from friend requests
  user.friendRequests = user.friendRequests.filter(
    id => id.toString() !== friendId
  );

  // Add to friends list for both users
  user.friends.push(friendId);
  friend.friends.push(userId);

  await user.save();
  await friend.save();

  res.status(200).json({
    status: 'success',
    message: 'Friend request accepted successfully'
  });
});

exports.rejectFriendRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const friendId = req.params.id;

  if (!user.friendRequests.includes(friendId)) {
    return next(new AppError('No friend request from this user', 400));
  }

  user.friendRequests = user.friendRequests.filter(
    id => id.toString() !== friendId
  );

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Friend request rejected successfully'
  });
});

exports.getFriends = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'friends',
    select: '-password'
  });

  res.status(200).json({
    status: 'success',
    results: user.friends.length,
    data: {
      friends: user.friends
    }
  });
});
