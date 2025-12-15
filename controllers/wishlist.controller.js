import Wishlist from "../models/Wishlist.js";
import Course from "../models/Course.js";

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("items.course");

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    const itemExists = wishlist.items.find(
      (item) => item.course.toString() === courseId
    );

    if (itemExists) {
      return res.status(400).json({ message: "Course already in wishlist" });
    }

    wishlist.items.push({ course: courseId });
    await wishlist.save();
    await wishlist.populate("items.course");

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.course.toString() !== courseId
    );

    await wishlist.save();
    await wishlist.populate("items.course");

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export  {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
