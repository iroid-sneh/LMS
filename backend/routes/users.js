const express = require("express");
const User = require("../models/User");
const Leave = require("../models/Leave");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/users/employees
// @desc    Get all employees (HR only)
// @access  Private (HR)
router.get("/employees", auth, adminAuth, async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .select("-password")
      .sort({ name: 1 });

    res.json(employees);
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalLeaves = await Leave.countDocuments({ employee: userId });
    const approvedLeaves = await Leave.countDocuments({
      employee: userId,
      status: "approved",
    });
    const pendingLeaves = await Leave.countDocuments({
      employee: userId,
      status: "pending",
    });
    const rejectedLeaves = await Leave.countDocuments({
      employee: userId,
      status: "rejected",
    });

    res.json({
      totalLeaves,
      approvedLeaves,
      pendingLeaves,
      rejectedLeaves,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/users/admin-stats
// @desc    Get admin statistics (HR only)
// @access  Private (HR)
router.get("/admin-stats", auth, adminAuth, async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: "pending" });
    const approvedLeaves = await Leave.countDocuments({ status: "approved" });
    const rejectedLeaves = await Leave.countDocuments({ status: "rejected" });

    // Today's leaves
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLeaves = await Leave.find({
      status: "approved",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).populate("employee", "name email employeeId department position");

    res.json({
      totalEmployees,
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      todayLeaves: todayLeaves.length,
      todayLeavesDetails: todayLeaves,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
