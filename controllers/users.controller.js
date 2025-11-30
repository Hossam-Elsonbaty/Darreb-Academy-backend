import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const createUser = asyncHandler(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return next(new AppError("Email Already Exist", 409));
  let result = new User(req.body);
  await result.save();
  res.status(201).json({ message: "success", result });
});

// Get All Users
const getAllUses = asyncHandler(async (req, res, next) => {
  let users = await User.find({});
  if (!users) {
    return next(new AppError("No uses registered yet", 404));
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
  const { email, password, fullName } = req.body;
  const checkId = mongoose.Types.ObjectId.isValid(id);
  if (!checkId) {
    return next(new AppError("Invalid user id, try Again", 400));
  }

  const updateObj = {};
  if (email) updateObj.email = email;
  if (fullName) updateObj.fullName = fullName;

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

export { createUser, getAllUses, getUserById, deleteUser, updateUser };
