import { useState, useEffect } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import api from "../../api/client";
import { useTask } from "../../context/TaskContext";
import Badge from "../shared/Badge";
import LoadingState from "../shared/LoadingState";
import toast from "react-hot-toast";

export default function KanbanBoard() {
  const { tasks, loading, fetchMyTasks, updateTask } = useTask();
  const [board, setBoard] = useState({
    pending: [],
    in_progress: [],
    review: [],
    completed: [],
  });

  useEffect(() => {
    fetchMyTasks();
  }, []);

  useEffect(() => {
    // Organize tasks by status
    const organized = {
      pending: tasks.filter(t => t.status === "pending"),
      in_progress: tasks.filter(t => t.status === "in_progress"),
      review: tasks.filter(t => t.status === "review"),
      completed: tasks.filter(t => t.status === "completed"),
    };
    setBoard(organized);
  }, [tasks]);

  const handleDragStart = (e, taskId, fromStatus) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("fromStatus", fromStatus);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, toStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const fromStatus = e.dataTransfer.getData("fromStatus");

    if (fromStatus === toStatus) return;

    try {
      await updateTask(taskId, { status: toStatus });
      toast.success(`Task moved to ${toStatus.replace(/_/g, " ")}`);
    } catch (err) {
      toast.error("Failed to move task");
    }
  };

  if (loading) return <LoadingState />;

  const columns = [
    { id: "pending", title: "Pending", color: "yellow" },
    { id: "in_progress", title: "In Progress", color: "blue" },
    { id: "review", title: "Review", color: "purple" },
    { id: "completed", title: "Completed", color: "green" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <button
          onClick={() => fetchMyTasks()}
          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
        >
          <HiOutlineRefresh size={20} />
        </button>
      </div>

      {/* Board */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 min-h-96">
        {columns.map(column => (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            className="bg-gray-100 rounded-lg p-4 min-h-96"
          >
            {/* Column Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{column.title}</h2>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {board[column.id]?.length || 0}
                </span>
              </div>
              <div className={`h-1 mt-2 bg-${column.color}-500 rounded`} />
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {board[column.id]?.map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id, column.id)}
                  className="bg-white rounded-lg p-3 shadow hover:shadow-md transition cursor-grab active:cursor-grabbing"
                >
                  <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <Badge type="priority" value={task.priority} />
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {!board[column.id] || board[column.id].length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        💡 Tip: Drag tasks between columns to update their status
      </div>
    </div>
  );
}
