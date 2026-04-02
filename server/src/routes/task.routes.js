const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const taskController = require("../controllers/task.controller");
const auth = require("../middleware/auth");

router.use(auth);

// ===== CREATE & SEARCH =====
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("taskDate").notEmpty().withMessage("Task date is required"),
  ],
  (req, res, next) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  taskController.createTask,
);

// ===== SPECIAL ROUTES (before :id routes) =====
// Get my tasks
router.get("/me/tasks", taskController.getMyTasks);

// Get team tasks
router.get("/team/tasks", taskController.getTeamTasks);

// ===== TASK-SPECIFIC ROUTES =====
router.put("/:id", taskController.updateTask);
router.get("/:id", taskController.getTask);
router.get("/:id/history", taskController.getTaskHistory);
router.delete("/:id", taskController.deleteTask);

// ===== NEW: FORWARDING & COLLABORATION =====

// Forward task
router.post(
  "/:id/forward",
  [
    body("forwardTo").notEmpty().withMessage("Forward to user is required"),
    body("forwardingReason").isIn(["completed", "blocked", "help_needed", "for_review", "ready_for_testing", "reassigned"]).withMessage("Invalid forwarding reason"),
  ],
  (req, res, next) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  taskController.forwardTask
);

// Add comment
router.post(
  "/:id/comments",
  [
    body("content").trim().notEmpty().withMessage("Comment content is required"),
  ],
  (req, res, next) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  taskController.addComment
);

module.exports = router;
