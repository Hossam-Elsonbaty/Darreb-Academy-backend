import mongoose from "mongoose";
import Lecture from "../models/Lecture.js";
import dotenv from "dotenv";

dotenv.config();

const fixMissingVideoIds = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all lectures without videoId
    const lecturesWithoutVideoId = await Lecture.find({ videoId: { $exists: false } });
    console.log(`Found ${lecturesWithoutVideoId.length} lectures without videoId`);

    if (lecturesWithoutVideoId.length === 0) {
      console.log("No lectures missing videoId. All good!");
      await mongoose.connection.close();
      return;
    }

    // Display lectures that need fixing
    lecturesWithoutVideoId.forEach((lecture) => {
      console.log(`\nLecture ID: ${lecture._id}`);
      console.log(`Title: ${lecture.title}`);
      console.log(`Video URL: ${lecture.videoUrl}`);
      // Extract public_id from secure_url if possible
      // Cloudinary URL format: https://res.cloudinary.com/{cloud}/video/upload/v{version}/{public_id}
      if (lecture.videoUrl) {
        const urlParts = lecture.videoUrl.split("/");
        const publicId = urlParts[urlParts.length - 1]?.split(".")[0];
        console.log(`Extracted public_id: ${publicId}`);
      }
    });

    console.log("\n⚠️ MANUAL ACTION REQUIRED:");
    console.log("You need to extract the public_id from each video URL above.");
    console.log("For Cloudinary URLs like: https://res.cloudinary.com/cloud/video/upload/v1234/lectures/abc123");
    console.log("The public_id is: lectures/abc123");
    console.log("\nUpdate the lecture documents with the correct videoId field.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

fixMissingVideoIds();
