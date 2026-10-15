# NoteKeep Studio 🚀 (Decoupled Frontend & Backend Architecture)

A hybrid productivity workspace blending **Google Keep's quick card capture** with **Notion's structured markdown and Kanban board**, architected with a completely decoupled **Next.js Frontend** and an **Express.js + Prisma + SQLite Backend**.

---

## 🏛️ Project Architecture

```
Notes/
├── client/                      # Frontend (Next.js 15, React 19, Tailwind CSS)
│   ├── src/
│   │   ├── app/                 # Next.js App Router (UI Pages & Layouts)
│   │   ├── components/          # React Components (NoteCard, Editor, Kanban, AuthModal, etc.)
│   │   ├── lib/                 # API Client (Automatic JWT Bearer injection)
│   │   ├── styles/              # Global Design Tokens & Tailwind CSS
│   │   └── types/               # Shared TypeScript Interfaces
│   ├── next.config.mjs          # Proxy rewrite forwarding /api/* to Express backend
│   └── package.json
│
├── backend/                     # Backend API (Express.js, TypeScript, Prisma, SQLite)
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma Data Models (User, Note, Tag)
│   │   └── dev.db               # SQLite Local Database (Zero-config)
│   ├── src/
│   │   ├── middleware/          # JWT Authentication Middleware
│   │   ├── routes/              # Express REST API Routes (Auth, Notes, Tags, Seed)
│   │   ├── prisma.ts            # Prisma Client Singleton
│   │   ├── seed.ts              # Database Seeder
│   │   └── index.ts             # Express Server Entrypoint (Port 5000)
│   └── package.json
│
├── package.json                 # Monorepo Orchestration Scripts (concurrently)
└── README.md
```

---

## 🔒 How User Data is Stored in the Backend

All data is now securely persisted in a local **SQLite database** using **Prisma ORM** instead of client-side or flat JSON files.

1. **User Accounts (`User` model)**:
   - User authentication using hashed passwords (`bcryptjs`).
   - Secure session tokens (`jsonwebtoken`) sent with each request as `Authorization: Bearer <token>`.
2. **User Data Isolation (`Note` & `Tag` models)**:
   - Each note and tag is linked to a `userId` foreign key with cascade deletion.
   - When a user logs in, only their private notes, tasks, checklists, and tags are returned.
   - A demo fallback account (`demo@notekeep.local`) is automatically seeded so guest browsing works seamlessly out-of-the box.

---

## 🚀 Getting Started

### 1. Install Dependencies
From the root directory:
```bash
# Install root orchestration tools
npm install

# Install client and backend dependencies (if needed)
npm --prefix backend install
npm --prefix client install
```

### 2. Initialize the SQLite Database
The database schema is managed with Prisma:
```bash
npm --prefix backend run prisma:push
```

### 3. Run Both Frontend and Backend Concurrently
From the root directory, simply run:
```bash
npm run dev
```

This starts:
- 🌐 **Frontend (Next.js)**: [http://localhost:3000](http://localhost:3000)
- 🚀 **Backend (Express API)**: [http://localhost:5000](http://localhost:5000)

### 4. Running Services Individually (Optional)
If you prefer running services in separate terminal windows:
```bash
# In terminal 1 (Backend API)
npm run dev:backend

# In terminal 2 (Frontend Client)
npm run dev:client
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account & auto-seed starter notes | No |
| `POST` | `/api/auth/login` | Sign in with email & password, returns JWT | No |
| `GET` | `/api/auth/me` | Fetch profile of authenticated user | Yes |
| `GET` | `/api/notes` | Get all notes (supports `?view=`, `?tag=`, `?search=`) | Optional |
| `POST` | `/api/notes` | Create a new note | Optional |
| `GET` | `/api/notes/:id` | Get note by ID | Optional |
| `PUT` | `/api/notes/:id` | Update note fields (pinned, theme, content, etc.) | Optional |
| `DELETE` | `/api/notes/:id` | Soft delete to trash or `?permanent=true` hard delete | Optional |
| `GET` | `/api/tags` | Get user & system tags | Optional |
| `POST` | `/api/tags` | Create a new tag | Optional |
| `POST` | `/api/seed` | Reset user notes & restore demo dataset | Optional |

---

## 🛠️ Inspecting the SQLite Database
You can open Prisma Studio GUI at any time to visually inspect or edit rows in the SQLite database:
```bash
npm run prisma:studio
```
Or directly from `backend/`:
```bash
npx prisma studio
```