import User from "../models/User.js";
import Course from "../models/Course.js";
import Order from "../models/Order.js"; // Assuming you have an Order model that tracks purchases
import mongoose from "mongoose";

const getAnalytics = async (req, res) => {
  try {
    // Total Users
    const totalUsers = await User.countDocuments();

    // Total Courses
    const totalCourses = await Course.countDocuments();

    // Number of Purchased Courses
    const purchasedCourses = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $unwind: "$items" },
      { $group: { _id: null, totalPurchased: { $sum: 1 } } },
    ]);

    // Total Income from Purchased Courses
    const totalIncome = await Order.aggregate([
      { $match: { paymentStatus: "completed" } }, // Only completed orders
      { $unwind: "$items" },
      { $group: { _id: null, totalIncome: { $sum: "$items.price" } } },
    ]);

    // Purchases Overview (by month)
    const purchasesOverview = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $unwind: "$items" },
      {
        $group: { _id: { $month: "$createdAt" }, totalPurchases: { $sum: 1 } },
      },
      { $sort: { _id: 1 } }, // Sort by month
    ]);

    const purchasesByCategory = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },

      { $unwind: "$items" },

      {
        $lookup: {
          from: "courses",
          localField: "items.course",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },

      {
        $lookup: {
          from: "categories",
          localField: "course.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      {
        $group: {
          _id: "$category.name",
          totalPurchases: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          category: "$_id",
          totalPurchases: 1,
        },
      },
    ]);

    const recentPurchases = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },

      { $sort: { createdAt: -1 } },
      { $limit: 5 },

      { $unwind: "$items" },

      {
        $lookup: {
          from: "courses",
          localField: "items.course",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      {
        $project: {
          _id: 1,
          createdAt: 1,
          items: {
            courseId: "$course._id",
            courseTitle: "$course.title",
            price: "$items.price",
          },
          userDetails: {
            fullName: "$user.fullName",
            email: "$user.email",
          },
        },
      },
    ]);

    // Send response with all aggregated data
    res.status(200).json({
      totalUsers,
      totalCourses,
      purchasedCourses: purchasedCourses[0]?.totalPurchased || 0,
      totalIncome: totalIncome[0]?.totalIncome || 0,
      purchasesOverview,
      purchasesByCategory,
      recentPurchases,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching analytics data" });
  }
};

export { getAnalytics };
