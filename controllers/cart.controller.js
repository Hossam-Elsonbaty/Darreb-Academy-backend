import Cart from "../models/Cart";
import Course from "../models/Course";

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
    cart.items.push({ course: courseId });
    cart.totalPrice += course.price;
    await cart.save();
    await cart.populate("items.course");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export{
  addToCart,
  getCart
}