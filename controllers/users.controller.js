import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { cloudinary, uploadToCloudinary } from "../config/cloudinary.js";
import { upload } from "../middleware/imageUpload.js";
import Course from "../models/Course.js";
// import multer from "multer";

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
  res.status(201).json(user);
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
// get user purchased course details
const getPurchasedCourseDetails = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params; // Get courseId from the request

  // Check if the user has purchased the course
  const user = await User.findById(req.user._id).populate({
    path: "purchasedCourses",
    select: "_id", // Only select course ids for quick lookup
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if the courseId is in the purchasedCourses array
  const courseFound = user.purchasedCourses.some(
    (course) => course._id.toString() === courseId
  );

  if (!courseFound) {
    return next(new AppError("You have not purchased this course", 403)); // Forbidden
  }

  // If the course is purchased, fetch the course details with chapters and lectures
  const course = await Course.findById(courseId)
    .populate("instructor", "fullName email profilePic")
    .populate("category", "name name_ar")
    .populate({
      path: "chapters.chapter",
      populate: {
        path: "lectures.lecture",
      },
    });

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});
// update user
const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { email, password, fullName, profilePic, role } = req.body;
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
  res.status(201).json({
    success: true,
    message: "User Updated successfully",
    data: updatedUser,
  });
});
const updateUserProfilePic = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const checkId = mongoose.Types.ObjectId.isValid(id);
  const userExists = await User.findOne({ _id: id  });
  if (!checkId) {
    return next(new AppError("Invalid user id, try Again", 400));
  }
  upload.single("profilePic")(req, res, async (err) => {
    if (err) {
      return next(new AppError(err.message, 400));
    }
    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }
    try {
      if (userExists.profilePic) {
        const publicId = userExists.profilePic.split("/").pop().split(".")[0]; // Extract publicId
        await cloudinary.uploader.destroy(publicId); // Delete old image from Cloudinary
      }
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      const updateObj = { profilePic: imageUrl };
      const updatedUser = await User.findByIdAndUpdate(id, updateObj, {
        new: true, // Return the updated user
      });
      if (!updatedUser) {
        return next(new AppError("User not found", 404));
      }
      res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      return next(new AppError("Error uploading image to Cloudinary", 500));
    }
  });
});

const changeUserPassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new AppError("Please provide oldPassword, newPassword, confirmPassword", 400));
  }
  if (newPassword.length < 8) {
    return next(new AppError("New password must be at least 8 characters", 400));
  }
  if (newPassword !== confirmPassword) {
    return next(new AppError("New password and confirm password do not match", 400));
  }
  if (oldPassword === newPassword) {
    return next(new AppError("New password must be different from old password", 400));
  }
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError("User not found", 404));
  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) return next(new AppError("Old password is incorrect", 400));
  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();
  res.status(200).json({ success: true, message: "Password updated successfully",data:user });
});
// delete user with id
const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const checkId = mongoose.Types.ObjectId.isValid(id);
  if (!checkId) {
    return next(new AppError("Invalid user id, try Again", 400));
  }
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError(`user with ${id} id not found`, 404));
  }
  if (user.profilePic) {
    try {
      const publicId = user.profilePic.split("/").pop().split(".")[0]; // Extract public_id from URL
      await cloudinary.uploader.destroy(publicId); // Delete the profile picture from Cloudinary
    } catch (error) {
      return next(
        new AppError("Error deleting profile picture from Cloudinary", 500)
      );
    }
  }
  await user.deleteOne(); // Delete the user from the database
  res.status(200).json({ message: "User deleted successfully" });
});

export {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateUserProfilePic,
  changeUserPassword,
  getPurchasedCourseDetails
};
