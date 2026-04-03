import { useState } from "react";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineExternalLink,
  HiOutlineLightningBolt,
  HiOutlineTag,
  HiOutlineBeaker,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { VscBug } from "react-icons/vsc";
import toast from "react-hot-toast";
import api from "../../api/client";
import TaskForm from "./TaskForm";
import EditHistory from "./EditHistory";

const statusColors = {
  yet_to_start: "border-l-gray-400 bg-gray-50",
  pending: "border-l-amber-400 bg-amber-50",
  in_progress: "border-l-blue-400 bg-blue-50",
  on_hold: "border-l-orange-400 bg-orange-50",
  completed: "border-l-emerald-400 bg-emerald-50",
  forwarded: "border-l-purple-400 bg-purple-50",
  blocked: "border-l-red-400 bg-red-50",
};

const statusLabels = {
  yet_to_start: "Yet to Start",
  pending: "Pending",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  forwarded: "Forwarded",
  blocked: "Blocked",
};

const statusBadge = {
  yet_to_start: "bg-gray-100 text-gray-700",
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  on_hold: "bg-orange-100 text-orange-700",
  completed: "bg-emerald-100 text-emerald-700",
  forwarded: "bg-purple-100 text-purple-700",
  blocked: "bg-red-100 text-red-700",
};

const priorityBadge = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
};

const categoryIcons = {
  feature: HiOutlineLightningBolt,
  bug: VscBug,
  testing: HiOutlineBeaker,
  documentation: HiOutlineDocumentText,
  learning: HiOutlineAcademicCap,
  other: HiOutlineTag,
};

export default function TaskCard({ task, onUpdate, readOnly = false }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success("Task deleted");
      onUpdate?.();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const taskDate = new Date(task.taskDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";
  const CategoryIcon = categoryIcons[task.category] || HiOutlineTag;

  return (
    <>
      <div
        className={`border-l-4 rounded-lg p-4 ${statusColors[task.status] || statusColors.pending} bg-white border border-slate-200`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <CategoryIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <h3 className="text-sm font-medium text-slate-800 truncate">
                {task.title}
              </h3>
              {task.gitIssueNumber && (
                <span className="text-xs text-slate-400">
                  {task.gitIssueNumber}
                </span>
              )}
            </div>
            {task.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[task.status] || statusBadge.pending}`}
              >
                {statusLabels[task.status] || task.status}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge[task.priority]}`}
              >
                {task.priority}
              </span>
              <span className="text-xs text-slate-400">{taskDate}</span>
              {dueDate && (
                <span
                  className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : "text-slate-400"}`}
                >
                  {isOverdue ? (
                    <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                  ) : (
                    <HiOutlineCalendar className="w-3 h-3" />
                  )}
                  Due: {dueDate}
                </span>
              )}
              {task.estimatedDuration && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <HiOutlineClock className="w-3 h-3" />
                  {task.estimatedDuration}h
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {task.gitIssueUrl && (
              <a
                href={task.gitIssueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition"
                title="Open Git Issue"
              >
                <HiOutlineExternalLink className="text-base" />
              </a>
            )}
            {!readOnly && (
              <>
                <button
                  onClick={() => setShowHistory(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                  title="Edit History"
                >
                  <HiOutlineClock className="text-base" />
                </button>
                <button
                  onClick={() => setShowEdit(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition"
                  title="Edit"
                >
                  <HiOutlinePencil className="text-base" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                  title="Delete"
                >
                  <HiOutlineTrash className="text-base" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <TaskForm
          task={task}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            onUpdate?.();
          }}
        />
      )}

      {showHistory && (
        <EditHistory
          taskId={task._id}
          taskTitle={task.title}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}
