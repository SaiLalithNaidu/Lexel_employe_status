export default function Avatar({ user, size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  // Use initials to pick a consistent color
  const colorIndex = (initials.charCodeAt(0) + initials.charCodeAt(1)) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={`${sizes[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      title={`${user?.firstName} ${user?.lastName}`}
    >
      {initials || "?"}
    </div>
  );
}
