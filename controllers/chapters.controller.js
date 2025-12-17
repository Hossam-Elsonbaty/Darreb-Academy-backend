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
const getCourseChapters = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId).populate({
    path: "chapters.chapter",
    populate: {
      path: "lectures.lecture",
      select: "title title_ar duration",
    },
  });

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const modifiedChapters = course.chapters.map((item) => {
    const chapter = item.chapter;

    let totalDuration = 0; // seconds
    let totalLectures = 0;

    const lectures = chapter.lectures
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    lectures.forEach((l) => {
      if (l.lecture) {
        totalDuration += l.lecture.duration || 0;
        totalLectures += 1;
      }
    });

    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const seconds = totalDuration % 60;

    return {
      ...chapter.toObject(),
      lectures,
      totalLectures,
      totalDurationInSeconds: totalDuration,
      totalDuration: `${hours} h ${minutes} min ${seconds} sec`,
    };
  });

  res.status(200).json({
    courseId,
    totalChapters: modifiedChapters.length,
    data: modifiedChapters,
  });
});


// const getAllChapters = asyncHandler(async (req, res) => {
//   const chapters = await Chapter.find();
//   res.status(200).json({ data: chapters });
// });
const getAllChapters = asyncHandler(async (req, res) => {
  const chapters = await Chapter.find()
    .populate({
      path: "lectures.lecture",
      select: "duration title title_ar",
    });
  const modifiedChapters = chapters.map((chapter) => {
    let totalDuration = 0; // seconds
    let totalLectures = 0;
    // console.log(chapter);
    
    chapter.lectures.forEach((item) => {
      console.log(item);
      
      if (item.lecture) {
        totalDuration += item.lecture.duration || 0;
        totalLectures += 1;
      }
    });
    // seconds → h : m : s
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const seconds = totalDuration % 60;
    return {
      ...chapter.toObject(),
      totalDurationInSeconds: totalDuration,
      totalDuration: `${hours} h ${minutes} min ${seconds} sec`,
      totalLectures,
    };
  });
  res.status(200).json({ data: modifiedChapters });
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
  getCourseChapters,
  getChapterById,
  deleteChapter,
  createChapter,
  updateChapter,
  getAllChapters
}