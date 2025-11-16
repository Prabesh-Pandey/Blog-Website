# Simple Blog (Intern Edition)

This is a small full-stack blog project (Node/Express + MongoDB backend, React frontend) created as a learning project.

Goals of this change-set
- Make the project easier to run and understand.
- Add small, human-friendly notes and configuration so a new developer (an intern!) can pick it up.

Quick start (backend)

1. Copy `backend/.env.example` to `backend/.env` and set your `MONGO_URI` and `JWT_SECRET`.
2. Install backend deps and run:

```powershell
cd backend
npm install
npm run dev
```

Quick start (frontend)

```powershell
cd frontend
npm install
npm run dev
```

Notes and conventions
- The backend uses JWT for simple auth and MongoDB for persistence.
- The frontend stores a token in `localStorage` and the API client attaches it on requests.
- This repo intentionally keeps things small and readable — it's suitable for teaching and quick iteration.

Intern TODOs (small starter tasks)
- Add unit tests for backend route handlers.
- Add client-side route guards and improve form validation UI.
- Add a production-ready build and process for environment variables.

If anything is unclear, open an issue or ping the maintainer — this repo is intentionally simple.
