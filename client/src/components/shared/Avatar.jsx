import { useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function Avatar({ user, size = "md" }) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-20 h-20 text-xl",
  };

  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  const colorIndex =
    (initials.charCodeAt(0) + initials.charCodeAt(1)) % colors.length;
  const bgColor = colors[colorIndex];

  const avatarSrc =
    user?.avatarUrl && !imgError
      ? user.avatarUrl.startsWith("http")
        ? user.avatarUrl
        : `${API_BASE}${user.avatarUrl}`
      : null;

  if (avatarSrc) {
    return (
      <img
        src={avatarSrc}
        alt={`${user?.firstName} ${user?.lastName}`}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
        onError={() => setImgError(true)}
        title={`${user?.firstName} ${user?.lastName}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      title={`${user?.firstName} ${user?.lastName}`}
    >
      {initials || "?"}
    </div>
  );
}
