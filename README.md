# DOST XI PSTO Performance Monitoring System

A premium, interactive performance monitoring dashboard built for the **Department of Science and Technology (DOST) Regional Office XI** to track, audit, and analyze performance metrics against targets.

---

## 🚀 Tech Stack

* **Frontend**: React 18, Vite 8, TypeScript 5.8, TailwindCSS 3.4, `shadcn/ui`, Framer Motion, Recharts.
* **Backend**: Node.js, Express, TypeScript running on port `5000`.
* **Database**: PostgreSQL hosted on Supabase (accessed via PostgREST and node-postgres).

---

## 📂 Project Structure

```
├── .github/workflows/       # GitHub Actions automated workflows
│   └── database-backup.yml  # Daily database backup (pg_dump)
├── client/                  # Frontend React application
│   ├── components/          # Reusable UI widgets and custom layout elements
│   ├── features/            # Feature-based folders (dashboard, settings, auth)
│   ├── hooks/               # Core React hooks (inactivity, state management)
│   ├── pages/               # Routed pages (Dashboard, Settings, Workspaces)
│   └── lib/                 # Third-party configurations (Supabase client, API clients)
├── server/                  # Express API Gateway server
│   ├── src/
│   │   ├── config/          # Configurations (Supabase SDK credentials)
│   │   ├── middleware/      # Middleware filters (Authorization, CORS)
│   │   ├── routes/          # Express API route endpoints
│   │   └── server.ts        # Node entrypoint
└── DOST_PROJECT_MEMORY.md   # System memory, architecture notes, and design guidelines
```

---

## 🛡️ Security & Performance Enhancements

* **Row Level Security (RLS)**: Enforced across all Postgres schemas. Database writes are restricted to server-side connection paths.
* **RLS Subquery Caching**: High-frequency queries are optimized by wrapping claims lookup contexts in cached subquery scopes.
* **Inactivity Auto-Logout**: Monitors user events and logs out active sessions after 15 minutes of inactivity (synced via `localStorage`).
* **Covering Indexes**: Foreign key queries are indexed to prevent Postgres table sequential scans.

---

## 💾 Database Backups

The system uses a dual-layer backup coverage:
1. **Supabase Native Backups**: Daily logical/physical snapshots (Settings > Database > Backups).
2. **Automated GitHub Backups**: Scheduled daily workflows using `pg_dump` triggered at 08:00 PHT (00:00 UTC). Make sure to set the `SUPABASE_DB_URL` repository secret.

---

## 🛠️ Local Development Setup

### 1. Install Dependencies
Run in the root folder:
```bash
npm install
```

### 2. Configure Environment variables
Create a `.env` file in the root and server folders matching the variables in `.env.example`.

### 3. Run Dev Servers
Run the client and server concurrently:
```bash
# Start Client (Vite)
npm run dev

# Start Backend Server (Express)
npm run dev --prefix server
```
