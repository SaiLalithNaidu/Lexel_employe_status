import { useState, useEffect } from "react";
import {
  HiOutlineBell,
  HiOutlineX,
  HiOutlineTrash,
  HiOutlineClipboardList,
  HiOutlineSortAscending,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineExclamationCircle,
  HiOutlineSwitchHorizontal,
  HiOutlineChat,
} from "react-icons/hi";
import api from "../../api/client";
import Badge from "../shared/Badge";
import LoadingState from "../shared/LoadingState";
import EmptyState from "../shared/EmptyState";
import toast from "react-hot-toast";

export default function NotificationCenter({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      task_assigned: HiOutlineClipboardList,
      task_forwarded: HiOutlineSortAscending,
      task_completed: HiOutlineCheckCircle,
      deadline_alert: HiOutlineClock,
      mentioned: HiOutlineUser,
      priority_changed: HiOutlineExclamationCircle,
      task_status_updated: HiOutlineSwitchHorizontal,
      comment_added: HiOutlineChat,
    };
    return icons[type] || HiOutlineBell;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <HiOutlineBell size={24} />
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="ml-2 inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiOutlineX size={24} />
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="border-b px-4 py-2">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <LoadingState />
          ) : notifications.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No notifications"
                description="You're all caught up!"
              />
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => {
                const NotifIcon = getNotificationIcon(notif.type);
                return (
                  <div
                    key={notif._id}
                    className={`p-4 hover:bg-gray-50 transition ${
                      !notif.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <NotifIcon className="w-4 h-4 text-slate-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={`text-sm ${
                                notif.isRead
                                  ? "text-gray-600"
                                  : "font-semibold text-gray-900"
                              }`}
                            >
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 flex-shrink-0">
                            {!notif.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notif._id)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                title="Mark as read"
                              >
                                •
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notif._id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Delete"
                            >
                              <HiOutlineTrash size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Task Link */}
                        {notif.actionUrl && (
                          <a
                            href={notif.actionUrl}
                            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                          >
                            View task →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
