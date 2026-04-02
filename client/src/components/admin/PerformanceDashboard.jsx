import { useState, useEffect } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import api from "../../api/client";
import LoadingState from "../shared/LoadingState";
import Badge from "../shared/Badge";
import toast from "react-hot-toast";

export default function PerformanceDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/analytics/metrics");
      setAnalytics(res.data);
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!analytics) return null;

  const stats = [
    { label: "Total Tasks", value: analytics.totalTasks, color: "blue" },
    { label: "Completed", value: analytics.completedTasks, color: "green" },
    { label: "In Progress", value: analytics.inProgressTasks, color: "yellow" },
    { label: "Overdue", value: analytics.overdueTasks, color: "red" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
        <button
          onClick={fetchAnalytics}
          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
        >
          <HiOutlineRefresh size={20} />
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Completion Rate */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 font-semibold text-gray-900">Overall Metrics</h2>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-medium text-gray-900">
                {Math.round((analytics.completedTasks / analytics.totalTasks) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width: `${(analytics.completedTasks / analytics.totalTasks) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between">
              <span className="text-sm text-gray-600">On Time Completion</span>
              <span className="font-medium text-gray-900">
                {analytics.onTimeCompletion || "N/A"}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${analytics.onTimeCompletion || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 font-semibold text-gray-900">Team Performance</h2>
        <div className="space-y-3">
          {analytics.teamMetrics?.map(team => (
            <div key={team.name} className="border-b pb-3 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{team.name}</span>
                <span className="text-sm text-gray-600">
                  {team.completedTasks} / {team.totalTasks}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${(team.completedTasks / team.totalTasks) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      {analytics.topPerformers && analytics.topPerformers.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 font-semibold text-gray-900">Top Performers</h2>
          <div className="space-y-3">
            {analytics.topPerformers.map((performer, idx) => (
              <div key={performer._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {performer.firstName} {performer.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{performer.team}</p>
                  </div>
                </div>
                <Badge type="status" value={performer.completionRate + "%"} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
