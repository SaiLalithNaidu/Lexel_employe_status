import { useState, useMemo } from "react";
import { HiOutlineFilter, HiOutlineX } from "react-icons/hi";
import TaskCard from "./TaskCard";

const statuses = [
  {
    id: "yet_to_start",
    label: "Yet to Start",
    color: "bg-gray-100 text-gray-700",
  },
  { id: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  {
    id: "in_progress",
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
  },
  { id: "on_hold", label: "On Hold", color: "bg-orange-100 text-orange-700" },
  {
    id: "completed",
    label: "Completed",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "forwarded",
    label: "Forwarded",
    color: "bg-purple-100 text-purple-700",
  },
  { id: "blocked", label: "Blocked", color: "bg-red-100 text-red-700" },
];

export default function TaskList({
  tasks,
  onUpdate,
  readOnly = false,
  emptyMessage = "No tasks found.",
  showFilters = true,
}) {
  const [activeFilter, setActiveFilter] = useState(null);

  const filteredTasks = useMemo(() => {
    if (!activeFilter) return tasks;
    return tasks.filter((task) => task.status === activeFilter);
  }, [tasks, activeFilter]);

  const getStatusColor = (statusId) => {
    const status = statuses.find((s) => s.id === statusId);
    return status?.color || "bg-gray-100 text-gray-700";
  };

  const statusCounts = useMemo(() => {
    const counts = {};
    statuses.forEach((s) => {
      counts[s.id] = tasks.filter((t) => t.status === s.id).length;
    });
    return counts;
  }, [tasks]);

  if (tasks.length === 0 && !activeFilter) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineFilter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Filter by Status:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status.id}
                onClick={() =>
                  setActiveFilter(activeFilter === status.id ? null : status.id)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  activeFilter === status.id
                    ? getStatusColor(status.id) +
                      " ring-2 ring-offset-1 ring-gray-400"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {status.label}
                <span className="ml-1.5 text-xs opacity-75">
                  ({statusCounts[status.id]})
                </span>
              </button>
            ))}
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition flex items-center gap-1"
              >
                <HiOutlineX className="w-3 h-3" />
                Clear Filter
              </button>
            )}
          </div>
          {activeFilter && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          )}
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          {activeFilter
            ? `No tasks with status "${statuses.find((s) => s.id === activeFilter)?.label}"`
            : emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onUpdate={onUpdate}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
