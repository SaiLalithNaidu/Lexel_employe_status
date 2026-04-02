import TaskCard from "./TaskCard";

export default function TaskList({
  tasks,
  onUpdate,
  readOnly = false,
  emptyMessage = "No tasks found.",
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onUpdate={onUpdate}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
