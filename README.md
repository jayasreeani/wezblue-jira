# Nova Enterprise Project Management SaaS Platform (Jira Clone)

A modern, full-featured enterprise Agile & DevOps Project Management SaaS platform modeled after Atlassian Jira. Built with Next.js 14 (App Router), React 18, Tailwind CSS, and a comprehensive PostgreSQL relational database schema via Prisma.

---

## 🌟 Key Modules & Capabilities

1. **Authentication & RBAC (Role-Based Access Control)**
   - Pre-configured with 6 enterprise personas: `ADMIN`, `PROJECT_MANAGER`, `PRODUCT_OWNER`, `DEVELOPER`, `QA_ENGINEER`, and `VIEWER`.
   - Live **RBAC Persona Switcher** in the top navigation bar to test granular security permissions immediately.
   - Comprehensive permissions matrix enforcing project creation, sprint lifecycle, issue editing, status transitions, and user management.

2. **User Management & Directory**
   - Enterprise member directory with departmental categorization, security roles, and active assignments count.
   - Interactive user invite modal and dynamic role elevation.

3. **Project Management**
   - Multi-project workspace support (`NOVA`, `CYBER`, etc.).
   - Support for multiple methodologies: **Scrum** (sprints, story points, burndown) and **Kanban** (continuous delivery flow).
   - Project keys, settings, and team allocation.

4. **Epic Management & Strategic Roadmap**
   - High-level initiative cards with real-time percentage progress bars based on completed story points.
   - Color coding, strategic goals, and linked child issues breakdown.

5. **Story Management**
   - User stories with Fibonacci story point estimation (1, 2, 3, 5, 8, 13).
   - Acceptance criteria format (Given / When / Then).
   - Linked subtasks and epic relationships.

6. **Task Management**
   - Work breakdown checklist with interactive toggle completion.
   - Assignees, priorities, due dates, and real-time status transitions.

7. **Bug Tracking & Defect Management**
   - Bug-specific diagnostics: Severity (`CRITICAL`, `MAJOR`, `MINOR`, `TRIVIAL`), environment details, and structured reproduction steps.
   - Defect density metrics in executive reports.

8. **Sprint Management & Cadence**
   - Full sprint lifecycle: `FUTURE` -> `ACTIVE` -> `COMPLETED`.
   - Sprint duration, dates, sprint goals, and velocity calculation upon completion.
   - Automatic rollover of incomplete issues to future sprints or the product backlog.

9. **Backlog Grooming & Sprint Planning**
   - Jira-style backlog interface: Active Sprint container, Planned Sprints, and General Backlog bucket.
   - Quick one-click issue movement between sprints and backlog.
   - Inline sprint creation and capacity rollups.

10. **Interactive Drag-and-Drop Kanban Board**
    - Fluid HTML5 drag-and-drop across 5 status columns: `BACKLOG`, `TO DO`, `IN PROGRESS`, `IN REVIEW`, and `DONE`.
    - Real-time status transitions with audit logging.
    - Quick filters: Only My Issues, Type filters (Story, Task, Bug, Epic), Assignee avatar chips, and keyword search.

11. **Active Scrum Board**
    - Active sprint execution board with sprint health progress bar, days remaining countdown, and committed vs completed story points.
    - Drag-and-drop workflow with "Complete Sprint" dialog.

12. **Executive Dashboard & Reporting**
    - **Interactive Burndown Chart**: Visual SVG graph comparing Ideal guideline vs Actual remaining points across sprint days.
    - **Velocity Chart**: Historical committed vs delivered story points comparison.
    - **Workflow Status & Defect Distribution**: Visual breakdown of workload.
    - **Immutable Audit Event Stream**: Real-time activity log tracking status transitions, comments, and assignments.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, Tailwind CSS, Lucide React icons
- **Data Access & Schema**: PostgreSQL, Prisma ORM (`prisma/schema.prisma` & `prisma/schema.sql`)
- **State & Data Store**: Isomorphic Repository Layer with realistic enterprise seed data
- **Deployment**: Docker, Docker Compose, Node.js 20 Alpine

---

## 🚀 Quick Start Guide

### Option 1: Running Locally (Instant Start)

