const User = require("../models/User");
const Task = require("../models/Task");
const Notification = require("../models/Notification");

// ===== USER MANAGEMENT (Existing) =====

// GET /api/admin/pending-users
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "pending", role: "employee" }).sort(
      { createdAt: -1 },
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/users/:id/approve
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User approved successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/users/:id/reject
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User rejected", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "employee" }).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== NEW: TASK MANAGEMENT =====

// POST /api/admin/tasks - Create and assign task
exports.createTaskForEmployee = async (req, res) => {
  try {
    const { title, description, priority, category, selectedEmployees, dueDate, estimatedDuration, subtasks } = req.body;

    if (!title || !selectedEmployees || selectedEmployees.length === 0) {
      return res.status(400).json({ message: "Title and selected employees required" });
    }

    const createdTasks = [];
    const notificationsSent = [];

    // Create task for each selected employee
    for (const employeeId of selectedEmployees) {
      const task = await Task.create({
        userId: employeeId,
        title,
        description,
        priority,
        category,
        dueDate,
        estimatedDuration,
        subtasks: subtasks || [],
        assignedBy: req.user._id,
        isAdminAssigned: true,
        status: "pending",
      });

      createdTasks.push(task);

      // Create notification for employee
      await Notification.create({
        recipientId: employeeId,
        type: "task_assigned",
        relatedTaskId: task._id,
        relatedUserId: req.user._id,
        message: `Admin assigned task: "${title}"`,
        actionUrl: `/tasks/${task._id}`,
      });

      notificationsSent.push(employeeId);
    }

    res.status(201).json({
      success: true,
      message: "Tasks created and assigned successfully",
      tasks: createdTasks,
      notificationsSent: notificationsSent.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/tasks - Get all assigned tasks with filters
exports.getAllAssignedTasks = async (req, res) => {
  try {
    const { team, status, priority, assignedBy } = req.query;
    let query = { isAdminAssigned: true };

    if (team) {
      const teamMembers = await User.find({ team });
      query.userId = { $in: teamMembers.map(m => m._id) };
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedBy) query.assignedBy = assignedBy;

    const tasks = await Task.find(query)
      .populate("userId", "firstName lastName email team designation")
      .populate("assignedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === "pending").length,
      inProgress: tasks.filter(t => t.status === "in_progress").length,
      completed: tasks.filter(t => t.status === "completed").length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed").length,
    };

    res.json({ success: true, tasks, stats });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/tasks/:id - Update task
exports.updateTask = async (req, res) => {
  try {
    const { status, priority, dueDate, reassignTo } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedFields = [];
    const notificationsToSend = [];

    if (status && task.status !== status) {
      task.status = status;
      updatedFields.push("status");
      
      // Notify task owner
      if (task.userId.toString() !== req.user._id.toString()) {
        notificationsToSend.push({
          recipientId: task.userId,
          type: "task_status_updated",
          relatedTaskId: task._id,
          message: `Task "${task.title}" status changed to ${status}`,
        });
      }
    }

    if (priority && task.priority !== priority) {
      task.priority = priority;
      updatedFields.push("priority");
      notificationsToSend.push({
        recipientId: task.userId,
        type: "priority_changed",
        relatedTaskId: task._id,
        message: `Task "${task.title}" priority changed to ${priority}`,
      });
    }

    if (dueDate) {
      task.dueDate = dueDate;
      updatedFields.push("dueDate");
    }

    if (reassignTo) {
      task.userId = reassignTo;
      task.forwardedTo = null;
      updatedFields.push("reassignedTo");
      
      notificationsToSend.push({
        recipientId: reassignTo,
        type: "task_assigned",
        relatedTaskId: task._id,
        message: `Task "${task.title}" assigned to you by admin`,
      });
    }

    await task.save();

    // Send notifications
    for (const notif of notificationsToSend) {
      await Notification.create(notif);
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      updatedFields,
      notificationsSent: notificationsToSend.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/employees - Get all employees with stats (Enhanced)
exports.getEmployeesWithStats = async (req, res) => {
  try {
    const { team, status } = req.query;
    let query = { role: "employee" };

    if (team) query.team = team;
    if (status) query.status = status;

    const employees = await User.find(query).sort({ firstName: 1 });

    const employeesWithStats = await Promise.all(
      employees.map(async (employee) => {
        const allTasks = await Task.find({ userId: employee._id });
        const completedTasks = allTasks.filter(t => t.status === "completed").length;
        const pendingTasks = allTasks.filter(t => t.status === "pending").length;
        const inProgressTasks = allTasks.filter(t => t.status === "in_progress").length;

        return {
          id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          designation: employee.designation,
          team: employee.team,
          status: employee.status,
          totalTasks: allTasks.length,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          completionRate: allTasks.length > 0 ? ((completedTasks / allTasks.length) * 100).toFixed(2) : 0,
          avatarUrl: employee.avatarUrl,
          joinDate: employee.createdAt,
          lastActive: employee.updatedAt,
        };
      })
    );

    res.json({ success: true, employees: employeesWithStats });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/employees/:id - Get employee detail with tasks
exports.getEmployeeDetail = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const tasks = await Task.find({ userId: employee._id })
      .populate("assignedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === "completed").length,
      pendingTasks: tasks.filter(t => t.status === "pending").length,
      inProgressTasks: tasks.filter(t => t.status === "in_progress").length,
      completionRate: tasks.length > 0 ? ((tasks.filter(t => t.status === "completed").length / tasks.length) * 100).toFixed(2) : 0,
      thisWeekCompleted: tasks.filter(t => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return t.status === "completed" && t.updatedAt >= oneWeekAgo;
      }).length,
    };

    res.json({
      success: true,
      employee: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        designation: employee.designation,
        team: employee.team,
        status: employee.status,
        joinDate: employee.createdAt,
        avatarUrl: employee.avatarUrl,
      },
      stats,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/analytics - Get performance metrics
exports.getAnalytics = async (req, res) => {
  try {
    const { team } = req.query;

    const teamQuery = team ? { team } : {};
    const employees = await User.find({ role: "employee", ...teamQuery });

    let allTasks = [];
    const employeeMetrics = [];

    for (const employee of employees) {
      const tasks = await Task.find({ userId: employee._id });
      allTasks = [...allTasks, ...tasks];

      const completed = tasks.filter(t => t.status === "completed").length;
      const total = tasks.length;

      employeeMetrics.push({
        employeeId: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        taskCount: total,
        completedCount: completed,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
      });
    }

    const analytics = {
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === "completed").length,
      pendingTasks: allTasks.filter(t => t.status === "pending").length,
      inProgressTasks: allTasks.filter(t => t.status === "in_progress").length,
      overdueTasks: allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed").length,
      totalEmployees: employees.length,
      employeeMetrics: employeeMetrics.sort((a, b) => parseFloat(b.completionRate) - parseFloat(a.completionRate)),
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
