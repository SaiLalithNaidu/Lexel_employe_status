const mongoose = require("mongoose");

const taskEditHistorySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fieldChanged: {
    type: String,
    required: true,
  },
  oldValue: {
    type: String,
    default: "",
  },
  newValue: {
    type: String,
    default: "",
  },
  editedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TaskEditHistory", taskEditHistorySchema);
