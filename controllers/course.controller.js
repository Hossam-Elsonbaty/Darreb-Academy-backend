import Course from "../models/Course";

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

export {
  createCourse,
  getAllCourses,
}