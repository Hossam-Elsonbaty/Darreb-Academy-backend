import Lecture from "../models/Lecture.js";
import Chapter from "../models/Chapter.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadVideoToCloudinary } from "../config/cloudinary.js";

const createLecture = async (req, res) => {
  try {
    const { title, title_ar, chapterId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Video file is required" });
    }
    const uploaded = await uploadVideoToCloudinary(req.file.buffer);
    console.log(uploaded.public_id);
    
    const lecture = await Lecture.create({
      title,
      title_ar,
      videoUrl: uploaded.secure_url,
      duration: uploaded.duration,
      videoId: uploaded.public_id,
    });
    if (chapterId) {
      const chapter = await Chapter.findById(chapterId);
      if (chapter) {
        const order = chapter.lectures.length + 1;
        chapter.lectures.push({ lecture: lecture._id, order });
        await chapter.save();
      }
    }
    res.status(201).json(lecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLectureById = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (lecture) return res.json(lecture);
    res.status(404).json({ message: "Lecture not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });
    const { title, title_ar } = req.body;
    if (title) lecture.title = title;
    if (title_ar) lecture.title_ar = title_ar;
    if (req.file) {
      if (lecture.videoId) {
        await cloudinary.uploader.destroy(lecture.videoId, {
          resource_type: "video",
        });
      }
      const uploaded = await uploadVideoToCloudinary(req.file.buffer);
      lecture.videoUrl = uploaded.secure_url;
      lecture.duration = uploaded.duration;
      lecture.videoId = uploaded.public_id;
    }
    const updated = await lecture.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }
    
    // Delete video from Cloudinary if videoId exists
    if (lecture.videoId) {
      console.log(lecture.videoId); 
      
      try {
        await cloudinary.uploader.destroy(lecture.videoId, {
          resource_type: "video",
        });
        console.log(`Deleted video from Cloudinary: ${lecture.videoId}`);
      } catch (cloudinaryError) {
        console.error(`Failed to delete from Cloudinary: ${lecture.videoId}`, cloudinaryError.message);
        // Continue with lecture deletion even if Cloudinary deletion fails
      }
    } else {
      console.warn(`No videoId found for lecture ${lecture._id}`);
    }
    
    await lecture.deleteOne();
    res.json({ message: "Lecture removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllLectures = async (req, res) => {
  try {
    const { chapterId } = req.params;
    if (chapterId) {
      const chapter = await Chapter.findById(chapterId).populate("lectures.lecture");
      if (!chapter) return res.status(404).json({ message: "Chapter not found" });
      const lectures = chapter.lectures
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((l) => l.lecture);
      return res.json(lectures);
    }
    return res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createLecture,
  getAllLectures,
  getLectureById,
  updateLecture,
  deleteLecture,
};