# PLAN.md — TeamPulse (Team Dashboard)

## Application name
**TeamPulse** — a lightweight team dashboard for tracking tasks and daily status. (Working name; easily changed.)

## Problem statement
Small teams (5–20 people) typically rely on scattered spreadsheets and chat threads to track who is working on what and what each member's current status is. There is no single, simple place to see tasks and team status together, and heavy enterprise tools are overkill. TeamPulse gives a small team one focused dashboard to log in, manage tasks, and share daily status updates — without the overhead of bloated project management suites.

## Target users
- Small teams of 5–20 people (e.g., a product, engineering, or project team).
- Two roles:
  - **Member** — manage own tasks, update own status, view team board.
  - **Lead** — everything a member does, plus create/assign tasks to others and manage the team.
- Browser-based; non-technical friendly.

## Main features
1. **Authentication** — self-registration, login, and logout with hashed passwords (bcrypt) and JWT sessions (with expiry and refresh).
2. **Task management** — create, assign, prioritize, and track tasks across statuses (To Do / In Progress / Done).
3. **Status updates** — each member posts a daily status (what I'm working on / blockers).
4. **Dashboard overview** — at-a-glance summary: my open tasks, latest team status, counts.
5. **Team status board** — view all members' latest status in one place, accessible to everyone.
6. **Role-based access** — members vs. leads with appropriate permission differences.
7. **Profile & settings** — edit display name, change password, and view account details.

## Pages / screens required (8)
1. **Login** — email/password sign-in; entry point that redirects to the dashboard.
2. **Register** — onboarding screen: create an account (name, email, password) to join the team.
3. **Dashboard** — home overview: summary cards (my open tasks, team status, counts) and quick links.
4. **Tasks** — filterable task list (assigned to me / all / by status) with an inline create-task form.
5. **Task Detail** — single task view: description, assignee, status, priority, and comments/history.
6. **My Status** — form to post or update today's status (working on / blockers).
7. **Team Board** — all members' latest status cards; visible to everyone (members and leads).
8. **Profile / Settings** — edit display name, change password, and view account details.

## Technology stack
- **Frontend:** React 18 (Vite), React Router, Tailwind CSS, Axios.
- **Backend:** Node.js + Express, REST API.
- **Database:** PostgreSQL.
- **Auth:** bcrypt (password hashing) + JWT (stateless sessions).
- **Tooling:** ESLint, Prettier, Vitest (frontend) + Jest/Supertest (API).
- **Deployment:** Frontend on Vercel; backend API + Postgres on Render.

## Project folder structure
```
teampulse/
├── client/                      # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/          # reusable UI (Navbar, TaskCard, StatusCard, Modal)
│   │   ├── pages/              # Login, Register, Dashboard, Tasks, TaskDetail, MyStatus, TeamBoard, Profile
│   │   ├── api/                # axios client + endpoint wrappers
│   │   ├── context/           # AuthContext (current user, JWT token)
│   │   ├── App.jsx            # routes + protected route wrapper
│   │   └── main.jsx
│   └── package.json
├── server/                      # Express API
│   ├── src/
│   │   ├── routes/            # auth, tasks, statuses, users
│   │   ├── controllers/
│   │   ├── models/            # DB query modules / ORM models
│   │   ├── middleware/        # authJWT, error handler, role guard
│   │   ├── db/                # pool config, migrations, seeds
│   │   └── index.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Data that needs to be stored
- **users** — id, name, email (unique), password_hash, role (member/lead), created_at.
- **tasks** — id, title, description, status (todo/in_progress/done), priority (low/medium/high), assignee_id (FK users), created_by (FK users), created_at, updated_at.
- **statuses** — id, user_id (FK users), working_on, blockers, date, created_at, updated_at.
- **comments** (optional) — id, task_id (FK tasks), user_id (FK users), content, created_at.
- JWTs are used for sessions and are **not** stored server-side.

## Development steps
1. **Setup** — scaffold client (Vite) and server (Express); init git, `.env`, ESLint/Prettier.
2. **Database** — design schema, write migrations + seed data (sample users, tasks).
3. **Auth** — register/login/logout endpoints, JWT issue/verify with expiry/refresh, bcrypt hashing, protected middleware.
4. **Task APIs** — CRUD for tasks; filter by assignee/status; role checks (lead-only actions).
5. **Status APIs** — create/update my status; list latest team status.
6. **Frontend auth** — Login and Register pages, AuthContext, protected routes, token storage, logout.
7. **Frontend screens** — Dashboard, Tasks, Task Detail, My Status, Team Board, Profile/Settings.
8. **Polish** — responsive layout, navbar (with logout), loading/empty/error states.
9. **Testing** — API tests (auth/tasks/statuses) + key component tests.
10. **Deployment** — provision Render Postgres + web service, Vercel frontend, run migrations, set env vars.

## Deployment approach
- **Backend + DB on Render:** managed PostgreSQL instance; Express app deployed as a Web Service from git (auto-deploy on push). Migrations run via a release command or one-off script.
- **Frontend on Vercel:** React build deployed from the `client/` directory off the same git repo; `VITE_API_URL` pointed at the Render backend URL.
- **Environment management:** secrets (JWT secret, DB connection string, API URL) configured in the Render/Vercel dashboards, never committed.
- **Release flow:** push to `main` → automatic build + deploy; preview deploys available for PRs if needed.
