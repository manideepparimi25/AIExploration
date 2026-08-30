# TeamPulse

## Project Name

TeamPulse

## Project Description

A lightweight team dashboard for tracking tasks and daily status — built for small teams (5–20 people). Log in, manage tasks, and share daily status updates from one focused place.

Built per `PLAN.md`.

## Features

- User authentication and role-based access
- Task creation, assignment, updates, and comments
- Daily status updates for team members
- Team board showing each user’s latest status
- Profile editing and password updates
- Responsive dashboard for small team collaboration

## Technology Used

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios
- **Backend:** Node.js + Express
- **Database:** SQLite for local development, optional PostgreSQL for production
- **ORM:** Prisma
- **Authentication:** bcrypt + JWT
- **Testing:** Vitest

## How to Install

From the `teampulse/` directory:

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## How to Run Locally

```bash
# Create the database schema and generate Prisma client
npm run db:push

# Load demo data
npm run db:seed

# Start the frontend and backend together
npm run dev
```

Open the app in your browser at http://localhost:5173

## GitHub Repository

https://github.com/manideepparimi25/AIExploration.git

## Live Application URL

- Local development app: http://localhost:5173
- Production deployment: Not deployed yet

## Tech stack

- **Frontend:** React 18 (Vite), React Router, Tailwind CSS, Axios
- **Backend:** Node.js + Express, REST API
- **Database:** SQLite by default for local development; optional PostgreSQL for production or Docker-based setups
- **Auth:** bcrypt + JWT (stateless)
- **Tests:** Vitest

## Prerequisites

- **Node.js 20+** (developed on Node 24)
- Optional: **Docker** if you want to run PostgreSQL locally via `docker-compose.yml`

The repository is set up to work out of the box with a local SQLite file database. If you want PostgreSQL instead, update `server/.env` and `prisma/schema.prisma` to use a `postgresql://` connection string.

## First-time setup

From the `teampulse/` directory:

```bash
# 1. Install all dependencies (client + server, via workspaces)
npm install

# 2. Create local env files if needed
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Create the database schema + generate the Prisma client
npm run db:push          # creates tables from schema (dev workflow)
# npm run db:migrate     # OR: create a versioned migration

# 4. Load demo data
npm run db:seed
```

If you prefer PostgreSQL instead of SQLite, start it with Docker and update the `DATABASE_URL` in `server/.env` before running the Prisma commands:

```bash
docker compose up -d
```

## Run it

```bash
# Start both API (http://localhost:4000) and client (http://localhost:5173)
npm run dev
```

Open http://localhost:5173 and sign in with a demo account:

| Role   | Email                  | Password     |
| ------ | ---------------------- | ------------ |
| Lead   | lead@teampulse.dev     | password123  |
| Member | member@teampulse.dev   | password123  |

Or register a new account (new sign-ups default to the **Member** role).

## Features

- **Auth:** self-registration, login, logout, JWT sessions
- **Tasks:** leads create/assign tasks; members update status on tasks assigned to them; comments
- **Status:** each member posts/updates today's status (working on / blockers)
- **Team board:** everyone's latest status in one place (visible to all members)
- **Profile:** edit display name, change password

## Screens

1. **Login** — sign in
2. **Register** — create an account
3. **Dashboard** — summary cards + my open tasks + team status
4. **Tasks** — filterable list (all / mine / by status) + create-task modal (leads)
5. **Task Detail** — description, status changer, comments
6. **My Status** — post/update today's status
7. **Team Board** — latest status for every member
8. **Profile / Settings** — edit name, change password

## API overview

| Method | Endpoint                    | Auth        | Description                          |
| ------ | --------------------------- | ----------- | ------------------------------------ |
| POST   | `/api/auth/register`        | Public      | Create an account, returns a token  |
| POST   | `/api/auth/login`           | Public      | Exchange credentials for a token    |
| POST   | `/api/auth/logout`          | —           | Client discards token (stateless)   |
| GET    | `/api/auth/me`              | Required    | Current user                         |
| GET    | `/api/tasks?mine=1&status=` | Required    | List/filter tasks                    |
| POST   | `/api/tasks`                | Lead        | Create + assign a task               |
| GET    | `/api/tasks/:id`            | Required    | Task detail with comments            |
| PATCH  | `/api/tasks/:id`            | Lead/Assignee | Update task (assignee: status only) |
| DELETE | `/api/tasks/:id`            | Lead/Creator | Delete a task                        |
| POST   | `/api/tasks/:id/comments`   | Required    | Add a comment                         |
| GET    | `/api/statuses`             | Required    | Team status board (latest per user) |
| GET    | `/api/statuses/me`          | Required    | My latest status                     |
| POST   | `/api/statuses`             | Required    | Upsert today's status                 |
| GET    | `/api/users`                | Required    | Team roster                           |
| GET    | `/api/users/me`             | Required    | My profile                            |
| PATCH  | `/api/users/me`             | Required    | Update name / change password         |

## Scripts

Run from the `teampulse/` root:

| Script             | What it does                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Start API + client together                    |
| `npm run dev:server` / `dev:client` | Start one side               |
| `npm run build`    | Build client (`vite build`)                   |
| `npm run lint`     | Lint client + server                           |
| `npm run test`     | Run unit tests (client + server, Vitest)       |
| `npm run db:push`  | Apply schema to the database (dev)            |
| `npm run db:migrate` | Create/apply a versioned migration         |
| `npm run db:seed`  | Load demo users, tasks, statuses               |

## Project structure

```
teampulse/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── api/            # axios client + endpoint wrappers
│       ├── components/     # Navbar, TaskCard, StatusCard, Modal, ProtectedRoute
│       ├── context/        # AuthContext
│       ├── pages/          # the 8 screens
│       └── utils/          # formatting helpers + tests
├── server/                 # Express + Prisma backend
│   ├── prisma/             # schema.prisma + seed.js
│   └── src/
│       ├── middleware/     # auth (JWT), role guard, error handler
│       ├── routes/         # auth, tasks, statuses, users
│       └── utils/          # jwt + date helpers
├── docker-compose.yml      # local PostgreSQL
└── package.json            # workspaces + shared scripts
```

## Deployment (overview)

- **Backend + DB on Render:** managed PostgreSQL + the Express app as a Web Service (auto-deploy from git). Run migrations via a release command, then seed.
- **Frontend on Vercel:** deploy the `client/` build; set `VITE_API_URL` to the Render API URL.
- Set secrets (`DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, `VITE_API_URL`) in the hosting dashboards — never commit them.

## Notes / limitations

- JWTs are stored in `localStorage` on the client (acceptable for this MVP; revisit with httpOnly cookies for a hardened deployment).
- This build was verified with `prisma generate`, `vite build`, lint, and unit tests. Live end-to-end checks against PostgreSQL require running `docker compose up` + migrations + seed (no Docker was available in the build environment).