No pre-configured database is required for local evaluation. The platform includes an isomorphic in-memory repository pre-hydrated with realistic enterprise data.

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Running with Docker & PostgreSQL

```bash
# Start PostgreSQL 16 and the Next.js SaaS platform in containers
docker-compose up --build
```

Access the application at [http://localhost:3000](http://localhost:3000).

---

## 🔒 Pre-Seeded Enterprise Users (RBAC)

Use the top-right persona switcher to test the application under different roles:

| User | Role | Department | Permissions Summary |
| :--- | :--- | :--- | :--- |
| **Sarah Jenkins** | `ADMIN` | Executive & DevOps | Full platform access, user directory, project settings |
| **David Chen** | `PROJECT_MANAGER` | Product Delivery | Manage projects, start/complete sprints, assign issues |
| **Elena Rostova** | `PRODUCT_OWNER` | Product Strategy | Backlog grooming, create sprints, manage user stories |
| **Alex Rivera** | `DEVELOPER` | Core Engineering | Create/edit issues, drag-and-drop status, add comments |
| **Priya Patel** | `QA_ENGINEER` | Quality Assurance | Log defects, test verification, attach crash logs |
| **Marcus Vance** | `VIEWER` | Stakeholder | Read-only access to boards, roadmaps, and dashboards |

---

## ⌨️ Keyboard Shortcuts

- `Ctrl + K` or `Cmd + K`: Open Global Command Palette Search across all issues, epics, and keys.
- `C`: Quick create issue modal from any screen.
- `Esc`: Close open drawers and modals.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth` | `GET`, `POST` | Get active session / switch active persona |
| `/api/users` | `GET`, `POST`, `PATCH` | List users, invite new user, update RBAC role |
| `/api/projects` | `GET`, `POST` | List projects, create new Scrum/Kanban project |
| `/api/issues` | `GET`, `POST` | Query filtered issues, create new work item |
| `/api/issues/[id]` | `GET`, `PATCH`, `DELETE` | Retrieve issue, update status/fields, delete issue |
| `/api/sprints` | `GET`, `POST` | List sprints for project, create sprint |
| `/api/sprints/[id]` | `PATCH` | Start sprint or complete sprint with carry-over |
| `/api/epics` | `GET`, `POST` | Retrieve roadmap epics, create epic |
| `/api/comments` | `POST` | Post comment with author tag and audit log |
| `/api/attachments` | `POST` | Attach file metadata to issue |
| `/api/reports` | `GET` | Calculate burndown curve, velocity, and distributions |
| `/api/activity` | `GET` | Stream recent audit logs |
| `/api/notifications`| `GET`, `PATCH` | Fetch unread notifications, mark as read |

---

## 📁 Project Directory Structure

```
├── Dockerfile                  # Production multi-stage Docker build
├── docker-compose.yml          # Container orchestration (App + PostgreSQL 16)
├── prisma/
│   ├── schema.prisma           # Prisma relational PostgreSQL schema
│   └── schema.sql              # Raw PostgreSQL DDL migration dump
├── src/
│   ├── app/
│   │   ├── api/...             # 14 REST API route handlers
│   │   ├── globals.css         # Tailwind Jira theme & scrollbars
│   │   ├── layout.tsx          # Root layout with top nav & modals
│   │   └── page.tsx            # Dynamic view switcher
│   ├── components/
│   │   ├── layout/             # TopNav & Sidebar
│   │   ├── boards/             # KanbanBoard & ScrumBoard (Drag-and-Drop)
│   │   ├── backlog/            # BacklogView & Sprint planning
│   │   ├── issues/             # CreateIssueModal & IssueDetailDrawer
│   │   ├── epics/              # EpicsView & Roadmap cards
│   │   ├── sprints/            # SprintsView & Velocity metrics
│   │   ├── reports/            # DashboardView & Burndown chart
│   │   ├── users/              # UserManagementView & RBAC matrix
│   │   ├── projects/           # ProjectSettingsView
│   │   └── common/             # CommandPalette & ToastNotification
│   ├── context/
│   │   └── AppContext.tsx      # Global state, RBAC rules, notifications
│   └── lib/
│       ├── types.ts            # TypeScript interfaces & RBAC matrix
│       ├── seed-data.ts        # Realistic enterprise seed data
│       └── store.ts            # Enterprise data repository
```
