const User = require("../models/User");
const { createSendToken } = require("../utils/authUtils");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const validator = require("validator");
const TokenBlacklist = require("../models/TokenBlacklist");
const jwt = require("jsonwebtoken");

exports.signup = catchAsync(async (req, res, next) => {
  if (
    !req.body.username ||
    !req.body.email ||
    !req.body.phoneNumber ||
    !req.body.password
  ) {
    return next(new AppError("Please provide all required fields", 400));
  }

  if (!validator.isEmail(req.body.email)) {
    return next(new AppError("Please provide a valid email", 400));
  }
  const existingUser = await User.findOne({
    $or: [
      { email: req.body.email },
      { username: req.body.username },
      { phoneNumber: req.body.phoneNumber },
    ],
  });
  if (existingUser) {
    return next(
      new AppError(
        "User with this email, username or phone number already exists",
        400
      )
    );
  }
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  user.status = "online";
  await user.save();

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(new AppError("Please provide a login token", 401));
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid token", 401));
  }

  try {
    const expiresAt = new Date(decoded.exp * 1000);
    const blacklistResult = await TokenBlacklist.findOneAndUpdate(
      { token },
      { expiresAt },
      { upsert: true, new: true }
    );
  } catch (error) {
    return next(new AppError("Error while invalidating token", 500));
  }
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  const isBlacklisted = await TokenBlacklist.findOne({ token });
  if (isBlacklisted) {
    return next(new AppError("Token is invalidated. Please login again.", 401));
  }

  req.user = currentUser;
  next();
});
