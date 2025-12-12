import Chapter from "../models/Chapter.js";
import asyncHandler from "express-async-handler";
import Course from "../models/Course.js";
import { calculateChapterDuration, getNextChapterOrder } from "../helpers/chapter.helper.js";

const createChapter = asyncHandler(async (req, res) => {
  const { title, title_ar, courseId } = req.body;
  if (!courseId) {
    return res.status(400).json({ message: "courseId is required" });
  }
  const nextOrder = await getNextChapterOrder(courseId);
  const chapter = await Chapter.create({
    title,
    title_ar,
    duration: 0, 
    order: nextOrder,
    lectures: []
  });
  const course = await Course.findById(courseId);
  course.chapters.push({ chapter: chapter._id, order: nextOrder });
  await course.save();
  res.status(201).json(chapter);
});


const getAllChapters = asyncHandler(async (req, res) => {
  const chapters = await Chapter.find();
  res.status(200).json({ data: chapters });
});


const getChapterById = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id)
    .populate("lectures.lecture");
  if (!chapter) {
    return res.status(404).json({ message: "Chapter not found" });
  }
  res.json(chapter);
});

const updateChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  if (!chapter) {
    return res.status(404).json({ message: "Chapter not found" });
  }
  Object.assign(chapter, req.body);
  chapter.duration = await calculateChapterDuration(chapter._id);
  const updated = await chapter.save();
  res.json(updated);
});

const deleteChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  if (!chapter) {
    return res.status(404).json({ message: "Chapter not found" });
  }
  await Course.updateMany(
    { "chapters.chapter": chapter._id },
    { $pull: { chapters: { chapter: chapter._id } } }
  );
  await chapter.deleteOne();
  res.json({ message: "Chapter removed" });
});


export {
  getChapterById,
  deleteChapter,
  createChapter,
  updateChapter,
  getAllChapters
}