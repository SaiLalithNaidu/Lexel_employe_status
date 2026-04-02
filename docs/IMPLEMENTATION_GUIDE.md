# Lexel Employee Status Tracker - Implementation Guide

## 📚 Table of Contents
1. Database Schema Implementation
2. Backend API Specifications
3. Frontend Component Architecture
4. State Management Strategy
5. Integration Checklist

---

## 🗄️ Part 1: Database Schema Implementation

### Current State vs Enhanced State

#### Task Model - Updated Schema

**File:** `server/src/models/Task.js`

```javascript
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // Core Fields (Existing)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "forwarded", "blocked"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    taskType: {
      type: String,
      enum: ["current", "future"],
      default: "current",
    },
    taskDate: {
      type: Date,
      required: [true, "Task date is required"],
    },

    // NEW: Admin Assignment Fields
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isAdminAssigned: {
      type: Boolean,
      default: false,
    },

    // NEW: Task Details
    category: {
      type: String,
      enum: ["feature", "bug", "testing", "documentation", "learning", "other"],
      default: "other",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedDuration: {
      type: Number, // in hours
      default: null,
    },
    actualDuration: {
      type: Number, // in hours
      default: null,
    },

    // NEW: Subtasks
    subtasks: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // NEW: Forwarding System
    forwardedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    forwardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    forwardedAt: {
      type: Date,
      default: null,
    },
    forwardingReason: {
      type: String,
      enum: [
        "completed",
        "blocked",
        "help_needed",
        "for_review",
        "ready_for_testing",
        "reassigned",
      ],
      default: null,
    },
    forwardingNotes: {
      type: String,
      default: null,
    },

    // NEW: Collaboration
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskComment",
      },
    ],
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskAttachment",
      },
    ],

    // System Fields
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ forwardedTo: 1 });
taskSchema.index({ taskDate: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ category: 1 });

module.exports = mongoose.model("Task", taskSchema);
```

---

### New Models to Create

#### 1. TaskComment Model

**File:** `server/src/models/TaskComment.js`

```javascript
const mongoose = require("mongoose");

const taskCommentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TaskComment", taskCommentSchema);
```

---

#### 2. TaskAttachment Model

**File:** `server/src/models/TaskAttachment.js`

```javascript
const mongoose = require("mongoose");

const taskAttachmentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    fileType: {
      type: String,
      required: true,
      enum: ["image", "document", "video", "code", "other"],
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TaskAttachment", taskAttachmentSchema);
```

---

#### 3. Notification Model

**File:** `server/src/models/Notification.js`

```javascript
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_forwarded",
        "task_completed",
        "deadline_alert",
        "mentioned",
        "priority_changed",
        "task_status_updated",
      ],
      required: true,
    },
    relatedTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    actionUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model("Notification", notificationSchema);
```

---

## 🔌 Part 2: Backend API Specifications

### Admin-Specific Endpoints

#### 1. Employee Management

##### GET /api/admin/employees
**Get all employees with stats**

```javascript
// Response
{
  "success": true,
  "data": [
    {
      "id": "userId123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@lexel.com",
      "designation": "Senior Developer",
      "team": "development",
      "status": "approved",
      "totalTasks": 15,
      "completedTasks": 10,
      "pendingTasks": 3,
      "inProgressTasks": 2,
      "avatarUrl": "...",
      "joinDate": "2024-01-15",
      "lastActive": "2024-04-02T10:30:00Z"
    }
  ]
}
```

**Query Params:**
- `team`: "development" | "testing" | "others" (filter by team)
- `status`: "active" | "inactive" (filter by status)
- `sort`: "name" | "tasks" | "joinDate" (sort by field)

---

##### GET /api/admin/employees/:id
**Get employee profile with detailed task list**

```javascript
// Response
{
  "success": true,
  "employee": {
    "id": "userId123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@lexel.com",
    "designation": "Senior Developer",
    "team": "development",
    "status": "approved",
    "joinDate": "2024-01-15",
    "avatarUrl": "..."
  },
  "stats": {
    "totalTasks": 15,
    "completedTasks": 10,
    "pendingTasks": 3,
    "inProgressTasks": 2,
    "completionRate": 0.67,
    "avgCompletionTime": 2.5, // days
    "thisWeekCompleted": 3
  },
  "tasks": [
    {
      "id": "taskId123",
      "title": "Fix login bug",
      "status": "completed",
      "priority": "high",
      "dueDate": "2024-04-02",
      "assignedAt": "2024-03-28",
      "completedAt": "2024-04-01",
      "assignedBy": "adminId123"
    }
  ]
}
```

