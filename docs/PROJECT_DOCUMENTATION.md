# Lexel Employee Status Tracker

## Project Overview

**Lexel Employee Status Tracker** is a full-stack web application for tracking employees' daily tasks and team progress. Managers can monitor task statuses, approve employee registrations, and oversee development and testing teams — all from a centralized admin panel.

The system operates at two levels:

| Level                         | Purpose                                               | Access                  |
| ----------------------------- | ----------------------------------------------------- | ----------------------- |
| **Employee Level** (Client)   | Employees register, log tasks, view team progress     | Any approved employee   |
| **Admin Level** (Admin Panel) | Approve registrations, manage teams, oversee projects | Single admin email only |

---

## Tech Stack

| Layer    | Technology                         | Reason                               |
| -------- | ---------------------------------- | ------------------------------------ |
| Frontend | React 18 + JavaScript (JSX) + Vite | Modern, fast, lightweight            |
| Styling  | Tailwind CSS v3                    | Utility-first, great UX & typography |
| Backend  | Node.js + Express.js               | Scalable, clean API layer            |
| Database | MongoDB + Mongoose                 | Flexible document store, scalable    |
| Auth     | JWT (JSON Web Tokens)              | Stateless, secure authentication     |
| State    | React Context + useReducer         | Lightweight, no extra dependencies   |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Client (React)                │
│  ┌──────────────────┐  ┌─────────────────────┐  │
│  │  Employee App    │  │   Admin Panel        │  │
│  │  - Sign Up       │  │   - Login            │  │
│  │  - Login         │  │   - Approve Users    │  │
│  │  - Dashboard     │  │   - View All Teams   │  │
│  │  - Team View     │  │   - Future Modules   │  │
│  │  - Task Manager  │  │                      │  │
│  │  - Edit History  │  │                      │  │
│  └──────────────────┘  └─────────────────────┘  │
└──────────────────┬──────────────────────────────┘
                   │ REST API (JSON)
┌──────────────────▼──────────────────────────────┐
│             Backend (Express.js)                 │
│  ┌────────────┐ ┌────────────┐ ┌─────────────┐  │
│  │ Auth       │ │ Employees  │ │ Tasks       │  │
│  │ Controller │ │ Controller │ │ Controller  │  │
│  └─────┬──────┘ └─────┬──────┘ └──────┬──────┘  │
│        │              │               │          │
│  ┌─────▼──────────────▼───────────────▼──────┐   │
│  │           Service Layer                    │   │
│  └─────────────────┬─────────────────────────┘   │
│                    │                             │
│  ┌─────────────────▼─────────────────────────┐   │
│  │       MongoDB (via Mongoose ODM)           │   │
│  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## Database Schema (MongoDB Collections)

### Collections

#### 1. `users`

| Field       | Type     | Constraints         | Description                           |
| ----------- | -------- | ------------------- | ------------------------------------- |
| \_id        | ObjectId | PK, AUTO            | Unique user ID                        |
| firstName   | String   | required            | Employee first name                   |
| lastName    | String   | required            | Employee last name                    |
| email       | String   | required, unique    | Company email ID                      |
| password    | String   | required            | Hashed password (bcrypt)              |
| designation | String   | required            | Job title                             |
| team        | String   | required, enum      | `development`, `testing`, or `others` |
| status      | String   | default: `pending`  | `pending`, `approved`, `rejected`     |
| role        | String   | default: `employee` | `employee` or `admin`                 |
| avatarUrl   | String   | optional            | Profile picture URL                   |
| createdAt   | Date     | auto (timestamps)   | Registration timestamp                |
| updatedAt   | Date     | auto (timestamps)   | Last update timestamp                 |

#### 2. `tasks`

| Field       | Type     | Constraints           | Description                           |
| ----------- | -------- | --------------------- | ------------------------------------- |
| \_id        | ObjectId | PK, AUTO              | Unique task ID                        |
| userId      | ObjectId | ref → users, required | Assigned employee                     |
| title       | String   | required              | Task title                            |
| description | String   | optional              | Task details                          |
| status      | String   | default: `pending`    | `pending`, `in_progress`, `completed` |
| priority    | String   | default: `medium`     | `low`, `medium`, `high`               |
| taskType    | String   | default: `current`    | `current`, `future`                   |
| taskDate    | Date     | required              | Date the task belongs to              |
| createdAt   | Date     | auto (timestamps)     | Creation timestamp                    |
| updatedAt   | Date     | auto (timestamps)     | Last update timestamp                 |

#### 3. `taskedithistories`

| Field        | Type     | Constraints           | Description              |
| ------------ | -------- | --------------------- | ------------------------ |
| \_id         | ObjectId | PK, AUTO              | Unique history ID        |
| taskId       | ObjectId | ref → tasks, required | Task that was edited     |
| editedBy     | ObjectId | ref → users, required | Who made the edit        |
| fieldChanged | String   | required              | Which field was modified |
| oldValue     | String   | optional              | Previous value           |
| newValue     | String   | optional              | New value                |
| editedAt     | Date     | default: Date.now     | When the edit was made   |

