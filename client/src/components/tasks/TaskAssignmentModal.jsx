import { useState, useEffect } from "react";
import { HiOutlineX, HiOutlineExclamationCircle } from "react-icons/hi";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function TaskAssignmentModal({
  taskId,
  currentAssignee,
  onClose,
  onAssigned,
}) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setFetching(true);
      const res = await api.get("/team/members");
      const members = res.data.members || [];

      // Filter out current assignee
      const filtered = members.filter((m) => m._id !== currentAssignee);

      if (filtered.length === 0) {
        setError("No other team members available to assign this task to.");
      } else {
        setTeamMembers(filtered);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch team members");
    } finally {
      setFetching(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedEmployeeId) {
      toast.error("Please select an employee");
      return;
    }

    if (!notes.trim()) {
      toast.error("Please add notes about the assignment");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/tasks/${taskId}/assign`, {
        assignToUserId: selectedEmployeeId,
        notes: notes,
      });

      toast.success("Task assigned successfully");
      onAssigned?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Assign Task to Team Member
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm text-red-700">
              <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {!error && (
            <form onSubmit={handleAssign} className="space-y-4">
              {/* Team Member Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Team Member *
                </label>
                {fetching ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Loading team members...
                  </div>
                ) : (
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="">-- Choose a team member --</option>
                    {teamMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.firstName} {member.lastName} (
                        {member.designation})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assignment Notes *
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why you're assigning this task and any important context..."
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {notes.length} characters
                </p>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 space-y-1">
                <p>• The assigned employee will receive a notification</p>
                <p>• You can reassign the task later if needed</p>
                <p>• The task will appear in their task list</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:bg-blue-400"
                  disabled={loading || !selectedEmployeeId || !notes.trim()}
                >
                  {loading ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