---

#### 2. Task Assignment (Admin)

##### POST /api/admin/tasks
**Create and assign task to employee(s)**

```javascript
// Request
{
  "title": "Implement new feature",
  "description": "Add user authentication",
  "priority": "high",
  "category": "feature",
  "selectedEmployees": ["userId1", "userId2"], // Can be array for multiple
  "dueDate": "2024-04-15",
  "estimatedDuration": 8,
  "subtasks": [
    { "title": "Design database schema" },
    { "title": "Write API endpoints" },
    { "title": "Write tests" }
  ]
}

// Response
{
  "success": true,
  "message": "Task assigned successfully",
  "taskId": "taskId123",
  "assignedTo": [
    {
      "userId": "userId1",
      "name": "John Doe",
      "notificationSent": true
    }
  ]
}
```

---

##### GET /api/admin/tasks
**Get all assigned tasks with filters**

```javascript
// Query Params
?team=development&status=pending&priority=high&startDate=2024-04-01&endDate=2024-04-30

// Response
{
  "success": true,
  "data": [
    {
      "id": "taskId123",
      "title": "Fix login bug",
      "assignedTo": { "firstName": "John", "lastName": "Doe" },
      "assignedBy": "admin@lexel.com",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2024-04-05",
      "assignedDate": "2024-03-28",
      "daysUntilDue": 3,
      "isOverdue": false
    }
  ],
  "stats": {
    "total": 45,
    "pending": 15,
    "inProgress": 20,
    "completed": 10,
    "overdue": 0
  }
}
```

---

##### PUT /api/admin/tasks/:id
**Update task assignment**

```javascript
// Request
{
  "status": "in_progress",
  "priority": "medium",
  "dueDate": "2024-04-10",
  "reassignTo": "userId456" // reassign to different user
}

// Response
{
  "success": true,
  "message": "Task updated successfully",
  "updatedFields": ["status", "priority", "assignee"],
  "notificationsSent": ["userId1", "userId456"]
}
```

---

### Employee/Developer Endpoints

#### POST /api/tasks
**Create personal task**

```javascript
// Request
{
  "title": "Complete code review",
  "description": "Review PR #123",
  "priority": "medium",
  "category": "review",
  "dueDate": "2024-04-05",
  "taskType": "current"
}

// Response
{
  "success": true,
  "taskId": "taskId123",
  "message": "Task created successfully"
}
```

---

#### POST /api/tasks/:id/forward
**Forward task to another user/team**

```javascript
// Request
{
  "forwardTo": "userId456",
  "forwardingReason": "ready_for_testing",
  "notes": "Feature is ready for QA testing"
}

// Response
{
  "success": true,
  "message": "Task forwarded successfully",
  "forwardedTo": "userId456",
  "notification": {
    "userId": "userId456",
    "sent": true
  }
}
```

---

#### GET /api/tasks/me
**Get my tasks (personal)**

```javascript
// Query Params
?status=pending&priority=high&filter=today

// Response
{
  "success": true,
  "tasks": [
    {
      "id": "taskId123",
      "title": "Fix login bug",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2024-04-02",
      "progressPercent": 50,
      "assignedBy": "admin@lexel.com",
      "isOverdue": false,
      "comments": 3
    }
  ],
  "stats": {
    "totalToday": 5,
    "completedToday": 2,
    "overdue": 1
  }
}
```

---

#### GET /api/tasks/team
**Get team tasks**

```javascript
// Response
{
  "success": true,
  "team": "development",
  "tasks": [
    {
      "id": "taskId123",
      "title": "Fix login bug",
      "assignedTo": {
        "id": "userId1",
        "name": "John Doe",
        "avatarUrl": "..."
      },
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2024-04-02",
      "comments": 3
    }
  ]
}
```

---

#### POST /api/tasks/:id/comments
**Add comment to task**

```javascript
// Request
{
  "content": "I've made good progress on this",
  "mentions": ["userId1", "userId2"]
}

// Response
{
  "success": true,
  "commentId": "commentId123",
  "comment": {
    "id": "commentId123",
    "userId": "currentUserId",
    "userName": "John Doe",
    "content": "I've made good progress on this",
    "mentions": [
      { "userId": "userId1", "userName": "Jane Smith" }
    ],
    "createdAt": "2024-04-02T10:30:00Z"
  },
  "notificationsSent": 1
}
```

