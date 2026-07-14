# Task Manager App

A full-stack task manager with email/password authentication.

- **Backend:** ASP.NET Core 8 Web API + Entity Framework Core (SQLite) + JWT authentication
- **Frontend:** Angular 18 (standalone components, reactive forms)

## Features

- Register with email, password, and confirm password
- Log in with email and password (JWT-secured API)
- View, add, edit, delete tasks
- Each task has a title, description, and scheduled date/time
- Mark tasks complete/incomplete
- Log out
- Tasks are private per user — the API only returns the logged-in user's tasks

## Project structure

```
task-manager-app/
├── backend/
│   └── TaskManager.Api/      # ASP.NET Core Web API
└── frontend/                 # Angular app
```

## 1. Run the backend

Requirements: [.NET 8 SDK](https://dotnet.microsoft.com/download)

```bash
cd backend/TaskManager.Api
dotnet restore
dotnet run
```

The API starts at **http://localhost:5000** (Swagger UI at `http://localhost:5000/swagger`).

The SQLite database file (`taskmanager.db`) and its schema are created automatically the first time you run the app — no manual migration step needed.

> To change the JWT secret or SQLite file location, edit `appsettings.json`.

## 2. Run the frontend

Requirements: [Node.js 18+](https://nodejs.org) and npm

```bash
cd frontend
npm install
npm start
```

The app starts at **http://localhost:4200** and is already configured (see `src/environments/environment.ts`) to call the API at `http://localhost:5000/api`.

## 3. Use the app

1. Open http://localhost:4200 — you'll land on the login page.
2. Click **Register here**, create an account with an email, password, and confirm password.
3. You're automatically logged in and taken to the tasks page.
4. Add tasks with a title, optional description, and a scheduled date/time.
5. Edit or delete any task, or check it off as complete.
6. Click **Log out** to end your session.

## Notes on security

- Passwords are hashed with PBKDF2 (SHA-256, 100,000 iterations) with a per-user random salt — never stored in plain text.
- Authentication uses a signed JWT bearer token, sent as `Authorization: Bearer <token>` on every request to `/api/tasks/*`.
- The token is stored in the browser's `localStorage`. For production use, consider an httpOnly cookie instead, and move the JWT signing key out of `appsettings.json` into a secret manager or environment variable.
- CORS is currently restricted to `http://localhost:4200`; update the policy in `Program.cs` if you deploy the frontend elsewhere.

## API reference

| Method | Route                  | Auth required | Description                     |
|--------|-------------------------|:--------------:|----------------------------------|
| POST   | `/api/auth/register`    | No             | Create an account, returns a JWT |
| POST   | `/api/auth/login`       | No             | Log in, returns a JWT            |
| GET    | `/api/tasks`             | Yes            | List the current user's tasks    |
| GET    | `/api/tasks/{id}`        | Yes            | Get one task                     |
| POST   | `/api/tasks`             | Yes            | Create a task                    |
| PUT    | `/api/tasks/{id}`        | Yes            | Update a task                    |
| DELETE | `/api/tasks/{id}`        | Yes            | Delete a task                    |
