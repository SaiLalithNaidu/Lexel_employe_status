const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // Core Fields (Existing)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: [
        "yet_to_start",
        "pending",
        "in_progress",
        "completed",
        "on_hold",
        "forwarded",
        "blocked",
      ],
      default: "yet_to_start",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    taskType: {
      type: String,
      enum: ["current", "future"],
      default: "current",
    },
    taskDate: {
      type: Date,
      required: [true, "Task date is required"],
    },

    // NEW: Admin Assignment Fields
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isAdminAssigned: {
      type: Boolean,
      default: false,
    },

    // NEW: Task Details
    category: {
      type: String,
      enum: ["feature", "bug", "testing", "documentation", "learning", "other"],
      default: "other",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    estimatedDuration: {
      type: Number, // in hours
      default: null,
    },
    actualDuration: {
      type: Number, // in hours
      default: null,
    },

    // Git Issue Tracking
    gitIssueUrl: {
      type: String,
      default: null,
      trim: true,
    },
    gitIssueNumber: {
      type: String,
      default: null,
      trim: true,
    },
    gitRepository: {
      type: String,
      default: null,
      trim: true,
    },

    // NEW: Subtasks
    subtasks: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: {
          type: String,
          required: true,
          maxlength: 150,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // NEW: Forwarding System
    forwardedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    forwardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    forwardedAt: {
      type: Date,
      default: null,
    },
    forwardingReason: {
      type: String,
      enum: [
        "completed",
        "blocked",
        "help_needed",
        "for_review",
        "ready_for_testing",
        "reassigned",
      ],
      default: null,
    },
    forwardingNotes: {
      type: String,
      maxlength: 500,
      default: null,
    },

    // NEW: Collaboration
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskComment",
      },
    ],
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskAttachment",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ forwardedTo: 1 });
taskSchema.index({ taskDate: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ status: 1 });

module.exports = mongoose.model("Task", taskSchema);
