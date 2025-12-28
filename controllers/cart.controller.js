import Cart from "../models/Cart.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";
import User from "../models/User.js";


const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.course"
    );
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    let cart = await Cart.findOne({ user: req.user._id });
    let user = await User.findById(req.user._id) ;
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }
    const itemExists = cart.items.find(
      (item) => item.course.toString() === courseId
    );
    if (itemExists) {
      return res.status(400).json({ message: "Course already in cart" });
    }
    const itemPurchased = user.purchasedCourses.includes(courseId);
    if (itemPurchased) {
      return res.status(400).json({ message: "Course already Purchased" });
    }
    cart.items.push({ course: courseId });
    cart.totalPrice += course.price;
    await cart.save();
    await cart.populate("items.course");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  remove from cart
const removeFromCart = async (req, res) => {
  const { id: courseId } = req.params;
  const userId = req.user._id;

  try {
    // 1. Validate ObjectId early
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course ID format." });
    }

    // 2. Find cart and populate course prices to ensure total price is calculated correctly
    // Alternatively, if you store 'price' inside the items array, you don't need populate.
    const cart = await Cart.findOne({ user: userId }).populate('items.course', 'price');

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // 3. Check if the item exists in the cart
    const itemIndex = cart.items.findIndex(item => item.course._id.toString() === courseId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Course not found in your cart." });
    }

    // 4. Extract price and remove item
    // Note: We access .price from the populated course object
    const itemPrice = cart.items[itemIndex].course.price || 0;
    
    // Mongoose pull is cleaner than splice for arrays of subdocuments
    cart.items.splice(itemIndex, 1);
    
    // 5. Update Total Price (with a check to prevent negative balances)
    cart.totalPrice = Math.max(0, cart.totalPrice - itemPrice);

    await cart.save();
    await cart.populate("items.course");
    // 6. Return response
    return res.status(200).json({
      success: true,
      message: "Course removed successfully",
      data: cart
    });

  } catch (error) {
    console.error("RemoveFromCart Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// const removeFromCart = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const checkId = mongoose.Types.ObjectId.isValid(id);
//     if (!checkId) {
//       return res.status(400).json({
//         message: "Invalid Category id, try Again",
//       });
//     }
//     await Cart.deleteOne({ _id: id });
//     res.status(200).json({
//       message: "Course delete successfully from cart",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };


//  clear cart

const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({});
    res.status(200).json({
      message: "All Courses deleted successfully from cart",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { addToCart, getCart, removeFromCart, clearCart };
