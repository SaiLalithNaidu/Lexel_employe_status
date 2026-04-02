import { useState, useEffect } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import api from "../../api/client";
import EmptyState from "../shared/EmptyState";
import LoadingState from "../shared/LoadingState";
import toast from "react-hot-toast";

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/tasks/team/tasks", {
        params: { timeRange: filter === "all" ? null : filter },
      });
      // Transform tasks into activities
      const acts = res.data.activities || [];
      setActivities(acts);
    } catch (err) {
      toast.error("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      task_created: "📝",
      task_completed: "✅",
      task_updated: "📝",
      task_forwarded: "↗️",
      comment_added: "💬",
      status_changed: "🔄",
      assigned: "👤",
    };
    return icons[type] || "📌";
  };

  const getActivityColor = (type) => {
    const colors = {
      task_created: "blue",
      task_completed: "green",
      task_updated: "yellow",
      task_forwarded: "purple",
      comment_added: "blue",
      status_changed: "orange",
      assigned: "indigo",
    };
    return colors[type] || "gray";
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
        <button
          onClick={fetchActivities}
          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
        >
          <HiOutlineRefresh size={20} />
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "today", "week"].map(option => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === option
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Activities Timeline */}
      {activities.length === 0 ? (
        <EmptyState title="No activities" description="No team activity yet" />
      ) : (
        <div className="space-y-3">
          {activities.map((activity, idx) => (
            <div key={idx} className="rounded-lg bg-white p-4 shadow hover:shadow-md transition">
              <div className="flex gap-4">
                {/* Icon */}
                <div className="text-2xl flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.user?.firstName} {activity.user?.lastName}
                      </p>
                      <p className="text-gray-600">
                        {activity.message}
                      </p>
                      {activity.task && (
                        <p className="mt-1 text-sm text-blue-600 hover:underline cursor-pointer">
                          Task: {activity.task.title}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Details */}
                  {activity.details && (
                    <div className="mt-2 text-sm text-gray-600">
                      {activity.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
