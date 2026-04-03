const Task = require("../models/Task");
const TaskEditHistory = require("../models/TaskEditHistory");
const TaskComment = require("../models/TaskComment");
const Notification = require("../models/Notification");
const User = require("../models/User");

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      taskType,
      taskDate,
      category,
      dueDate,
      estimatedDuration,
      gitIssueUrl,
      gitIssueNumber,
      gitRepository,
      assigneeId,
    } = req.body;

    // Use assigneeId if provided, otherwise use logged-in user
    const userId = assigneeId || req.user._id;

    const task = await Task.create({
      userId,
      title,
      description,
      status,
      priority,
      taskType,
      taskDate,
      category,
      dueDate,
      estimatedDuration,
      gitIssueUrl,
      gitIssueNumber,
      gitRepository,
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

    // Set completedAt when status changes to completed
    if (req.body.status === "completed" && task.status !== "completed") {
      req.body.completedAt = new Date();
    }
    // Clear completedAt if status changes from completed to something else
    if (
      req.body.status &&
      req.body.status !== "completed" &&
      task.status === "completed"
    ) {
      req.body.completedAt = null;
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

// ===== NEW: TASK FORWARDING & COLLABORATION =====

// POST /api/tasks/:id/forward - Forward task to another user
exports.forwardTask = async (req, res) => {
  try {
    const { forwardTo, forwardingReason, notes } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify authorization
    if (
      task.userId.toString() !== req.user._id.toString() &&
      task.assignedBy?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to forward this task" });
    }

    task.forwardedTo = forwardTo;
    task.forwardedBy = req.user._id;
    task.forwardedAt = new Date();
    task.forwardingReason = forwardingReason;
    task.forwardingNotes = notes;
    task.status = "forwarded";
    task.userId = forwardTo;

    await task.save();

    // Create notification for recipient
    await Notification.create({
      recipientId: forwardTo,
      type: "task_forwarded",
      relatedTaskId: task._id,
      relatedUserId: req.user._id,
      message: `Task "${task.title}" forwarded to you. Reason: ${forwardingReason}`,
      actionUrl: `/tasks/${task._id}`,
    });

    res.json({
      success: true,
      message: "Task forwarded successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/tasks/:id/comments - Add comment to task
exports.addComment = async (req, res) => {
  try {
    const { content, mentions } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = await TaskComment.create({
      taskId: req.params.id,
      userId: req.user._id,
      content,
      mentions: mentions || [],
    });

    // Add comment to task
    task.comments.push(comment._id);
    await task.save();

    // Notify mentioned users
    if (mentions && mentions.length > 0) {
      for (const mentionedUserId of mentions) {
        if (mentionedUserId !== req.user._id.toString()) {
          await Notification.create({
            recipientId: mentionedUserId,
            type: "mentioned",
            relatedTaskId: task._id,
            relatedUserId: req.user._id,
            message: `You were mentioned in comment on task "${task.title}"`,
            actionUrl: `/tasks/${task._id}`,
          });
        }
      }
    }

    // Notify task owner
    if (task.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipientId: task.userId,
        type: "comment_added",
        relatedTaskId: task._id,
        relatedUserId: req.user._id,
        message: `New comment on task "${task.title}"`,
        actionUrl: `/tasks/${task._id}`,
      });
    }

    await comment.populate("userId", "firstName lastName avatarUrl");

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/tasks/me - Get my tasks
exports.getMyTasks = async (req, res) => {
  try {
    const { status, priority, filter } = req.query;
    let query = { userId: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (filter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.taskDate = { $gte: today, $lt: tomorrow };
    }

    const tasks = await Task.find(query)
      .populate("userId", "firstName lastName email")
      .populate("assignedBy", "firstName lastName")
      .sort({ dueDate: 1, createdAt: -1 });

    const stats = {
      totalToday: tasks.filter((t) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return t.taskDate >= today;
      }).length,
      completedToday: tasks.filter((t) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return t.status === "completed" && t.updatedAt >= today;
      }).length,
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== "completed",
      ).length,
    };

    res.json({
      success: true,
      tasks,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/tasks/team - Get team tasks
exports.getTeamTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const teamMembers = await User.find({
      team: user.team,
      status: "approved",
    });
    const teamMemberIds = teamMembers.map((m) => m._id);

    const tasks = await Task.find({ userId: { $in: teamMemberIds } })
      .populate("userId", "firstName lastName avatarUrl team")
      .populate("assignedBy", "firstName lastName")
      .populate("comments")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      team: user.team,
      tasks,
      teamMembersCount: teamMembers.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/tasks - Search tasks
exports.searchTasks = async (req, res) => {
  try {
    const { q, status, priority, team } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (team) {
      const teamMembers = await User.find({ team });
      query.userId = { $in: teamMembers.map((m) => m._id) };
    }

    const tasks = await Task.find(query)
      .populate("userId", "firstName lastName team")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
