import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import  generateToken  from "../utils/generateToken.js";
import AppError from "../utils/appError.js";
import { getPurchasedCourses } from "./course.controller.js";

const register = asyncHandler(async (req, res, next) => {
  const { email, password, fullName , profilePic} = req.body;
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
        purchasedCourses:user.purchasedCourses,
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
const getMyPurchasedCourses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select("purchasedCourses")
    .populate({
      path: "purchasedCourses",
      select: "title title_ar thumbnail price level category instructor rating totalRatings createdAt",
      populate: [
        { path: "category", select: "name name_ar" },
        { path: "instructor", select: "fullName email profilePic" },
      ],
    });
  if (!user) return next(new AppError("User not found", 404));
  res.status(200).json({
    success: true,
    count: user.purchasedCourses.length,
    data: user.purchasedCourses,
  });
});


export { register, login, getProfile, getMyPurchasedCourses};
