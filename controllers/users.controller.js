import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const createUser = asyncHandler(async (req, res, next) => {
  const { email, password, fullName, profilePic, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return next(new AppError("User already exists", 409));
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = await User.create({
    email,
    passwordHash,
    fullName,
    profilePic,
    role,
  });
  res.status(201).json({ message: "success", user });
});

// Get All Users
const getAllUsers = asyncHandler(async (req, res, next) => {
  let users = await User.find({});
  if (!users) {
    return next(new AppError("No users registered yet", 404));
  }
  res.status(200).json(users);
});

// get user by id

const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const checkId = mongoose.Types.ObjectId.isValid(id);
  if (!checkId) {
    return next(new AppError("Invalid user id, try Again", 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError(`user with ${id} id not found`, 404));
  }

  res.status(200).json(user);
});

// update user
const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { email, password, fullName, profilePic,role } = req.body;
  const checkId = mongoose.Types.ObjectId.isValid(id);
  if (!checkId) {
    return next(new AppError("Invalid user id, try Again", 400));
  }

  const updateObj = {};
  if (email) updateObj.email = email;
  if (fullName) updateObj.fullName = fullName;
  if (role) updateObj.role = role;
  if (profilePic) updateObj.profilePic = profilePic;

  if (password) {
    updateObj.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate({ _id: id }, updateObj, {
    new: true,
  });

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(201).json("User Updated successfully");
});

// delete user with id
const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const checkId = mongoose.Types.ObjectId.isValid(id);
  if (!checkId) {
    return next(new AppError("Invalid user id, try Again", 400));
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new AppError(`user with ${id} id not found`, 404));
  }

  res.status(200).json("user deleted successfully");
});

export { createUser, getAllUsers, getUserById, deleteUser, updateUser };
