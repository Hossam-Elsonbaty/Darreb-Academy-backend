import Chapter from "../models/Chapter.js";
import Course from "../models/Course.js";

// Helper: calculate chapter duration
async function calculateChapterDuration(chapterId) {
  const chapter = await Chapter.findById(chapterId).populate("lectures.lecture");
  if (!chapter) return 0;

  const duration = chapter.lectures.reduce((total, item) => {
    return total + (item.lecture?.duration || 0);
  }, 0);

  return duration;
}

// Helper: get next order index
async function getNextChapterOrder(courseId) {
  const course = await Course.findById(courseId).populate("chapters.chapter");
  if (!course || !course.chapters.length) return 1;

  return course.chapters.length + 1;
}
export {calculateChapterDuration,getNextChapterOrder}
