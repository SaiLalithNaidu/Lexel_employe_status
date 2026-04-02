import { useState, useEffect } from "react";
import { HiArrowLeft, HiOutlineRefresh } from "react-icons/hi";
import api from "../../api/client";
import Badge from "../shared/Badge";
import Avatar from "../shared/Avatar";
import LoadingState from "../shared/LoadingState";
import toast from "react-hot-toast";

export default function EmployeeDetail({ employeeId, onBack }) {
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetail();
    }
  }, [employeeId]);

  const fetchEmployeeDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/employees/${employeeId}`);
      setEmployee(res.data.employee);
      setTasks(res.data.tasks || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load employee details");
      onBack?.();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!employee) return null;

  const stats = [
    { label: "Total Tasks", value: employee.totalTasks, color: "blue" },
    { label: "Completed", value: employee.completedTasks, color: "green" },
    { label: "In Progress", value: (employee.totalTasks || 0) - (employee.completedTasks || 0), color: "yellow" },
    { label: "Completion Rate", value: `${Math.round(employee.completionRate || 0)}%`, color: "purple" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <HiArrowLeft size={20} />
          <span>Back to Employees</span>
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar user={employee} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-gray-500">{employee.email}</p>
              <div className="mt-2 flex gap-2">
                <Badge type="team" value={employee.team} />
                <Badge type="status" value="active" />
              </div>
            </div>
          </div>
          <button
            onClick={fetchEmployeeDetail}
            className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
          >
            <HiOutlineRefresh size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b">
          <div className="flex gap-4 px-6">
            {[
              { id: "overview", label: "Overview" },
              { id: "tasks", label: "Tasks" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-1 py-4 transition ${
                  activeTab === tab.id
                    ? "border-blue-500 font-semibold text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Email</p>
                  <p className="text-gray-900">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Team</p>
                  <p className="text-gray-900">{employee.team || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Status</p>
                  <p className="text-gray-900">Active</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Joined</p>
                  <p className="text-gray-900">
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Performance */}
              {employee.performanceMetrics && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Completion Time</span>
                      <span className="font-medium text-gray-900">
                        {employee.performanceMetrics.avgCompletionTime || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overdue Tasks</span>
                      <span className="font-medium text-red-600">
                        {employee.performanceMetrics.overdueTasks || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-gray-500">No tasks assigned</p>
              ) : (
                tasks.map(task => (
                  <div key={task._id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <div className="mt-2 flex gap-2">
                          <Badge type="priority" value={task.priority} />
                          <Badge type="status" value={task.status} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
