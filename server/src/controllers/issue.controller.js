const GitIssue = require("../models/GitIssue");

// POST /api/issues
exports.createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      issueUrl,
      issueNumber,
      repository,
      status,
      priority,
      type,
      labels,
      linkedTaskId,
      userId: targetUserId,
    } = req.body;

    // Use provided userId if given, otherwise use logged-in user
    const userId = targetUserId || req.user._id;

    const issue = await GitIssue.create({
      userId,
      title,
      description,
      issueUrl,
      issueNumber,
      repository,
      status: status || "open",
      priority: priority || "medium",
      type: type || "bug",
      labels: labels || [],
      linkedTaskId,
    });

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/issues
exports.getMyIssues = async (req, res) => {
  try {
    const { status, priority, type, repository } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (repository) filter.repository = repository;

    const issues = await GitIssue.find(filter)
      .populate("linkedTaskId", "title status")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/issues/stats
exports.getIssueStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [stats] = await GitIssue.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          fixed: { $sum: { $cond: [{ $eq: ["$status", "fixed"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
          critical: {
            $sum: { $cond: [{ $eq: ["$priority", "critical"] }, 1, 0] },
          },
          high: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
          bugs: { $sum: { $cond: [{ $eq: ["$type", "bug"] }, 1, 0] } },
          features: { $sum: { $cond: [{ $eq: ["$type", "feature"] }, 1, 0] } },
        },
      },
    ]);

    res.json(
      stats || {
        total: 0,
        open: 0,
        inProgress: 0,
        fixed: 0,
        closed: 0,
        critical: 0,
        high: 0,
        bugs: 0,
        features: 0,
      },
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/issues/:id
exports.getIssue = async (req, res) => {
  try {
    const issue = await GitIssue.findById(req.params.id)
      .populate("userId", "firstName lastName email")
      .populate("linkedTaskId", "title status");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/issues/:id
exports.updateIssue = async (req, res) => {
  try {
    const issue = await GitIssue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Check ownership
    if (issue.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If marking as fixed, set fixedAt
    if (req.body.status === "fixed" && issue.status !== "fixed") {
      req.body.fixedAt = new Date();
    }

    const updatedIssue = await GitIssue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/issues/:id
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await GitIssue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (issue.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await GitIssue.findByIdAndDelete(req.params.id);
    res.json({ message: "Issue deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/issues/user/:userId - Get issues by user ID
exports.getIssuesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, priority, type, repository } = req.query;
    const filter = { userId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (repository) filter.repository = repository;

    const issues = await GitIssue.find(filter)
      .populate("linkedTaskId", "title status")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/issues/user/:userId/stats - Get issue stats by user ID
exports.getIssueStatsByUser = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const [stats] = await GitIssue.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          fixed: { $sum: { $cond: [{ $eq: ["$status", "fixed"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
          critical: {
            $sum: { $cond: [{ $eq: ["$priority", "critical"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json(
      stats || {
        total: 0,
        open: 0,
        inProgress: 0,
        fixed: 0,
        closed: 0,
        critical: 0,
      },
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
