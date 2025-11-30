import { userModel } from "../Database/Models/user.model.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/appError.js";

const createUser = asyncHandler(async (req, res, next) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (user) return next(new AppError("Email Already Exist", 409));
  let result = new userModel(req.body);
  await result.save();
  res.status(201).json({ message: "success", result });
});
export {
  createUser
}