---

#### GET /api/activity-feed
**Get team activity feed**

```javascript
// Query Params
?limit=20&offset=0&team=development&timeRange=today

// Response
{
  "success": true,
  "activities": [
    {
      "id": "activity123",
      "type": "task_completed",
      "actor": {
        "name": "John Doe",
        "avatarUrl": "..."
      },
      "action": "completed task",
      "target": {
        "taskId": "taskId123",
        "taskTitle": "Fix login bug"
      },
      "timestamp": "2024-04-02T10:30:00Z",
      "message": "John Doe completed Fix login bug"
    }
  ]
}
```

---

#### Notification Endpoints

##### GET /api/notifications
**Get notifications**

```javascript
// Query Params
?unread=true&limit=10

// Response
{
  "success": true,
  "unreadCount": 5,
  "notifications": [
    {
      "id": "notif123",
      "type": "task_assigned",
      "message": "Admin assigned 'Fix login bug' to you",
      "relatedTaskId": "taskId123",
      "isRead": false,
      "createdAt": "2024-04-02T10:30:00Z"
    }
  ]
}
```

---

##### PUT /api/notifications/:id/read
**Mark notification as read**

```javascript
// Response
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 🎨 Part 3: Frontend Component Architecture

### Admin Components Structure

```
components/
├── admin/
│   ├── AdminDashboard.jsx (main container)
│   ├── EmployeesTab.jsx
│   │   ├── EmployeesList.jsx
│   │   ├── EmployeeSearchFilter.jsx
│   │   └── EmployeeCard.jsx
│   ├── EmployeeDetail.jsx
│   │   ├── EmployeeProfile.jsx
│   │   ├── EmployeeStats.jsx
│   │   ├── EmployeeTasksList.jsx
│   │   └── AssignTaskBtn.jsx
│   ├── TasksTab.jsx
│   │   ├── TasksList.jsx
│   │   ├── TaskCard.jsx
│   │   ├── TaskFilters.jsx
│   │   └── CreateTaskModal.jsx
│   ├── AnalyticsTab.jsx
│   │   ├── PerformanceChart.jsx
│   │   ├── TeamStatsCard.jsx
│   │   └── EmployeeComparisonChart.jsx
│   └── ReportsTab.jsx
│       └── ReportGenerator.jsx
```

---

### Client Components Structure

```
components/
├── dashboard/
│   ├── Dashboard.jsx (main container)
│   ├── TaskWidget.jsx
│   ├── QuickCreateTask.jsx
│   └── ActivityFeed.jsx
├── tasks/
│   ├── TaskForm.jsx (enhanced)
│   ├── TaskCard.jsx (enhanced)
│   ├── TaskList.jsx
│   ├── TaskFilters.jsx
│   ├── KanbanBoard.jsx
│   │   ├── KanbanColumn.jsx
│   │   └── KanbanCard.jsx
│   ├── TaskForwardModal.jsx
│   ├── TaskComments.jsx
│   │   └── CommentInput.jsx
│   └── TaskAttachments.jsx
├── teams/
│   ├── TeamDashboard.jsx
│   ├── TeamMembersGrid.jsx
│   │   └── TeamMemberCard.jsx
│   └── TeamActivityFeed.jsx
└── notifications/
    ├── NotificationCenter.jsx
    ├── NotificationBell.jsx
    └── NotificationItem.jsx
