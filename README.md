# Student Scholarship Portal — Starter

This is the student-facing website: registration, login, and a protected
dashboard placeholder. It talks to the **same backend** already built for
the admin panel — no separate server or database needed.

## 1. Backend

This frontend needs the student-auth routes added to your existing
`scholarship-admin/backend` project. If you haven't already, copy in the
files from `backend-update3.zip`:

| File in that zip | Goes to |
|---|---|
| `Student.js` | `backend/models/Student.js` |
| `studentAuthController.js` | `backend/controllers/studentAuthController.js` |
| `studentAuthMiddleware.js` | `backend/middleware/studentAuthMiddleware.js` |
| `studentAuthRoutes.js` | `backend/routes/studentAuthRoutes.js` |
| `server.js` | `backend/server.js` (overwrite — adds the new route mount) |

Restart the backend (`npm run dev`) after copying these in. No new
environment variables are needed — it reuses the same `MONGO_URI` and
`JWT_SECRET` already in your `.env`.

New endpoints this adds:
- `POST /api/student/register`
- `POST /api/student/login` (body: `{ identifier, password }` — identifier
  can be email or roll number)
- `GET /api/student/me` (protected)

## 2. This frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Runs on `http://localhost:5174` (different port from the admin panel's
5173, so you can run both at once). Visit it, click **Sign Up**, fill in
the form, and you'll land on the dashboard — fully working registration
and login.

## What's included

- Landing page with Sign Up / Login buttons
- Signup form: name, email, phone, roll number, date of birth, state,
  password, confirm password
- Login with either email or roll number + password
- `AuthContext` storing the logged-in student, `ProtectedRoute` guarding
  `/dashboard`
- Placeholder dashboard

## Next pieces to build (in order)

1. Scheme selection page
2. Application form (dynamic per scheme)
3. Document upload (manual + DigiLocker)
4. Status tracking page

These follow the same pattern as the admin panel — build the UI (e.g. via
Antigravity), then wire it to real backend endpoints once those exist.
