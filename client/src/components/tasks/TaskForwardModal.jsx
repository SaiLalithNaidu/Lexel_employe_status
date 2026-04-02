import { useState, useEffect } from "react";
import { HiOutlineX } from "react-icons/hi";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function TaskForwardModal({ task, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    forwardTo: "",
    reason: "",
    notes: "",
  });
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/employees");
      setEmployees(res.data.employees || []);
      const uniqueTeams = [...new Set(res.data.employees?.map(e => e.team))];
      setTeams(uniqueTeams);
    } catch (err) {
      console.error("Failed to load data");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.forwardTo || !formData.reason) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/tasks/${task._id}/forward`, {
        forwardTo: formData.forwardTo,
        reason: formData.reason,
        notes: formData.notes,
      });
      toast.success("Task forwarded successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to forward task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Forward Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiOutlineX size={24} />
          </button>
        </div>

        {/* Task Info */}
        <div className="mb-4 rounded-lg bg-blue-50 p-3">
          <p className="text-sm font-medium text-gray-700">{task.title}</p>
          <p className="text-xs text-gray-600 mt-1">{task.description}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Forwarding *
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select reason</option>
              <option value="completed">Task Completed</option>
              <option value="blocked">Task Blocked</option>
              <option value="help_needed">Help Needed</option>
              <option value="reassign">Reassign</option>
              <option value="expert_needed">Expert Needed</option>
            </select>
          </div>

          {/* Forward To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forward To *
            </label>
            <select
              name="forwardTo"
              value={formData.forwardTo}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select person</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.team})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Add any comments or context for the forwarding..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Forwarding..." : "Forward"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
