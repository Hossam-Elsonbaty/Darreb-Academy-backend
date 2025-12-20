import Review from "../models/Review.js";
import Course from "../models/Course.js";

const createReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;
    const user = await User.findById(req.user._id);
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (!user.purchasedCourses.includes(courseId)) {
      return res.status(403).json({ message: "You must purchase the course to leave a review" });
    }
    const existingReview = await Review.findOne({
      course: courseId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You already reviewed this course" });
    }

    const review = await Review.create({
      course: courseId,
      user: req.user._id,
      rating,
      comment,
    });

    const reviews = await Review.find({ course: courseId });
    const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
    course.rating = totalRating / reviews.length;
    course.totalRatings = reviews.length;

    await course.save();
    await review.populate("user", "fullName email");

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await Review.find({ course: courseId })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this review" });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    const updatedReview = await review.save();

    const reviews = await Review.find({ course: review.course });
    const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);

    const course = await Course.findById(review.course);
    course.rating = totalRating / reviews.length;
    course.totalRatings = reviews.length;
    await course.save();

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    const courseId = review.course;
    await review.deleteOne();

    const reviews = await Review.find({ course: courseId });
    const course = await Course.findById(courseId);

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
      course.rating = totalRating / reviews.length;
      course.totalRatings = reviews.length;
    } else {
      course.rating = 0;
      course.totalRatings = 0;
    }

    await course.save();

    res.json({ message: "Review removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
};
