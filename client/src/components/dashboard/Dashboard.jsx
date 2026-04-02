import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineBell,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import TaskForm from "../tasks/TaskForm";
import TaskCard from "../tasks/TaskCard";
import TeamDashboard from "./TeamDashboard";
import ActivityFeed from "./ActivityFeed";
import NotificationCenter from "../notifications/NotificationCenter";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState("tasks");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/employees/${user.id}/tasks?filter=today`);
      setTasks(res.data);

      const allRes = await api.get(`/employees/${user.id}/tasks`);
      const all = allRes.data;
      setStats({
        total: all.length,
        pending: all.filter((t) => t.status === "pending").length,
        inProgress: all.filter((t) => t.status === "in_progress").length,
        completed: all.filter((t) => t.status === "completed").length,
      });
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: HiOutlineClipboardList,
      color: "bg-primary-50 text-primary-600",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: HiOutlineClock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: HiOutlineExclamation,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: HiOutlineCheckCircle,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, {user?.firstName}! Here's your overview.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setNotificationOpen(true)}
            className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
          >
            <HiOutlineBell /> Notifications
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-0">
          {[
            { id: "tasks", label: "My Tasks" },
            { id: "team", label: "Team" },
            { id: "activity", label: "Activity" },
          ].map(navTab => (
            <button
              key={navTab.id}
              onClick={() => setTab(navTab.id)}
              className={`px-6 py-3 border-b-2 font-medium transition ${
                tab === navTab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {navTab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === "tasks" && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">
              Today's Tasks
            </h2>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Loading...
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No tasks for today. Click "New Task" to add one.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard key={task._id} task={task} onUpdate={fetchTasks} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "team" && <TeamDashboard />}

      {tab === "activity" && <ActivityFeed />}

      {/* Notification Center */}
      <NotificationCenter isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}