---

## API Endpoints

### Authentication

| Method | Endpoint                | Description              | Auth |
| ------ | ----------------------- | ------------------------ | ---- |
| POST   | `/api/auth/register`    | Employee registration    | None |
| POST   | `/api/auth/login`       | Employee login           | None |
| POST   | `/api/auth/admin/login` | Admin login              | None |
| GET    | `/api/auth/me`          | Get current user profile | JWT  |

### Users (Admin)

| Method | Endpoint                       | Description                | Auth  |
| ------ | ------------------------------ | -------------------------- | ----- |
| GET    | `/api/admin/pending-users`     | List pending registrations | Admin |
| PUT    | `/api/admin/users/:id/approve` | Approve a user             | Admin |
| PUT    | `/api/admin/users/:id/reject`  | Reject a user              | Admin |
| GET    | `/api/admin/users`             | List all approved users    | Admin |

### Teams & Employees

| Method | Endpoint                   | Description                     | Auth |
| ------ | -------------------------- | ------------------------------- | ---- |
| GET    | `/api/teams/development`   | List development team members   | JWT  |
| GET    | `/api/teams/testing`       | List testing team members       | JWT  |
| GET    | `/api/teams/others`        | List other team members         | JWT  |
| GET    | `/api/employees/:id`       | Get employee profile & tasks    | JWT  |
| GET    | `/api/employees/:id/tasks` | Get employee tasks with filters | JWT  |

### Tasks

| Method | Endpoint                 | Description                         | Auth |
| ------ | ------------------------ | ----------------------------------- | ---- |
| POST   | `/api/tasks`             | Create a new task                   | JWT  |
| PUT    | `/api/tasks/:id`         | Update task (triggers edit history) | JWT  |
| GET    | `/api/tasks/:id`         | Get single task details             | JWT  |
| GET    | `/api/tasks/:id/history` | Get edit history for a task         | JWT  |
| DELETE | `/api/tasks/:id`         | Delete a task                       | JWT  |

---

## User Flows

### Flow 1: Employee Registration & Approval

```
Employee visits Sign Up page
        │
        ▼
Fills: First Name, Last Name, Company Email, Password, Designation, Team
        │
        ▼
System saves user with status = "pending"
        │
        ▼
Admin sees new registration request in Admin Panel
        │
        ├── Approve → User status = "approved" → Employee can now log in
        │
        └── Reject → User status = "rejected" → Employee cannot access system
```

### Flow 2: Employee Daily Workflow

```
Employee logs in
        │
        ▼
Dashboard shows: Today's Tasks, Pending Tasks, Summary
        │
        ▼
Left sidebar: Development Team | Testing Team | Others
        │
        ▼
Click team → See team members list
        │
        ▼
Click member → See their tasks:
    ├── Current Tasks (today)
    ├── Pending Tasks
    ├── Future Tasks
    └── History (past tasks with edit trail)
```

### Flow 3: Task Editing with History

```
Employee clicks "Edit" on a task
        │
        ▼
Makes changes (title, description, status, etc.)
        │
        ▼
System records in taskedithistories:
    - Which field changed
    - Old value → New value
    - Who edited
    - Date & Time of edit
        │
        ▼
Anyone (including manager) can view the full edit timeline
```

---

## UI/UX Design Specification

### Layout Structure

```
┌──────────────────────────────────────────────────────┐
│  NAVBAR: [Company Logo]          [User Profile ▾]    │
├──────────┬───────────────────────────────────────────┤
│          │                                           │
│ SIDEBAR  │              MAIN CONTENT                 │
│          │                                           │
│ ◉ Dev    │  ┌─────────────────────────────────────┐  │
│   Team   │  │  Dashboard / Team View / Tasks      │  │
│          │  │                                     │  │
│ ◉ Test   │  │                                     │  │
│   Team   │  │                                     │  │
│          │  │                                     │  │
│ ◉ Others │  └─────────────────────────────────────┘  │
│          │                                           │
└──────────┴───────────────────────────────────────────┘
```

### Typography

| Element       | Font           | Size | Weight          |
| ------------- | -------------- | ---- | --------------- |
| Headings (H1) | Inter          | 28px | 700 (Bold)      |
| Headings (H2) | Inter          | 22px | 600 (Semi-bold) |
| Body Text     | Inter          | 15px | 400 (Regular)   |
| Small/Labels  | Inter          | 13px | 500 (Medium)    |
| Code/Data     | JetBrains Mono | 14px | 400             |

### Color Palette

