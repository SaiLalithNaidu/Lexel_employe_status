import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineLogout,
  HiOutlineShieldCheck,
  HiOutlineUsers,
  HiOutlineClipboardCheck,
  HiOutlineChartBar,
  HiOutlinePlus,
} from "react-icons/hi";
import PendingUsers from "./PendingUsers";
import EmployeesList from "./EmployeesList";
import EmployeeDetail from "./EmployeeDetail";
import AdminTasksList from "./AdminTasksList";
import PerformanceDashboard from "./PerformanceDashboard";
import CreateTaskModal from "./CreateTaskModal";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setAllUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  const approvedCount = allUsers.filter((u) => u.status === "approved").length;
  const pendingCount = allUsers.filter((u) => u.status === "pending").length;
  const rejectedCount = allUsers.filter((u) => u.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiOutlineShieldCheck className="text-2xl" />
          <span className="text-lg font-bold">Lexel Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">{user?.email}</span>
          {tab === "tasks" && (
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition"
            >
              <HiOutlinePlus /> New Task
            </button>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition"
          >
            <HiOutlineLogout /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HiOutlineUsers className="text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {approvedCount}
                </p>
                <p className="text-xs text-slate-500">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <HiOutlineClipboardCheck className="text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {pendingCount}
                </p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <HiOutlineUsers className="text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {rejectedCount}
                </p>
                <p className="text-xs text-slate-500">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-0">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "employees", label: "Employees" },
              { id: "tasks", label: "Tasks" },
              { id: "analytics", label: "Analytics" },
            ].map(navTab => (
              <button
                key={navTab.id}
                onClick={() => {
                  setTab(navTab.id);
                  setSelectedEmployeeId(null);
                }}
                className={`px-6 py-3 border-b-2 font-medium transition ${
                  tab === navTab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {navTab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {tab === "dashboard" && (
          <>
            {selectedEmployeeId ? (
              <EmployeeDetail
                employeeId={selectedEmployeeId}
                onBack={() => setSelectedEmployeeId(null)}
              />
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <HiOutlineUsers className="text-xl" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {approvedCount}
                        </p>
                        <p className="text-xs text-gray-500">Approved</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <HiOutlineClipboardCheck className="text-xl" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {pendingCount}
                        </p>
                        <p className="text-xs text-gray-500">Pending</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                        <HiOutlineUsers className="text-xl" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {rejectedCount}
                        </p>
                        <p className="text-xs text-gray-500">Rejected</p>
                      </div>
                    </div>
                  </div>
                </div>
                <PendingUsers />
              </div>
            )}
          </>
        )}

        {tab === "employees" && (
          <>
            {selectedEmployeeId ? (
              <EmployeeDetail
                employeeId={selectedEmployeeId}
                onBack={() => setSelectedEmployeeId(null)}
              />
            ) : (
              <EmployeesList onSelectEmployee={setSelectedEmployeeId} />
            )}
          </>
        )}

        {tab === "tasks" && <AdminTasksList />}

        {tab === "analytics" && <PerformanceDashboard />}
      </div>

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <CreateTaskModal
          onClose={() => setShowCreateTaskModal(false)}
          onSuccess={() => {
            setShowCreateTaskModal(false);
            toast.success("Task created successfully");
          }}
        />
      )}
    </div>
  );
}
