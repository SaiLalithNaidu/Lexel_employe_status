const mongoose = require("mongoose");

const gitIssueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    issueUrl: {
      type: String,
      trim: true,
      default: null,
    },
    issueNumber: {
      type: String,
      trim: true,
      default: null,
    },
    repository: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "fixed", "closed", "wont_fix"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    type: {
      type: String,
      enum: [
        "bug",
        "enhancement",
        "feature",
        "documentation",
        "security",
        "performance",
      ],
      default: "bug",
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    linkedTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    fixedAt: {
      type: Date,
      default: null,
    },
    fixNotes: {
      type: String,
      maxlength: 1000,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
gitIssueSchema.index({ userId: 1, status: 1 });
gitIssueSchema.index({ repository: 1 });
gitIssueSchema.index({ status: 1 });
gitIssueSchema.index({ priority: 1 });

module.exports = mongoose.model("GitIssue", gitIssueSchema);