| Purpose        | Color       | Hex       |
| -------------- | ----------- | --------- |
| Primary        | Indigo      | `#4F46E5` |
| Primary Hover  | Dark Indigo | `#4338CA` |
| Success        | Emerald     | `#10B981` |
| Warning        | Amber       | `#F59E0B` |
| Danger         | Rose        | `#F43F5E` |
| Background     | Slate 50    | `#F8FAFC` |
| Surface        | White       | `#FFFFFF` |
| Text Primary   | Slate 900   | `#0F172A` |
| Text Secondary | Slate 500   | `#64748B` |
| Border         | Slate 200   | `#E2E8F0` |

### Component Specifications

1. **Sign Up / Login Pages** — Centered card layout, clean form fields, company branding.
2. **Navbar** — Fixed top, company logo left, user avatar + name dropdown right.
3. **Sidebar** — Fixed left, collapsible, team navigation with icons and member counts.
4. **Team Members Grid** — Card-based grid showing avatar, name, designation, active task count.
5. **Task Cards** — Status-colored left border, title, date, priority badge, quick actions.
6. **Edit History Timeline** — Vertical timeline showing each change with diff (old → new), timestamp, editor name.
7. **Profile Dropdown** — User name, email, designation, team badge, logout.

---

## Folder Structure

```
Lexel_employe_status/
├── docs/
│   └── PROJECT_DOCUMENTATION.md
├── server/                         # Backend
│   ├── src/
│   │   ├── index.js               # Express app entry point
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js            # User Mongoose model
│   │   │   ├── Task.js            # Task Mongoose model
│   │   │   └── TaskEditHistory.js # Edit history model
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification middleware
│   │   │   └── adminAuth.js       # Admin-only middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # Auth endpoints
│   │   │   ├── admin.routes.js    # Admin endpoints
│   │   │   ├── team.routes.js     # Team endpoints
│   │   │   └── task.routes.js     # Task endpoints
│   │   └── controllers/
│   │       ├── auth.controller.js
│   │       ├── admin.controller.js
│   │       ├── team.controller.js
│   │       └── task.controller.js
│   ├── .env                        # Environment variables
│   └── package.json
├── client/                         # Frontend
│   ├── src/
│   │   ├── main.jsx               # React entry
│   │   ├── App.jsx                # Root component + router
│   │   ├── api/
│   │   │   └── client.js          # Axios instance
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state management
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── SignUpForm.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── teams/
│   │   │   │   ├── TeamView.jsx
│   │   │   │   └── MemberCard.jsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskList.jsx
│   │   │   │   ├── TaskCard.jsx
│   │   │   │   ├── TaskForm.jsx
│   │   │   │   └── EditHistory.jsx
│   │   │   └── admin/
│   │   │       ├── AdminLogin.jsx
│   │   │       ├── AdminDashboard.jsx
│   │   │       └── PendingUsers.jsx
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── SignUpPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── TeamPage.jsx
│   │       ├── EmployeePage.jsx
│   │       ├── AdminLoginPage.jsx
│   │       └── AdminDashboardPage.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env
└── README.md
```

---

## Security Considerations

| Area             | Approach                                                   |
| ---------------- | ---------------------------------------------------------- |
| Passwords        | bcrypt hashing (12 salt rounds)                            |
| Auth Tokens      | JWT with expiry (24h), stored in httpOnly cookie or memory |
| Admin Access     | Restricted to single whitelisted email                     |
| Input Validation | Server-side validation on all endpoints                    |
| NoSQL Injection  | Mongoose schema validation + express-mongo-sanitize        |
| XSS              | React's built-in escaping + no dangerouslySetInnerHTML     |
| CORS             | Configured to allow only the client origin                 |

---

## Scalability Notes

- **Database**: MongoDB scales horizontally with sharding and replica sets.
- **Codebase**: Clean separation of concerns (controllers → services → models).
- **Frontend**: Component-based architecture; each feature is a self-contained module.
- **Future Modules**: The admin panel is designed to accommodate new features (reports, notifications, project management) via the sidebar and routing system.

---

## Getting Started

```bash
# 1. Install server dependencies
cd server && npm install

# 2. Install client dependencies
cd client && npm install

# 3. Start MongoDB (must be running locally or use MongoDB Atlas URI in .env)

# 4. Start backend (runs on port 5000)
cd server && npm run dev

# 5. Start frontend (runs on port 5173)
cd client && npm run dev
```

### Environment Variables

**server/.env**

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lexel_employee_status
JWT_SECRET=your_jwt_secret_key_here
ADMIN_EMAIL=admin@lexel.com
ADMIN_PASSWORD=Admin@123
```

**client/.env**

```
VITE_API_URL=http://localhost:5000/api
```

Default admin credentials:

- Email: `admin@lexel.com`
- Password: `Admin@123`

---

_Document Version: 2.0 | Updated: April 2, 2026 | Stack: React (JSX) + Express.js + MongoDB_
