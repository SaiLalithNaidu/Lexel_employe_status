import { useState } from "react";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineClock,
} from "react-icons/hi";
import toast from "react-hot-toast";
import api from "../../api/client";
import TaskForm from "./TaskForm";
import EditHistory from "./EditHistory";

const statusColors = {
  pending: "border-l-amber-400 bg-amber-50",
  in_progress: "border-l-blue-400 bg-blue-50",
  completed: "border-l-emerald-400 bg-emerald-50",
};

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

const statusBadge = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const priorityBadge = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
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

  return (
    <>
      <div
        className={`border-l-4 rounded-lg p-4 ${statusColors[task.status]} bg-white border border-slate-200`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[task.status]}`}
              >
                {statusLabels[task.status]}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge[task.priority]}`}
              >
                {task.priority}
              </span>
              <span className="text-xs text-slate-400">{taskDate}</span>
            </div>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-1 flex-shrink-0">
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
            </div>
          )}
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
