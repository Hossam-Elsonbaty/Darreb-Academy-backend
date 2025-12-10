import Chapter from "../models/Chapter";
import asyncHandler from "express-async-handler";


export const getAllChapters = asyncHandler(async (req, res) => {
  const chapters = await Chapter.find();
  res.status(200).json({ data: chapters });
});

const createChapter = async (req, res) => {
  try {
    const { title, title_ar, duration, order, courseId } = req.body;

    const chapter = await Chapter.create({
      title,
      title_ar,
      duration:duration| null,
      order:order + 1,
    });

    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) {
        course.chapters.push({ chapter: chapter._id, order });
        await course.save();
      }
    }

    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate("lectures.lecture");

    if (chapter) {
      res.json(chapter);
    } else {
      res.status(404).json({ message: "Chapter not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    Object.assign(chapter, req.body);
    const updatedChapter = await chapter.save();

    res.json(updatedChapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    await chapter.deleteOne();
    res.json({ message: "Chapter removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllChapters,
  getChapterById,
  deleteChapter,
  createChapter,
  updateChapter
}