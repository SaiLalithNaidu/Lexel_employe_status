import { useState, useEffect } from "react";
import {
  HiOutlineRefresh,
  HiOutlinePencil,
  HiOutlineCheckCircle,
  HiOutlineSortAscending,
  HiOutlineChat,
  HiOutlineSwitchHorizontal,
  HiOutlineUser,
  HiOutlineTag,
} from "react-icons/hi";
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
      task_created: HiOutlinePencil,
      task_completed: HiOutlineCheckCircle,
      task_updated: HiOutlinePencil,
      task_forwarded: HiOutlineSortAscending,
      comment_added: HiOutlineChat,
      status_changed: HiOutlineSwitchHorizontal,
      assigned: HiOutlineUser,
    };
    return icons[type] || HiOutlineTag;
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
        <h1 className="text-lg font-semibold text-gray-800">Activity Feed</h1>
        <button
          onClick={fetchActivities}
          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
        >
          <HiOutlineRefresh size={20} />
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "today", "week"].map((option) => (
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
          {activities.map((activity, idx) => {
            const ActivityIcon = getActivityIcon(activity.type);
            return (
              <div
                key={idx}
                className="rounded-lg bg-white p-4 shadow-sm hover:shadow transition"
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <ActivityIcon className="w-4 h-4 text-slate-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {activity.user?.firstName} {activity.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
