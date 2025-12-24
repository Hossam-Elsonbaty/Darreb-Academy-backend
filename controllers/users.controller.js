import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { cloudinary, uploadToCloudinary } from "../config/cloudinary.js";
import { upload } from "../middleware/imageUpload.js";
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
// const upload = multer({ dest: "uploads/" }).single("profilePic");
// const updateUserProfilePic = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const checkId = mongoose.Types.ObjectId.isValid(id);
  
//   if (!checkId) {
//     return next(new AppError("Invalid user id, try Again", 400));
//   }

//   // Handle file upload via Multer
//   upload(req, res, async (err) => {
//     if (err) {
//       return next(new AppError(err.message, 400));
//     }

//     // Check if file exists in request
//     if (!req.file) {
//       return next(new AppError("No file uploaded", 400));
//     }

//     try {
//       // Upload image to Cloudinary
//       const result = await cloudinary.uploader.upload(req.file.path, {
//         resource_type: "auto", // This tells Cloudinary to auto-detect file type
//       });

//       // Prepare update object with Cloudinary URL
//       const updateObj = { profilePic: result.secure_url };

//       // Find user and update profilePic URL
//       const updatedUser = await User.findByIdAndUpdate(id, updateObj, {
//         new: true, // Return the updated user
//       });

//       if (!updatedUser) {
//         return next(new AppError("User not found", 404));
//       }

//       // If old profilePic exists, delete it from Cloudinary
//       if (updatedUser.profilePic) {
//         const publicId = updatedUser.profilePic.split("/").pop().split(".")[0]; // Extract publicId
//         await cloudinary.uploader.destroy(publicId); // Delete old image from Cloudinary
//       }

//       res.status(200).json({
//         success: true,
//         message: "Profile picture updated successfully",
//         data: updatedUser,
//       });
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       return next(new AppError("Error uploading image to Cloudinary", 500));
//     }
//   });
// });
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
// delete user with id
// const deleteUser = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const checkId = mongoose.Types.ObjectId.isValid(id);
//   if (!checkId) {
//     return next(new AppError("Invalid user id, try Again", 400));
//   }

//   const user = await User.findByIdAndDelete(id);

//   if (!user) {
//     return next(new AppError(`user with ${id} id not found`, 404));
//   }
//   res.status(200).json("user deleted successfully");
// });
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
};
