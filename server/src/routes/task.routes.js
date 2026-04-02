const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const taskController = require("../controllers/task.controller");
const auth = require("../middleware/auth");

router.use(auth);

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

router.put("/:id", taskController.updateTask);
router.get("/:id", taskController.getTask);
router.get("/:id/history", taskController.getTaskHistory);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
