const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const adminController = require("../controllers/admin.controller");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

router.use(auth, adminAuth);

// ===== USER MANAGEMENT (Existing) =====
router.get("/pending-users", adminController.getPendingUsers);
router.put("/users/:id/approve", adminController.approveUser);
router.put("/users/:id/reject", adminController.rejectUser);
router.get("/users", adminController.getAllUsers);

// ===== NEW: TASK MANAGEMENT =====

// Create and assign task
router.post(
  "/tasks",
  [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("selectedEmployees").isArray().withMessage("Selected employees must be an array"),
    body("priority").isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
  ],
  (req, res, next) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  adminController.createTaskForEmployee
);

// Get all assigned tasks with filters
router.get("/tasks", adminController.getAllAssignedTasks);

// Update task
router.put("/tasks/:id", adminController.updateTask);

// ===== NEW: EMPLOYEE MANAGEMENT =====

// Get all employees with stats
router.get("/employees", adminController.getEmployeesWithStats);

// Get employee detail
router.get("/employees/:id", adminController.getEmployeeDetail);

// ===== NEW: ANALYTICS =====

// Get performance analytics
router.get("/analytics/metrics", adminController.getAnalytics);

module.exports = router;
