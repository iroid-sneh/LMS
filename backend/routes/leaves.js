const express = require("express");
const { body, validationResult } = require("express-validator");
const Leave = require("../models/Leave");
const User = require("../models/User");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

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

      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start >= end) {
        return res
          .status(400)
          .json({ message: "End date must be after start date" });
      }

      const startDateOnly = new Date(start);
      startDateOnly.setHours(0, 0, 0, 0);
      if (startDateOnly < today) {
        return res
          .status(400)
          .json({ message: "Start date must be today or later" });
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const calculatedDuration = durationUnit === "hours" ? diffDays * 8 : diffDays;

      const leave = new Leave({
        employee: req.user._id,
        leaveType,
        startDate: start,
        endDate: end,
        duration: calculatedDuration,
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

router.get("/today", auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const leaves = await Leave.find({
      status: "approved",
      startDate: { $lte: endOfToday },
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

router.put(
  "/:id",
  auth,
  [
    body("leaveType")
      .optional()
      .isIn(["sick", "vacation", "personal", "emergency", "other"])
      .withMessage("Invalid leave type"),
    body("startDate").optional().isISO8601().withMessage("Invalid start date"),
    body("endDate").optional().isISO8601().withMessage("Invalid end date"),
    body("reason").optional().trim().isLength({ min: 10 }).withMessage("Reason must be at least 10 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const leave = await Leave.findById(req.params.id);

      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      if (leave.employee.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only edit your own leaves" });
      }

      if (leave.status !== "pending") {
        return res.status(400).json({ message: "Can only edit pending leave requests" });
      }

      const { leaveType, startDate, endDate, reason } = req.body;

      if (leaveType) {
        leave.leaveType = leaveType;
      }
      if (startDate) {
        const start = new Date(startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDateOnly = new Date(start);
        startDateOnly.setHours(0, 0, 0, 0);
        if (startDateOnly < today) {
          return res.status(400).json({ message: "Start date must be today or later" });
        }
        leave.startDate = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        leave.endDate = end;
      }
      if (reason) {
        leave.reason = reason;
      }

      if (leave.startDate && leave.endDate) {
        if (leave.startDate >= leave.endDate) {
          return res.status(400).json({ message: "End date must be after start date" });
        }
        const diffTime = Math.abs(leave.endDate.getTime() - leave.startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        leave.duration = diffDays;
      }

      await leave.save();
      await leave.populate("employee", "name email employeeId department position");

      res.json(leave);
    } catch (error) {
      console.error("Update leave error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete("/:id", auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only cancel your own leaves" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ message: "Can only cancel pending leave requests" });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.json({ message: "Leave request cancelled successfully" });
  } catch (error) {
    console.error("Delete leave error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate("employee", "name email employeeId department position")
      .populate("reviewedBy", "name email");

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

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
