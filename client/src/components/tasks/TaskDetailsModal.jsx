import { useState, useEffect } from "react";
import {
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineClipboardList,
  HiOutlineTag,
  HiOutlineBeaker,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlineExternalLink,
  HiOutlinePaperAirplane,
} from "react-icons/hi";
import { VscBug } from "react-icons/vsc";
import api from "../../api/client";
import LoadingState from "../shared/LoadingState";
import TaskAssignmentModal from "./TaskAssignmentModal";
import toast from "react-hot-toast";

const statusLabels = {
  yet_to_start: "Yet to Start",
  pending: "Pending",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  forwarded: "Forwarded",
  blocked: "Blocked",
};

const statusColors = {
  yet_to_start: "bg-gray-100 text-gray-800",
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  on_hold: "bg-orange-100 text-orange-800",
  completed: "bg-emerald-100 text-emerald-800",
  forwarded: "bg-purple-100 text-purple-800",
  blocked: "bg-red-100 text-red-800",
};

const priorityColors = {
  low: "bg-slate-100 text-slate-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
};

const categoryIcons = {
  feature: HiOutlineLightningBolt,
  bug: VscBug,
  testing: HiOutlineBeaker,
  documentation: HiOutlineDocumentText,
  learning: HiOutlineAcademicCap,
  other: HiOutlineTag,
};

export default function TaskDetailsModal({ taskId, onClose }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}`);
      setTask(res.data);
    } catch (err) {
      toast.error("Failed to load task details");
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (!task) return null;

  const taskDate = new Date(task.taskDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const completedDate = task.completedAt
    ? new Date(task.completedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";

  const CategoryIcon = categoryIcons[task.category] || HiOutlineTag;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <CategoryIcon className="w-5 h-5 text-slate-600 flex-shrink-0" />
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-lg hover:bg-gray-100"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status] || statusColors.pending}`}
              >
                {statusLabels[task.status] || task.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Priority
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}
              >
                {task.priority}
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Description
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            </div>
          )}

          {/* Important Dates */}
          <div className="space-y-3 bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <HiOutlineCalendar className="w-4 h-4" />
              Important Dates
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">
                  Start Date
                </p>
                <p className="text-sm text-gray-900">{taskDate}</p>
              </div>

              {dueDate && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                    Due Date
                    {isOverdue && (
                      <HiOutlineExclamationCircle className="w-4 h-4 text-red-500" />
                    )}
                  </p>
                  <p
                    className={`text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-900"}`}
                  >
                    {dueDate}
                  </p>
                </div>
              )}

              {completedDate && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                    <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" />
                    Completed Date
                  </p>
                  <p className="text-sm text-gray-900">{completedDate}</p>
                </div>
              )}
            </div>
          </div>

          {/* Task Details Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs font-medium text-blue-600 mb-1 flex items-center gap-1">
                <HiOutlineClipboardList className="w-4 h-4" />
                Category
              </p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {task.category}
              </p>
            </div>

            {task.estimatedDuration && (
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs font-medium text-purple-600 mb-1 flex items-center gap-1">
                  <HiOutlineClock className="w-4 h-4" />
                  Estimated Duration
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {task.estimatedDuration} hours
                </p>
              </div>
            )}

            {task.actualDuration && (
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-xs font-medium text-emerald-600 mb-1 flex items-center gap-1">
                  <HiOutlineClock className="w-4 h-4" />
                  Actual Duration
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {task.actualDuration} hours
                </p>
              </div>
            )}

            {task.gitIssueNumber && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-xs font-medium text-indigo-600 mb-1 flex items-center gap-1">
                  <HiOutlineTag className="w-4 h-4" />
                  Git Issue
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {task.gitIssueNumber}
                </p>
              </div>
            )}
          </div>

          {/* Git Issue Link */}
          {task.gitIssueUrl && (
            <div className="bg-slate-100 rounded-lg p-4">
              <a
                href={task.gitIssueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <HiOutlineExternalLink className="w-4 h-4" />
                Open Git Issue
              </a>
            </div>
          )}

          {/* Task Type Badge */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <p className="text-sm font-medium text-gray-600">Task Type:</p>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
              {task.taskType || "current"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex justify-between">
          <button
            onClick={() => setShowAssignmentModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-medium transition flex items-center gap-2"
          >
            <HiOutlinePaperAirplane className="w-4 h-4" />
            Assign to Team Member
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition"
          >
            Close
          </button>
        </div>

        {/* Assignment Modal */}
        {showAssignmentModal && (
          <TaskAssignmentModal
            taskId={taskId}
            currentAssignee={task.userId}
            onClose={() => setShowAssignmentModal(false)}
            onAssigned={() => {
              fetchTaskDetails();
            }}
          />
        )}
      </div>
    </div>
  );
}
