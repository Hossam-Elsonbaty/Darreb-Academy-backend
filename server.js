import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config();
const app = express();
// app.use(cors());
// app.use(cors({
//   origin: [
//     'http://localhost:4200',
//     'http://localhost:3000',
//     'http://localhost:3001',
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));


const allowedOrigins = [
  'http://localhost:4200',  // Angular default
  'http://localhost:3000',  // If you serve frontend here sometimes
  'http://localhost:3001',  // Extra dev ports
  'http://127.0.0.1:4200',  // Sometimes needed
];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Course Management API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
