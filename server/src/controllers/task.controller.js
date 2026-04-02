const Task = require("../models/Task");
const TaskEditHistory = require("../models/TaskEditHistory");

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, taskType, taskDate } =
      req.body;

    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      status,
      priority,
      taskType,
      taskDate,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const fieldsToTrack = [
      "title",
      "description",
      "status",
      "priority",
      "taskType",
      "taskDate",
    ];
    const historyEntries = [];

    for (const field of fieldsToTrack) {
      if (req.body[field] !== undefined) {
        const oldVal =
          field === "taskDate"
            ? task[field]?.toISOString?.() || String(task[field])
            : String(task[field]);
        const newVal = String(req.body[field]);

        if (oldVal !== newVal) {
          historyEntries.push({
            taskId: task._id,
            editedBy: req.user._id,
            fieldChanged: field,
            oldValue: oldVal,
            newValue: newVal,
          });
        }
      }
    }

    // Save edit history
    if (historyEntries.length > 0) {
      await TaskEditHistory.insertMany(historyEntries);
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "userId",
      "firstName lastName email",
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/tasks/:id/history
exports.getTaskHistory = async (req, res) => {
  try {
    const history = await TaskEditHistory.find({ taskId: req.params.id })
      .populate("editedBy", "firstName lastName email")
      .sort({ editedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only the task owner can delete
    if (task.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this task" });
    }

    await TaskEditHistory.deleteMany({ taskId: task._id });
    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
