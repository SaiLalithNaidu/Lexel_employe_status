import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";
import api from "../api/client";
import TaskList from "../components/tasks/TaskList";

const filters = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "future", label: "Future" },
  { key: "history", label: "History" },
];

export default function EmployeePage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        setEmployee(res.data.employee);
      } catch (err) {
        console.error("Failed to fetch employee:", err);
      }
    };
    fetchEmployee();
  }, [id]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = filter === "all" ? "" : `?filter=${filter}`;
      const res = await api.get(`/employees/${id}/tasks${params}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [id, filter]);

  if (!employee) {
    return <div className="text-center py-12 text-slate-400">Loading...</div>;
  }

  const initials =
    `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();

  return (
    <div>
      {/* Back */}
      <Link
        to={`/teams/${employee.team}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-4 transition"
      >
        <HiOutlineArrowLeft /> Back to team
      </Link>

      {/* Employee header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-sm text-slate-500">{employee.designation}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-medium">
              {employee.team}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === f.key
                ? "bg-primary-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Tasks ({tasks.length})
        </h2>
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Loading...
          </div>
        ) : (
          <TaskList tasks={tasks} onUpdate={fetchTasks} readOnly />
        )}
      </div>
    </div>
  );
}
