import { useState } from "react";
import { HiOutlineX, HiOutlineExternalLink } from "react-icons/hi";
import { VscBug } from "react-icons/vsc";
import toast from "react-hot-toast";
import api from "../../api/client";

export default function IssueForm({ issue = null, userId, onClose, onSaved }) {
  const isEdit = !!issue;

  const [form, setForm] = useState({
    title: issue?.title || "",
    description: issue?.description || "",
    issueUrl: issue?.issueUrl || "",
    issueNumber: issue?.issueNumber || "",
    repository: issue?.repository || "",
    status: issue?.status || "open",
    priority: issue?.priority || "medium",
    type: issue?.type || "bug",
    labels: issue?.labels?.join(", ") || "",
    fixNotes: issue?.fixNotes || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        labels: form.labels
          ? form.labels
              .split(",")
              .map((l) => l.trim())
              .filter(Boolean)
          : [],
      };

      if (userId) {
        payload.userId = userId;
      }

      if (isEdit) {
        await api.put(`/issues/${issue._id}`, payload);
        toast.success("Issue updated");
      } else {
        await api.post("/issues", payload);
        toast.success("Issue created");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save issue");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    open: "bg-red-100 text-red-700",
    in_progress: "bg-blue-100 text-blue-700",
    fixed: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
    wont_fix: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <VscBug className="w-4 h-4 text-red-500" />
            {isEdit ? "Edit Issue" : "Track New Issue"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <HiOutlineX className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Describe the issue briefly"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Detailed description, steps to reproduce, etc."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${statusColors[form.status]}`}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="fixed">Fixed</option>
                <option value="closed">Closed</option>
                <option value="wont_fix">Won't Fix</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="bug">Bug</option>
                <option value="enhancement">Enhancement</option>
                <option value="feature">Feature</option>
                <option value="documentation">Documentation</option>
                <option value="security">Security</option>
                <option value="performance">Performance</option>
              </select>
            </div>
          </div>

          {/* Git Link Section */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <HiOutlineExternalLink className="w-4 h-4" />
              Git Repository Link (Optional)
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Issue URL
                </label>
                <input
                  type="url"
                  name="issueUrl"
                  value={form.issueUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/org/repo/issues/123"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Issue #
                  </label>
                  <input
                    type="text"
                    name="issueNumber"
                    value={form.issueNumber}
                    onChange={handleChange}
                    placeholder="#123"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Repository
                  </label>
                  <input
                    type="text"
                    name="repository"
                    value={form.repository}
                    onChange={handleChange}
                    placeholder="org/repo"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Labels (comma-separated)
            </label>
            <input
              type="text"
              name="labels"
              value={form.labels}
              onChange={handleChange}
              placeholder="frontend, api, urgent"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {(form.status === "fixed" || isEdit) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fix Notes
              </label>
              <textarea
                name="fixNotes"
                value={form.fixNotes}
                onChange={handleChange}
                rows={2}
                placeholder="How was this issue resolved?"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Issue" : "Create Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
