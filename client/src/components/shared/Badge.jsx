export default function Badge({ type, value }) {
  const styles = {
    status: {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      review: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      forwarded: "bg-indigo-100 text-indigo-800",
      blocked: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
    },
    priority: {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    },
    team: {
      default: "bg-blue-100 text-blue-800",
    },
  };

  let className = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";

  if (type === "status") {
    className += " " + (styles.status[value] || "bg-gray-100 text-gray-800");
  } else if (type === "priority") {
    className += " " + (styles.priority[value] || "bg-gray-100 text-gray-800");
  } else {
    className += " " + (styles.team.default);
  }

  return (
    <span className={className}>
      {value?.replace(/_/g, " ").charAt(0).toUpperCase() + value?.slice(1)?.replace(/_/g, " ")}
    </span>
  );
}
