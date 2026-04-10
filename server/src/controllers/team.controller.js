const User = require("../models/User");
const Task = require("../models/Task");

// GET /api/team/members - Get current user's team members
exports.getCurrentUserTeamMembers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const members = await User.find({
      team: currentUser.team,
      status: "approved",
      role: "employee",
    })
      .select("_id firstName lastName designation team avatarUrl")
      .sort({ firstName: 1 });

    res.json({
      members,
      team: currentUser.team,
      memberCount: members.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/teams/:teamName
exports.getTeamMembers = async (req, res) => {
  try {
    const { teamName } = req.params;
    const validTeams = ["development", "testing", "others"];

    if (!validTeams.includes(teamName)) {
      return res.status(400).json({ message: "Invalid team name" });
    }

    const members = await User.find({
      team: teamName,
      status: "approved",
      role: "employee",
    }).sort({ firstName: 1 });

    // Get active task count for each member
    const membersWithTaskCount = await Promise.all(
      members.map(async (member) => {
        const taskCount = await Task.countDocuments({
          userId: member._id,
          status: { $ne: "completed" },
        });
        return {
          id: member._id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          designation: member.designation,
          team: member.team,
          avatarUrl: member.avatarUrl,
          activeTaskCount: taskCount,
        };
      }),
    );

    res.json(membersWithTaskCount);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/employees/:id
exports.getEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const tasks = await Task.find({ userId: user._id }).sort({ taskDate: -1 });

    res.json({
      employee: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        designation: user.designation,
        team: user.team,
        avatarUrl: user.avatarUrl,
      },
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/employees/:id/tasks
exports.getEmployeeTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const { filter, date } = req.query;

    let query = { userId: id };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (filter) {
      case "today":
        query.taskDate = { $gte: today, $lt: tomorrow };
        break;
      case "yesterday":
        query.taskDate = { $gte: yesterday, $lt: today };
        break;
      case "yet_to_start":
        query.status = "yet_to_start";
        break;
      case "pending":
        query.status = "pending";
        break;
      case "in_progress":
        query.status = "in_progress";
        break;
      case "on_hold":
        query.status = "on_hold";
        break;
      case "completed":
        query.status = "completed";
        break;
      case "future":
        query.taskDate = { $gt: tomorrow };
        break;
      case "history":
        query.taskDate = { $lt: today };
        break;
      case "date":
        if (date) {
          const filterDate = new Date(date);
          filterDate.setHours(0, 0, 0, 0);
          const nextDay = new Date(filterDate);
          nextDay.setDate(nextDay.getDate() + 1);
          query.taskDate = { $gte: filterDate, $lt: nextDay };
        }
        break;
      default:
        break;
    }

    const tasks = await Task.find(query).sort({ taskDate: -1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
