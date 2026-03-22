# Learnova — Frontend (React + Vite + Tailwind)

This folder contains the **React** web app for the Learnova eLearning platform. It talks to the Spring Boot API in the parent directory.

## Stack

- **React 19** + **Vite 8**
- **React Router** — routing and protected routes
- **Tailwind CSS** — styling
- **Axios** — HTTP client to backend

## Prerequisites

- Node.js 18+ and npm

## Install & run

```bash
npm install
```

Point the app at your API (default in code: `http://localhost:8080`):

```bash
# Windows PowerShell
$env:VITE_API_BASE_URL="http://localhost:8080"
npm run dev
```

Or create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
```

Output is in `frontend/dist/`. Serve with any static file server or integrate with your deployment pipeline.

## Main routes

| Path | Description |
|------|-------------|
| `/courses` | Published courses |
| `/login`, `/register` | Authentication |
| `/my-courses` | Learner dashboard |
| `/courses/:courseId` | Course detail |
| `/player/:courseId/:enrollmentId` | Full-screen lesson/quiz player |
| `/admin` | Instructor/admin back-office (JWT role required) |

## Full project documentation

See the repository root **[README.md](../README.md)** for backend setup, database, and architecture.

**Complete REST API list:** [README.md — API Endpoints](../README.md#api-endpoints) (root `README.md`, section **API Endpoints**).
