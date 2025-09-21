const express = require("express");
const { body, validationResult } = require("express-validator");
const Leave = require("../models/Leave");
const User = require("../models/User");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/leaves
// @desc    Apply for leave
// @access  Private
router.post(
  "/",
  auth,
  [
    body("leaveType")
      .isIn(["sick", "vacation", "personal", "emergency", "other"])
      .withMessage("Invalid leave type"),
    body("startDate").isISO8601().withMessage("Invalid start date"),
    body("endDate").isISO8601().withMessage("Invalid end date"),
    body("duration").isNumeric().withMessage("Duration must be a number"),
    body("durationUnit")
      .isIn(["hours", "days"])
      .withMessage("Invalid duration unit"),
    body("reason")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Reason must be at least 10 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { leaveType, startDate, endDate, duration, durationUnit, reason } =
        req.body;

      // Check if dates are valid
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res
          .status(400)
          .json({ message: "End date must be after start date" });
      }

      if (start < new Date()) {
        return res
          .status(400)
          .json({ message: "Cannot apply for leave in the past" });
      }

      const leave = new Leave({
        employee: req.user._id,
        leaveType,
        startDate: start,
        endDate: end,
        duration,
        durationUnit,
        reason,
      });

      await leave.save();
      await leave.populate(
        "employee",
        "name email employeeId department position",
      );

      res.status(201).json(leave);
    } catch (error) {
      console.error("Apply leave error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// @route   GET /api/leaves/my-leaves
// @desc    Get current user's leaves
// @access  Private
router.get("/my-leaves", auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .populate("employee", "name email employeeId department position")
      .populate("reviewedBy", "name email")
      .sort({ appliedAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("Get my leaves error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/leaves/all
// @desc    Get all leave requests (HR only)
// @access  Private (HR)
router.get("/all", auth, adminAuth, async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "name email employeeId department position")
      .populate("reviewedBy", "name email")
      .sort({ appliedAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("Get all leaves error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/leaves/today
// @desc    Get today's leaves
// @access  Private
router.get("/today", auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const leaves = await Leave.find({
      status: "approved",
      startDate: { $lte: today },
      endDate: { $gte: today },
    })
      .populate("employee", "name email employeeId department position")
      .sort({ startDate: 1 });

    res.json(leaves);
  } catch (error) {
    console.error("Get today leaves error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/leaves/:id/approve
// @desc    Approve leave request (HR only)
// @access  Private (HR)
router.put(
  "/:id/approve",
  auth,
  adminAuth,
  [body("adminComment").optional().trim()],
  async (req, res) => {
    try {
      const { adminComment } = req.body;
      const leave = await Leave.findById(req.params.id);

      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      if (leave.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Leave request has already been processed" });
      }

      leave.status = "approved";
      leave.adminComment = adminComment;
      leave.reviewedBy = req.user._id;
      leave.reviewedAt = new Date();

      await leave.save();
      await leave.populate(
        "employee",
        "name email employeeId department position",
      );
      await leave.populate("reviewedBy", "name email");

      res.json(leave);
    } catch (error) {
      console.error("Approve leave error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// @route   PUT /api/leaves/:id/reject
// @desc    Reject leave request (HR only)
// @access  Private (HR)
router.put(
  "/:id/reject",
  auth,
  adminAuth,
  [
    body("rejectedReason")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Rejection reason must be at least 5 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { rejectedReason, adminComment } = req.body;
      const leave = await Leave.findById(req.params.id);

      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      if (leave.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Leave request has already been processed" });
      }

      leave.status = "rejected";
      leave.rejectedReason = rejectedReason;
      leave.adminComment = adminComment;
      leave.reviewedBy = req.user._id;
      leave.reviewedAt = new Date();

      await leave.save();
      await leave.populate(
        "employee",
        "name email employeeId department position",
      );
      await leave.populate("reviewedBy", "name email");

      res.json(leave);
    } catch (error) {
      console.error("Reject leave error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// @route   GET /api/leaves/:id
// @desc    Get single leave request
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate("employee", "name email employeeId department position")
      .populate("reviewedBy", "name email");

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Check if user can access this leave request
    if (
      req.user.role !== "hr" &&
      leave.employee._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(leave);
  } catch (error) {
    console.error("Get leave error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
