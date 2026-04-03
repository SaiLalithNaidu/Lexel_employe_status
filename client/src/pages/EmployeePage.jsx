import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineClipboardList,
  HiOutlinePause,
  HiOutlineExternalLink,
  HiOutlineMail,
} from "react-icons/hi";
import { VscBug, VscIssues } from "react-icons/vsc";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import TaskList from "../components/tasks/TaskList";
import TaskForm from "../components/tasks/TaskForm";
import IssueForm from "../components/issues/IssueForm";
import IssueList from "../components/issues/IssueList";
import Avatar from "../components/shared/Avatar";

const taskFilters = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "yet_to_start", label: "Yet to Start" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "on_hold", label: "On Hold" },
  { key: "completed", label: "Completed" },
  { key: "future", label: "Future" },
  { key: "history", label: "History" },
];

const issueFilters = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "fixed", label: "Fixed" },
  { key: "closed", label: "Closed" },
];

export default function EmployeePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isOwnProfile = user?.id === id;

  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");
  const [issueFilter, setIssueFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("tasks");
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    yetToStart: 0,
    pending: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
  });

  const [issueStats, setIssueStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    fixed: 0,
    critical: 0,
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        setEmployee(res.data.employee);
      } catch (err) {
        console.error("Failed to fetch employee:", err);
      }
    };
    fetchEmployee();
  }, [id]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = taskFilter === "all" ? "" : `?filter=${taskFilter}`;
      const res = await api.get(`/employees/${id}/tasks${params}`);
      setTasks(res.data);

      // Calculate stats from all tasks
      const allRes = await api.get(`/employees/${id}/tasks`);
      const all = allRes.data;
      setStats({
        total: all.length,
        yetToStart: all.filter((t) => t.status === "yet_to_start").length,
        pending: all.filter((t) => t.status === "pending").length,
        inProgress: all.filter((t) => t.status === "in_progress").length,
        onHold: all.filter((t) => t.status === "on_hold").length,
        completed: all.filter((t) => t.status === "completed").length,
      });
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      const params = issueFilter === "all" ? "" : `?status=${issueFilter}`;
      const res = await api.get(`/issues/user/${id}${params}`);
      setIssues(res.data);

      // Get stats
      const statsRes = await api.get(`/issues/user/${id}/stats`);
      setIssueStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch issues:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [id, taskFilter]);

  useEffect(() => {
    fetchIssues();
  }, [id, issueFilter]);

  if (!employee) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total",
      value: stats.total,
      icon: HiOutlineClipboardList,
      color: "bg-slate-100 text-slate-600",
    },
    {
      label: "Yet to Start",
      value: stats.yetToStart,
      icon: HiOutlineClock,
      color: "bg-gray-100 text-gray-600",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: HiOutlineClock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: HiOutlineExclamation,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "On Hold",
      value: stats.onHold,
      icon: HiOutlinePause,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: HiOutlineCheckCircle,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to={`/teams/${employee.team}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition"
      >
        <HiOutlineArrowLeft /> Back to team
      </Link>

      {/* Employee Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar user={employee} size="lg" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-slate-800">
              {employee.firstName} {employee.lastName}
              {isOwnProfile && (
                <span className="ml-2 text-xs font-normal text-primary-600">
                  (You)
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
              <HiOutlineMail className="w-3.5 h-3.5" />
              {employee.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium">
                {employee.team}
              </span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-slate-500">
                {employee.designation}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowTaskForm(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
            >
              <HiOutlinePlus /> New Task
            </button>
            <button
              onClick={() => {
                setEditingIssue(null);
                setShowIssueForm(true);
              }}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium rounded-lg transition flex items-center gap-1.5"
            >
              <VscBug className="w-4 h-4" /> Track Issue
            </button>
          </div>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-5 py-3 text-sm font-medium transition border-b-2 flex items-center gap-1.5 ${
                activeTab === "tasks"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <HiOutlineClipboardList className="w-4 h-4" />
              Tasks ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("issues")}
              className={`px-5 py-3 text-sm font-medium transition border-b-2 flex items-center gap-1.5 ${
                activeTab === "issues"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <VscIssues className="w-4 h-4" />
              Issues ({issueStats.total})
              {issueStats.open > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                  {issueStats.open} open
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-5">
          {activeTab === "tasks" && (
            <>
              {/* Task Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {taskFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setTaskFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      taskFilter === f.key
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Tasks List */}
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Tasks ({tasks.length})
              </h3>
              {loading ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Loading...
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  onUpdate={fetchTasks}
                  readOnly={!isOwnProfile}
                />
              )}
            </>
          )}

          {activeTab === "issues" && (
            <>
              {/* Issue Stats Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-slate-800">
                    {issueStats.total}
                  </p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-red-600">
                    {issueStats.open}
                  </p>
                  <p className="text-xs text-red-500">Open</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-blue-600">
                    {issueStats.inProgress}
                  </p>
                  <p className="text-xs text-blue-500">In Progress</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-green-600">
                    {issueStats.fixed}
                  </p>
                  <p className="text-xs text-green-500">Fixed</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold text-orange-600">
                    {issueStats.critical || 0}
                  </p>
                  <p className="text-xs text-orange-500">Critical</p>
                </div>
              </div>

              {/* Issue Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {issueFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setIssueFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      issueFilter === f.key
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Issues List */}
              <IssueList
                issues={issues}
                onUpdate={fetchIssues}
                onEdit={(issue) => {
                  setEditingIssue(issue);
                  setShowIssueForm(true);
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          assigneeId={id}
          onClose={() => setShowTaskForm(false)}
          onSaved={() => {
            setShowTaskForm(false);
            fetchTasks();
          }}
        />
      )}

      {/* Issue Form Modal */}
      {showIssueForm && (
        <IssueForm
          issue={editingIssue}
          userId={id}
          onClose={() => {
            setShowIssueForm(false);
            setEditingIssue(null);
          }}
          onSaved={() => {
            setShowIssueForm(false);
            setEditingIssue(null);
            fetchIssues();
          }}
        />
      )}
    </div>
  );
}
