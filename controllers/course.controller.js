import Course from "../models/Course.js";

const createCourse = async (req, res) => {
  try {
    const {
      title,
      title_ar,
      description,
      description_ar,
      price,
      thumbnail,
      category,
      level,
      duration,
    } = req.body;
    const course = await Course.create({
      title,
      title_ar,
      description,
      description_ar,
      instructor: req.user._id,
      price,
      thumbnail,
      category,
      level,
      duration,
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "fullName email")
      .populate("category", "name name_ar")
      .populate({
        path: "chapters.chapter",
        populate: {
          path: "lectures.lecture",
        },
      });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this course" });
    }

    await course.deleteOne();
    res.json({ message: "Course removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createCourse,
  getAllCourses,
  deleteCourse
}