import mongoose from "mongoose";
import Category from "../models/Category.js";

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create category

const createCategory = async (req, res) => {
  const { name, name_ar, description, description_ar } = req.body;
  try {
    const category = new Category({
      name,
      name_ar,
      description,
      description_ar,
    });

    await category.save();

    res.status(201).json({
      message: "New Category created successfully",
      data:category
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// update category
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, name_ar, description, description_ar } = req.body;
  try {
    const checkId = mongoose.Types.ObjectId.isValid(id);
    if (!checkId) {
      return res.status(400).json({
        message: "Invalid Category id, try Again",
      });
    }
    const category = await Category.findById(id);
    // let updatedCategory = {
    //   name: name|| category.name,
    //   name_ar: name_ar || category.name_ar,
    //   description: description || category.description,
    //   description_ar: description_ar || category.description_ar,
    // };

    // await Category.findByIdAndUpdate({ _id: id }, updatedCategory, {
    //   new: true,
    // });
    const updateObj = {};
    if (name) updateObj.name = name;
    if (name_ar) updateObj.name_ar = name_ar;
    if (description) updateObj.description = description;
    if (description_ar) updateObj.description_ar = profilePic;
    const updatedCategory = await category.findByIdAndUpdate({ _id: id }, updateObj, {
      new: true,
    });
    res.status(201).json({
      message: "category updated successfully",
      data:updatedCategory
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//  delete category
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const checkId = mongoose.Types.ObjectId.isValid(id);
    if (!checkId) {
      return res.status(400).json({
        message: "Invalid Category id, try Again",
      });
    }

    await Category.deleteOne({ _id: id });
    res.status(200).json({
      message: "Category is deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
