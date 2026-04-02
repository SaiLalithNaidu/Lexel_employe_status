import { useState, useEffect } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import api from "../../api/client";
import Avatar from "../shared/Avatar";
import Badge from "../shared/Badge";
import LoadingState from "../shared/LoadingState";
import EmptyState from "../shared/EmptyState";
import toast from "react-hot-toast";

export default function TeamDashboard() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/tasks/team/tasks");
      // Group by team members
      const members = res.data.teamMembers || [];
      setTeamMembers(members);
    } catch (err) {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
        <button
          onClick={fetchTeamMembers}
          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
        >
          <HiOutlineRefresh size={20} />
        </button>
      </div>

      {/* Team Members Grid */}
      {teamMembers.length === 0 ? (
        <EmptyState title="No team members" description="Check back later" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map(member => {
            const tasksToday = member.tasks?.filter(t => {
              const today = new Date().toDateString();
              return new Date(t.createdAt).toDateString() === today;
            }).length || 0;

            const completedToday = member.tasks?.filter(t => {
              const today = new Date().toDateString();
              return t.status === "completed" && new Date(t.completedAt).toDateString() === today;
            }).length || 0;

            return (
              <div
                key={member._id}
                onClick={() => setSelectedMember(member)}
                className="rounded-lg bg-white p-5 shadow hover:shadow-lg transition cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar user={member} size="md" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-xs text-gray-500">{member.team}</p>
                    </div>
                  </div>
                  <Badge type="status" value={member.status || "active"} />
                </div>

                {/* Stats */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Today's Tasks</span>
                    <span className="font-semibold text-gray-900">{tasksToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed Today</span>
                    <span className="font-semibold text-green-600">{completedToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Tasks</span>
                    <span className="font-semibold text-gray-900">{member.tasks?.length || 0}</span>
                  </div>
                </div>

                {/* Current Task */}
                {member.currentTask && (
                  <div className="mt-3 rounded-lg bg-blue-50 p-3">
                    <p className="text-xs font-medium text-blue-900">Current Task</p>
                    <p className="text-sm text-blue-800 truncate">{member.currentTask.title}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-3">
              <Avatar user={selectedMember} size="lg" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedMember.firstName} {selectedMember.lastName}
                </h2>
                <p className="text-gray-600">{selectedMember.email}</p>
              </div>
            </div>

            <div className="space-y-3 py-4 border-t border-b">
              <div className="flex justify-between">
                <span>Team:</span>
                <span className="font-medium">{selectedMember.team}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tasks:</span>
                <span className="font-medium">{selectedMember.tasks?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-medium text-green-600">
                  {selectedMember.tasks?.filter(t => t.status === "completed").length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Completion Rate:</span>
                <span className="font-medium">
                  {Math.round((selectedMember.completionRate || 0) * 100)}%
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="mt-4 w-full rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
