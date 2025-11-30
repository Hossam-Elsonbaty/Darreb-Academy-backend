
import dotenv from "dotenv";  
import express from "express";
import cors from "cors";      
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js"; 
import authRoutes from "./routes/authRoutes.js"; 

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Course Management API is running" });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
