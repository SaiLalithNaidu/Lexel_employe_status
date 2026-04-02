import { useState, useEffect } from "react";
import { HiOutlineX } from "react-icons/hi";
import toast from "react-hot-toast";
import api from "../../api/client";

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }) {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "other",
    selectedEmployees: [],
    dueDate: "",
    estimatedDuration: "",
    subtasks: [],
  });
  const [subtaskInput, setSubtaskInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/admin/employees");
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSelect = (employeeId) => {
    setForm((prev) => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.includes(employeeId)
        ? prev.selectedEmployees.filter((id) => id !== employeeId)
        : [...prev.selectedEmployees, employeeId],
    }));
  };

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setForm((prev) => ({
        ...prev,
        subtasks: [...prev.subtasks, { title: subtaskInput }],
      }));
      setSubtaskInput("");
    }
  };

  const removeSubtask = (index) => {
    setForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || form.selectedEmployees.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/admin/tasks", form);
      toast.success("Task created and assigned successfully!");
      onTaskCreated();
      setForm({
        title: "",
        description: "",
        priority: "medium",
        category: "other",
        selectedEmployees: [],
        dueDate: "",
        estimatedDuration: "",
        subtasks: [],
      });
      setSubtaskInput("");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create & Assign Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows="3"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="feature">Feature</option>
                <option value="bug">Bug Fix</option>
                <option value="testing">Testing</option>
                <option value="documentation">Documentation</option>
                <option value="learning">Learning</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Due Date & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedDuration"
                value={form.estimatedDuration}
                onChange={handleChange}
                placeholder="8"
                min="1"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subtasks
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSubtask())}
                placeholder="Add subtask and press Enter"
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {form.subtasks.map((subtask, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-slate-100 p-3 rounded-lg"
                >
                  <span className="text-sm">{subtask.title}</span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(idx)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assign to Employees * ({form.selectedEmployees.length} selected)
            </label>
            <div className="border border-slate-300 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2 bg-slate-50">
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <label
                    key={employee.id}
                    className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={form.selectedEmployees.includes(employee.id)}
                      onChange={() => handleEmployeeSelect(employee.id)}
                      className="rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {employee.designation} • {employee.team}
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-sm text-slate-500 py-4">No employees available</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {loading ? "Creating..." : "Create & Assign Task"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
