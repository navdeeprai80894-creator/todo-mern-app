# Taskboard — MERN To-Do Application

React + Express + MongoDB task manager with JWT authentication.

## Features
- Full CRUD over a REST API, scoped per user (users can only see and change their own tasks)
- **Status workflow:** Pending → In progress → Completed (and Reopen). `completedAt` is recorded automatically
- **Pagination, filtering (status, priority, text search) and sorting** — all done in MongoDB, with indexes
- **JWT authentication**, bcrypt password hashing (12 rounds), login/register rate limiting
- **Server-side validation (zod)** and structured errors: `{ success:false, error:{ message, details[] } }`
- Handles Mongoose validation, bad ObjectIds, duplicate emails, expired tokens and malformed JSON
- React hooks (`useTasks`, `useDebounce`), context-based auth, reusable components, accessible modal form
- Helmet, CORS allow-list, request body size limit

## Structure
```
server/src
  config/        env + database connection
  models/        User, Task (Mongoose)
  validators/    zod schemas
  middleware/    auth (JWT), validate, error handler
  controllers/   auth + task logic
  routes/        auth.routes, task.routes
client/src
  context/       AuthContext
  hooks/         useTasks, useDebounce
  components/    TaskItem, TaskForm, Pagination
  pages/         AuthPage, Dashboard
```

## Run locally
Requires Node 18+ and MongoDB (local, or a free Atlas cluster).

```bash
npm run install:all
cp server/.env.example server/.env      # set MONGO_URI and JWT_SECRET
npm run dev                             # API :5000, client :5173
```

## API
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` → `{ user, token }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ user, token }` |
| GET | `/api/auth/me` | Current user (Bearer token) |
| GET | `/api/tasks` | Query: `page, limit(≤50), status, priority, search, sortBy(createdAt\|updatedAt\|dueDate\|title), order(asc\|desc)` |
| GET | `/api/tasks/stats` | Counts per status |
| POST | `/api/tasks` | `{ title, description?, status?, priority?, dueDate? }` |
| GET/PUT/DELETE | `/api/tasks/:id` | Read, update, delete |
| PATCH | `/api/tasks/:id/status` | `{ status }` |

Send `Authorization: Bearer <token>` on all `/api/tasks` routes.

## Production
```bash
npm run build
NODE_ENV=production npm start           # Express serves client/dist and the API on one port
```
Set `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production` and `CLIENT_ORIGIN` on your host (Render, Railway…). Build command: `npm run install:all && npm run build`. Start command: `npm start`.
