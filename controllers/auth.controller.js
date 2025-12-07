import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import  generateToken  from "../utils/generateToken.js";

const register = asyncHandler(async (req, res, next) => {
  const { email, password, fullName } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return next(new AppError("User already exists", 409)); 
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = await User.create({
    email,
    passwordHash,
    fullName,
    profilePic,
    role: "student",
  });
  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    res.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
    // return next(new AppError("Invalid email or password", 404));
  }
});

const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-passwordHash");
  if (!user) return next(new AppError("User not found", 404));
  res.json({
    success: true,
    data: user,
  });
});

export { register, login, getProfile };
