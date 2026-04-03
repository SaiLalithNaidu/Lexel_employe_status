import { useState } from "react";
import {
  HiOutlineExternalLink,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineLightningBolt,
  HiOutlineTag,
  HiOutlineFolder,
  HiOutlineCheck,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineFire,
} from "react-icons/hi";
import { VscBug } from "react-icons/vsc";
import toast from "react-hot-toast";
import api from "../../api/client";

const statusConfig = {
  open: { label: "Open", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  fixed: {
    label: "Fixed",
    color: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  closed: {
    label: "Closed",
    color: "bg-gray-100 text-gray-700",
    dot: "bg-gray-500",
  },
  wont_fix: {
    label: "Won't Fix",
    color: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-500",
  },
};

const priorityConfig = {
  low: { label: "Low", color: "text-gray-600" },
  medium: { label: "Medium", color: "text-blue-600" },
  high: { label: "High", color: "text-orange-600" },
  critical: { label: "Critical", color: "text-red-600 font-bold" },
};

const typeIcons = {
  bug: VscBug,
  enhancement: HiOutlineSparkles,
  feature: HiOutlineLightningBolt,
  documentation: HiOutlineDocumentText,
  security: HiOutlineShieldCheck,
  performance: HiOutlineFire,
};

export default function IssueList({
  issues,
  onUpdate,
  onEdit,
  readOnly = false,
}) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this issue?")) return;
    setDeleting(id);
    try {
      await api.delete(`/issues/${id}`);
      toast.success("Issue deleted");
      onUpdate();
    } catch (err) {
      toast.error("Failed to delete issue");
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/issues/${id}`, { status: newStatus });
      toast.success(`Status changed to ${statusConfig[newStatus].label}`);
      onUpdate();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No issues found. Track your first bug or enhancement!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => {
        const status = statusConfig[issue.status] || statusConfig.open;
        const priority =
          priorityConfig[issue.priority] || priorityConfig.medium;
        const TypeIcon = typeIcons[issue.type] || HiOutlineTag;

        return (
          <div
            key={issue._id}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <TypeIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <h3 className="text-sm font-medium text-slate-800 truncate">
                    {issue.title}
                  </h3>
                  {issue.issueNumber && (
                    <span className="text-xs text-slate-400">
                      {issue.issueNumber}
                    </span>
                  )}
                </div>

                {issue.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                    {issue.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  {readOnly ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                      ></span>
                      {status.label}
                    </span>
                  ) : (
                    <select
                      value={issue.status}
                      onChange={(e) =>
                        handleStatusChange(issue._id, e.target.value)
                      }
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${status.color}`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="fixed">Fixed</option>
                      <option value="closed">Closed</option>
                      <option value="wont_fix">Won't Fix</option>
                    </select>
                  )}

                  {/* Priority */}
                  <span className={`text-xs ${priority.color}`}>
                    {priority.label} Priority
                  </span>

                  {/* Repository */}
                  {issue.repository && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <HiOutlineFolder className="w-3 h-3" />
                      {issue.repository}
                    </span>
                  )}

                  {/* Labels */}
                  {issue.labels?.map((label, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* Fixed Info */}
                {issue.status === "fixed" && issue.fixedAt && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <HiOutlineCheck className="w-3.5 h-3.5" />
                    Fixed on {new Date(issue.fixedAt).toLocaleDateString()}
                    {issue.fixNotes && ` — ${issue.fixNotes}`}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {issue.issueUrl && (
                  <a
                    href={issue.issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Open in GitHub"
                  >
                    <HiOutlineExternalLink className="w-4 h-4" />
                  </a>
                )}
                {!readOnly && (
                  <>
                    <button
                      onClick={() => onEdit(issue)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                      title="Edit"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(issue._id)}
                      disabled={deleting === issue._id}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
