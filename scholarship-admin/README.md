# Scholarship and Fellowship Admin Panel — Starter (SIH26239)

This is the starting scaffold for the web admin side: a Node/Express backend
with JWT authentication, and a React (Vite) frontend with a login page and a
protected dashboard route.

## Folder structure

```
scholarship-admin/
  backend/     Express API, MongoDB models, JWT auth
  frontend/    React (Vite) app - login + dashboard
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set:
- `MONGO_URI` — your MongoDB connection string (local MongoDB or a free MongoDB
  Atlas cluster)
- `JWT_SECRET` — any long random string

Create the first admin account (run once):

```bash
npm run seed:admin -- admin@mota.gov.in yourpassword "Admin Name"
```

Start the server:

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Test it:

```bash
curl http://localhost:5000
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mota.gov.in","password":"yourpassword"}'
```

The login response returns a `token` — that token is what the frontend stores
and sends on every request afterwards.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. It redirects to `/login`. Sign in with the admin
account you seeded above — you'll land on `/dashboard`.

## Demo data

```bash
cd backend
npm run seed:admin -- officer@tribal.gov.in Officer@123 "Meera Lakra"
npm run seed:applications     # 20 demo applications across Pre-Matric, NFST and NOS
npm run backfill:review       # only for applications created before this version
```

The seed replaces only its own records (`@demo.tribexcel.in` students). It does not
invent AI results: every demo application shows "AI analysis not run" until an officer
clicks **Run AI analysis** with the ai-engine running.

## Admin portal

| Route | Screen |
|---|---|
| `/login` | Officer login (rate limited: 5 failed attempts per 15 minutes) |
| `/dashboard` | Summary cards, processing overview, scheme-wise, status distribution, AI summary, priority queue, recent applications |
| `/queue` | Review queue: highest priority first, with the reason for each flag |
| `/applications`, `/applications/:view` | All / pending / flagged / defective / verified / rejected with search and filters |
| `/application/:id` | Review workspace: applicant, scheme, eligibility, documents, AI analysis, cross-checks, rule evaluation, officer decision, history |
| `/merit` | Merit / selection by scheme guidelines (no generated scores) |
| `/analytics` | KPIs and simple charts |

Status values are shared with the student portal: `Pending` = Pending review,
`Flagged` = Human review, `Deficient` = Correction required, `Eligible` = Verified,
`Selected`, `Rejected`. Submissions are never approved automatically; AI and rule
results only route an application to the officer, who records the final decision.

### Environment keys (backend/.env)

| Key | Purpose |
|---|---|
| `AI_ENGINE_URL` | ai-engine base URL (default `http://localhost:8000`) |
| `AI_ENGINE_SCHEMES` | Schemes the engine covers (default `NFST,NOS`) |
| `AI_SEND_FILE_CONTENT` | `true` sends uploaded files for OCR at submission |
| `AI_ENGINE_TIMEOUT_MS` | Engine timeout (default 4000, or 20000 with files) |

## What's included right now

- Admin model with hashed passwords (bcrypt)
- POST `/api/admin/login` — returns a JWT
- GET `/api/admin/me` — protected route, returns the logged-in admin's profile
- `protect` middleware — reusable on any future route that needs auth
- React `AuthContext` — holds the logged-in admin, exposes `login()`/`logout()`
- `ProtectedRoute` — redirects to `/login` if no admin is logged in
- Login page with validation and error handling
- Placeholder dashboard page

## Next pieces to build (in order)

1. Review queue page + `GET /api/applications` endpoint with filters
2. Application detail page + `GET /api/applications/:id`
3. Merit list generation + selection approval
4. Analytics dashboard

No homepage was built on purpose — this is an internal tool, so the root path
goes straight to the login screen.
