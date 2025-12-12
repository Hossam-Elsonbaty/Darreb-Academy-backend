import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.Routes.js";
import usersRoutes from "./routes/users.Routes.js";
import categoryRoutes from "./routes/category.Routes.js";
import cartRoutes from "./routes/cart.Routes.js";
import coursesRoutes from "./routes/courses.Routes.js";
import chapterRoutes from "./routes/chapter.Routes.js";
import lectureRoutes from "./routes/lecture.Routes.js";

dotenv.config();
const app = express();

const corsOptions = {
  origin: [
  'http://localhost:4200',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3001',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*',
};

app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Course Management API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/uploads", express.static("uploads"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log('Cloudinary Name:', process.env.CLOUDINARY_NAME);
  console.log('Cloudinary API Key:', process.env.CLOUDINARY_KEY);
  console.log('Cloudinary API Secret:', process.env.CLOUDINARY_SECRET);

  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
