import { useState, useEffect, useMemo } from "react";
import { HiSearch, HiChevronRight, HiOutlineEye } from "react-icons/hi";
import api from "../../api/client";
import Badge from "../shared/Badge";
import Avatar from "../shared/Avatar";
import LoadingState from "../shared/LoadingState";
import EmptyState from "../shared/EmptyState";

export default function EmployeesList({ onSelectEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [sortBy, setSortBy] = useState("completionRate");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/employees");
      setEmployees(res.data.employees || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const teams = useMemo(() => {
    return [...new Set(employees.map((emp) => emp.team).filter(Boolean))];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    let filtered = employees.filter((emp) => {
      const matchesSearch =
        emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeam = !filterTeam || emp.team === filterTeam;
      return matchesSearch && matchesTeam;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "completionRate") {
        return (b.completionRate || 0) - (a.completionRate || 0);
      } else if (sortBy === "taskCount") {
        return (b.totalTasks || 0) - (a.totalTasks || 0);
      }
      return 0;
    });

    return filtered;
  }, [employees, searchTerm, filterTeam, sortBy]);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error}
        <button onClick={fetchEmployees} className="ml-2 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Team */}
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="completionRate">Sort by Completion Rate</option>
            <option value="taskCount">Sort by Task Count</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      {filteredEmployees.length === 0 ? (
        <EmptyState title="No employees found" />
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Tasks
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Completion
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        user={{
                          firstName: emp.firstName,
                          lastName: emp.lastName,
                          avatarUrl: emp.avatarUrl,
                        }}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge type="team" value={emp.team} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex gap-2">
                      <span className="font-medium">
                        {emp.completedTasks || 0}
                      </span>
                      <span className="text-gray-500">
                        / {emp.totalTasks || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${emp.completionRate || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(emp.completionRate || 0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      type="status"
                      value={
                        emp.totalTasks === emp.completedTasks
                          ? "completed"
                          : "active"
                      }
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onSelectEmployee?.(emp._id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-blue-600 hover:bg-blue-100 transition"
                    >
                      <HiOutlineEye size={16} />
                      <span className="text-sm">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        Showing {filteredEmployees.length} of {employees.length} employees
      </div>
    </div>
  );
}
