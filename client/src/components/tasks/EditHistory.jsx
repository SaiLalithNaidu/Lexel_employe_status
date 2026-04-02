import { useState, useEffect } from "react";
import { HiOutlineX, HiOutlinePencilAlt } from "react-icons/hi";
import api from "../../api/client";

export default function EditHistory({ taskId, taskTitle, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/tasks/${taskId}/history`);
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [taskId]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Edit History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {taskTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <HiOutlineX className="text-lg text-slate-500" />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Loading...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No edits have been made to this task.
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

              <div className="space-y-6">
                {history.map((entry) => (
                  <div key={entry._id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-2.5 top-1 w-3.5 h-3.5 rounded-full bg-primary-500 border-2 border-white shadow" />

                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                          {entry.fieldChanged}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(entry.editedAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-red-50 text-red-600 rounded font-mono line-through">
                          {entry.oldValue || "(empty)"}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded font-mono">
                          {entry.newValue || "(empty)"}
                        </span>
                      </div>

                      {entry.editedBy && (
                        <p className="text-xs text-slate-400 mt-2">
                          by {entry.editedBy.firstName}{" "}
                          {entry.editedBy.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
