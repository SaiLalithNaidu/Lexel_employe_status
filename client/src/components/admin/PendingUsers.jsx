import { useState, useEffect } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
} from "react-icons/hi";
import toast from "react-hot-toast";
import api from "../../api/client";

export default function PendingUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await api.get("/admin/pending-users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch pending users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/users/${id}/approve`);
      toast.success("User approved");
      fetchPending();
    } catch (err) {
      toast.error("Failed to approve user");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this user?")) return;
    try {
      await api.put(`/admin/users/${id}/reject`);
      toast.success("User rejected");
      fetchPending();
    } catch (err) {
      toast.error("Failed to reject user");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">Loading...</div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <HiOutlineClock className="mx-auto text-4xl text-slate-300 mb-3" />
        <p className="text-slate-400 text-sm">
          No pending registration requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user._id}
          className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {user.team}
                </span>
                <span className="text-xs text-slate-400">
                  {user.designation}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleApprove(user._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition"
            >
              <HiOutlineCheckCircle className="text-base" /> Approve
            </button>
            <button
              onClick={() => handleReject(user._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition"
            >
              <HiOutlineXCircle className="text-base" /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
