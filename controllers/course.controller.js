import Course from "../models/Course.js";
import Lecture from "../models/Lecture.js";
import Chapter from "../models/Chapter.js";
import {upload} from '../middleware/imageUpload.js';
import {uploadToCloudinary} from '../config/cloudinary.js'; // Upload function
import User from "../models/User.js";

const createCourse = async (req, res) => {
  try {
    // Handle file upload via Multer
    console.log(req.user);
    
    upload.single('thumbnail')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      // Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      // Create new course
      const course = await new Course({
        title: req.body.title,
        title_ar: req.body.title_ar,
        description: req.body.description,
        description_ar: req.body.description_ar,
        instructor: req.user._id,
        price: req.body.price,
        level: req.body.level,
        isPublished:req.body.isPublished === "true",
        category: req.body.category,
        thumbnail: imageUrl // Save the Cloudinary URL
      });
      await course.save();
      return res.status(201).json({ message: 'Course created successfully', course });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Handle file upload via Multer (only if the file is provided)
    upload.single('thumbnail')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      // Log body and uploaded file to debug
      console.log('Request Body:', req.body);
      console.log('Uploaded File:', req.file);

      // Destructure non-file fields from req.body after multer processes the form data
      const { title, title_ar, description, description_ar, price, level, category, isPublished } = req.body;

      // If a new thumbnail is provided, upload to Cloudinary and get the URL
      if (req.file) {
        try {
          // Upload image to Cloudinary
          const imageUrl = await uploadToCloudinary(req.file.buffer);
          course.thumbnail = imageUrl;  // Update the thumbnail field
        } catch (cloudinaryError) {
          return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
        }
      }

      // Update the other fields of the course
      course.title = title || course.title;
      course.title_ar = title_ar || course.title_ar;
      course.description = description || course.description;
      course.description_ar = description_ar || course.description_ar;
      course.price = price || course.price;
      course.level = level || course.level;
      course.category = category || course.category;
      course.isPublished = isPublished !== undefined ? isPublished : course.isPublished;

      // Save the updated course
      const updatedCourse = await course.save();
      return res.status(200).json(updatedCourse);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}
// const getAllCourses = async (req, res) => {
//   try {
//     const courses = await Course.find()
//       .populate("instructor", "fullName email")
//       .populate("category", "name name_ar")
//       .populate({
//         path: "chapters.chapter",
//         populate: {
//           path: "lectures.lecture",
//         },
//       });
//     res.json(courses);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
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

    // Modify each course to include total duration and total lectures
    const modifiedCourses = courses.map((course) => {
      let totalDuration = 0; // In minutes
      let totalLectures = 0;

      // Calculate total duration and total number of lectures
      course.chapters.forEach((chapter) => {
        chapter.chapter?.lectures?.forEach((lecture) => {
          console.log(lecture);
          
          // Assuming the lecture has a 'duration' field in minutes
          totalDuration += lecture?.lecture?.duration || 0;
          totalLectures += 1; // Count each lecture
        });
      });

      // Convert total duration from minutes to hours and minutes
      // const hours = Math.floor(totalDuration / 60 / 60);
      // const minutes = totalDuration % 60;
      // const seconds = totalDuration;
      console.log(totalDuration);
      const hours = Math.floor(totalDuration / 3600);
      const minutes = Math.floor((totalDuration % 3600) / 60);
      const seconds = totalDuration % 60;
      return {
        ...course.toObject(), // Convert the Mongoose object to a plain JS object
        totalDuration: `${hours} h ${minutes} min ${seconds} sec`,
        totalLectures,
      };
    });

    res.json(modifiedCourses);
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
const getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    // Check if the course exists
    const course = await Course.findById(courseId)
      .populate("instructor", "fullName email")
      .populate("category", "_id")
      .populate({
        path: "chapters.chapter",
        populate: {
          path: "lectures.lecture",
        },
      });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    let totalDuration = 0; // In minutes
    let totalLectures = 0;
    course.chapters.forEach((chapter) => {
      chapter.chapter.lectures.forEach((lecture) => {
        // Assuming the lecture has a 'duration' field in minutes
        totalDuration += lecture.lecture.duration || 0;
        totalLectures += 1; // Count each lecture
      });
    });
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;
    const modifiedCourse = {
      ...course.toObject(), 
      totalDuration: `${hours} h ${minutes} min`,
      totalLectures,
    };
    // Return the modified course data
    return res.status(200).json(modifiedCourse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getPurchasedCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "purchasedCourses",
      populate: [
        { path: "category", select: "name" },
        { path: "instructor", select: "name email" },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      count: user.purchasedCourses.length,
      courses: user.purchasedCourses,
    });
  } catch (error) {
    console.error("Get purchased courses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export {
  createCourse,
  updateCourse,
  getAllCourses,
  deleteCourse,
  getCourse,
  getPurchasedCourses
}