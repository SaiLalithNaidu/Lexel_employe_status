import { createContext, useState, useCallback, useContext } from "react";
import api from "../api/client";

export const TaskContext = createContext();

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within TaskProvider");
  }
  return context;
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
 const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== TASK FETCH FUNCTIONS =====

  const fetchMyTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/tasks/me/tasks?${params}`);
      setTasks(res.data.tasks);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tasks");
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeamTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/tasks/team/tasks");
      setTeamTasks(res.data.tasks);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch team tasks");
      console.error("Failed to fetch team tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTask = useCallback(async (taskId) => {
    try {
      const res = await api.get(`/tasks/${taskId}`);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch task");
      throw err;
    }
  }, []);

  // ===== TASK OPERATIONS =====

  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/tasks", taskData);
      setTasks((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create task";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (taskId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/tasks/${taskId}`, updates);
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? res.data : task))
      );
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const forwardTask = useCallback(async (taskId, forwardData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/tasks/${taskId}/forward`, forwardData);
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? res.data.task : task))
      );
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to forward task");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== COMMENTS =====

  const addComment = useCallback(async (taskId, commentData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, commentData);
      return res.data.comment;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== NOTIFICATIONS =====

  const fetchNotifications = useCallback(async (unread = false) => {
    setLoading(true);
    setError(null);
    try {
      const query = unread ? "?unread=true" : "";
      const res = await api.get(`/notifications${query}`);
      setNotifications(res.data.notifications);
      setUnreadNotifications(res.data.unreadCount);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await api.put(`/notifications/read-all`);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadNotifications(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  // ===== SEARCH =====

  const searchTasks = useCallback(async (query, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: query, ...filters });
      const res = await api.get(`/tasks?${params}`);
      return res.data.tasks;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search tasks");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    // State
    tasks,
    teamTasks,
    notifications,
    unreadNotifications,
    loading,
    error,

    // Task operations
    fetchMyTasks,
    fetchTeamTasks,
    fetchTask,
    createTask,
    updateTask,
    forwardTask,
    deleteTask,

    // Comments
    addComment,

    // Notifications
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,

    // Search
    searchTasks,
  };

  return (
    <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
  );
}
