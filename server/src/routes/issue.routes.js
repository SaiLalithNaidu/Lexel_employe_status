const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const issueController = require("../controllers/issue.controller");
const auth = require("../middleware/auth");

router.use(auth);

// Create issue
router.post(
  "/",
  [body("title").trim().notEmpty().withMessage("Title is required")],
  (req, res, next) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  issueController.createIssue,
);

// Get my issues
router.get("/", issueController.getMyIssues);

// Get issue stats
router.get("/stats", issueController.getIssueStats);

// Get issues by user ID
router.get("/user/:userId", issueController.getIssuesByUser);

// Get issue stats by user ID
router.get("/user/:userId/stats", issueController.getIssueStatsByUser);

// Get single issue
router.get("/:id", issueController.getIssue);

// Update issue
router.put("/:id", issueController.updateIssue);

// Delete issue
router.delete("/:id", issueController.deleteIssue);

module.exports = router;
