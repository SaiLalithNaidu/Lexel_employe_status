const mongoose = require("mongoose");

const taskAttachmentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task ID is required"],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploaded by user ID is required"],
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    fileType: {
      type: String,
      required: true,
      enum: ["image", "document", "video", "code", "other"],
    },
    fileSize: {
      type: Number, // in bytes
      required: [true, "File size is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
taskAttachmentSchema.index({ taskId: 1 });
taskAttachmentSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model("TaskAttachment", taskAttachmentSchema);
