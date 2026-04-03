import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineMenuAlt2,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineCamera,
} from "react-icons/hi";
import api from "../../api/client";
import toast from "react-hot-toast";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, updateUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "";

  const avatarSrc = user?.avatarUrl ? `${API_BASE}${user.avatarUrl}` : null;

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const res = await api.post("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(res.data.user);
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const res = await api.delete("/auth/avatar");
      updateUser(res.data.user);
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error("Failed to remove picture");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center px-4 lg:px-6">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <HiOutlineMenuAlt2 className="text-xl" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/lexel-logo.svg" alt="Lexel" className="h-8" />
        </div>
      </div>

      {/* Right: user profile */}
      <div className="ml-auto relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`${user?.firstName} ${user?.lastName}`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium text-slate-700">
            {user?.firstName} {user?.lastName}
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
            {/* Profile header with avatar */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-semibold">
                      {initials}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    title="Change profile picture"
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <HiOutlineCamera className="text-lg" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-medium">
                      {user?.team}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {user?.designation}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="py-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <HiOutlineCamera className="text-lg" />
                {user?.avatarUrl ? "Change Photo" : "Upload Photo"}
              </button>
              {user?.avatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <HiOutlineUser className="text-lg" />
                  Remove Photo
                </button>
              )}
            </div>

            <div className="border-t border-slate-100">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <HiOutlineLogout className="text-lg" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