```

---

### Key Component: Create Task Modal

**File:** `client/src/components/admin/CreateTaskModal.jsx`

```jsx
import { useState } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "feature",
    selectedEmployees: [],
    dueDate: "",
    estimatedDuration: "",
    subtasks: [],
  });

  const [subtaskInput, setSubtaskInput] = useState("");

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

    if (!form.title || form.selectedEmployees.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await api.post("/admin/tasks", form);
      toast.success("Task created and assigned successfully");
      onTaskCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create & Assign Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows="4"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="feature">Feature</option>
                <option value="bug">Bug Fix</option>
                <option value="testing">Testing</option>
                <option value="documentation">Documentation</option>
              </select>
            </div>
          </div>

          {/* Due Date & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedDuration"
                value={form.estimatedDuration}
                onChange={handleChange}
                placeholder="8"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium mb-2">Subtasks</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Add subtask"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>

            {form.subtasks.map((subtask, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-slate-100 p-2 rounded mb-2"
              >
                <span>{subtask.title}</span>
                <button
                  type="button"
                  onClick={() => removeSubtask(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Assign to Employees *
            </label>
            <div className="border border-slate-300 rounded-lg p-4 max-h-40 overflow-y-auto">
              {/* Placeholder for employee list - would fetch from API */}
              <p className="text-sm text-slate-500">
                (Employee selection component here)
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 🔄 Part 4: State Management Strategy

### Using React Context

**File:** `client/src/context/TaskContext.jsx`

```jsx
import { createContext, useState, useCallback } from "react";
import api from "../api/client";

export const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch my tasks
  const fetchMyTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/tasks/me?${params}`);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch team tasks
  const fetchTeamTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks/team");
      setTeamTasks(res.data.tasks);
    } catch (err) {
      console.error("Failed to fetch team tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create task
  const createTask = useCallback(async (taskData) => {
    try {
      const res = await api.post("/tasks", taskData);
      setTasks((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      throw err;
    }
  }, []);

  // Forward task
  const forwardTask = useCallback(async (taskId, forwardData) => {
    try {
      const res = await api.post(`/tasks/${taskId}/forward`, forwardData);
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? res.data : task))
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const value = {
    tasks,
    teamTasks,
    notifications,
    loading,
    fetchMyTasks,
    fetchTeamTasks,
    createTask,
    forwardTask,
    fetchNotifications,
    markNotificationAsRead,
  };

  return (
    <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
  );
}
```

---

## ✅ Part 5: Implementation Checklist

### Backend Implementation Checklist

- [ ] **Database Models**
  - [ ] Update Task model with new fields
  - [ ] Create TaskComment model
  - [ ] Create TaskAttachment model
  - [ ] Create Notification model
  - [ ] Add database indexes for performance

- [ ] **Admin Controllers**
  - [ ] Create admin task controller
  - [ ] Create employee management controller
  - [ ] Create analytics controller
  - [ ] Add authorization middleware

- [ ] **Admin Routes**
  - [ ] GET /api/admin/employees
  - [ ] GET /api/admin/employees/:id
  - [ ] POST /api/admin/tasks
  - [ ] GET /api/admin/tasks
  - [ ] PUT /api/admin/tasks/:id

- [ ] **Employee Controllers**
  - [ ] Update task controller for personal tasks
  - [ ] Create task forwarding logic
  - [ ] Create comment controller
  - [ ] Create notification controller

- [ ] **Employee Routes**
  - [ ] POST /api/tasks (create personal task)
  - [ ] POST /api/tasks/:id/forward
  - [ ] GET /api/tasks/me
  - [ ] GET /api/tasks/team
  - [ ] POST /api/tasks/:id/comments
  - [ ] GET /api/notifications

---

### Frontend Implementation Checklist

- [ ] **Admin Components**
  - [ ] EmployeesManagement.jsx
  - [ ] EmployeeProfile.jsx
  - [ ] CreateTaskModal.jsx
  - [ ] TasksList.jsx
  - [ ] PerformanceDashboard.jsx
  - [ ] Analytics components

- [ ] **Client Components**
  - [ ] Enhanced TaskForm.jsx
  - [ ] KanbanBoard.jsx
  - [ ] TaskForwardModal.jsx
  - [ ] TaskComments.jsx
  - [ ] TeamDashboard.jsx
  - [ ] NotificationCenter.jsx
  - [ ] ActivityFeed.jsx

- [ ] **Context & State Management**
  - [ ] TaskContext with hooks
  - [ ] Notification handling
  - [ ] Real-time updates

- [ ] **Utilities**
  - [ ] Task filtering utilities
  - [ ] Date formatting utilities
  - [ ] Status badge components
  - [ ] Avatar components

---

### Testing Checklist

- [ ] Unit tests for controllers
- [ ] API integration tests
- [ ] Component snapshot tests
- [ ] End-to-end workflow tests
- [ ] Performance testing

---

### Deployment Checklist

- [ ] Database migration script
- [ ] Environment variables updated
- [ ] API documentation updated
- [ ] Frontend build tested
- [ ] User acceptance testing

---

## 📝 Notes

- Consider using WebSockets for real-time notifications
- Implement pagination for large datasets
- Add rate limiting to API endpoints
- Consider caching strategies for frequently accessed data
- Plan for data archival of old tasks/notifications

