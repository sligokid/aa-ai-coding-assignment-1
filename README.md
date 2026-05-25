# AA SMR Appointment Scheduler

An internal web application for the AA Service, Maintenance & Repair team to replace spreadsheet-based appointment tracking. Booking agents can browse slots and create appointments; mechanics can view their schedule and update job status and notes; admins see today's full schedule across all mechanics.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Docker | 24+ | [docker.com](https://www.docker.com/) |
| .NET SDK | 8.x | `brew install dotnet@8` |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |

---

## Running the project

### 1. Start the database

```bash
docker-compose up -d
```

Starts SQL Server 2022 on `localhost:1433`. SA password: `SMR_Dev_2024!`

### 2. Start the API

```bash
cd backend/SmrScheduler.Api
/opt/homebrew/Cellar/dotnet@8/8.0.127/bin/dotnet run
```

> **macOS note**: the project targets .NET 8. If your default `dotnet` is a later version (check with `dotnet --version`), use the full path above. You can also add it to your shell: `export PATH="/opt/homebrew/Cellar/dotnet@8/8.0.127/bin:$PATH"`.

- API: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`
- Health check: `http://localhost:5000/api/health`

EF Core migrations run automatically on startup. The first run creates the database and seeds all data.

### 3. Start the frontend

```bash
cd frontend/smr-ui
npm install   # first time only
npm run dev
```

- App: `http://localhost:5173`

---

## Project structure

```
.
├── docker-compose.yml          # SQL Server container
├── backend/
│   ├── SmrScheduler.sln
│   └── SmrScheduler.Api/       # .NET 8 Web API
│       ├── Data/               # EF Core DbContext + DbSeeder
│       ├── Migrations/         # EF Core migrations (hand-authored)
│       ├── Models/             # Branch, Mechanic, ServiceType, Slot, Appointment, WorkNote
│       └── Program.cs          # Minimal API endpoints
└── frontend/
    └── smr-ui/                 # Vite React app
        └── src/
            ├── components/     # NavBar, AppointmentCard, StatusBadge
            ├── context/        # RoleContext (admin/mechanic role + localStorage)
            └── pages/          # HomePage
```

---

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Database | SQL Server 2022 (Docker) | Matches AA's existing Windows/SQL Server estate |
| ORM | EF Core 8, code-first | Migrations-as-code, idiomatic in .NET |
| API | .NET 8 minimal Web API | Lightweight, no ceremony; single flat project (no Clean Architecture layers per spec) |
| Frontend | React 19 + Vite + TypeScript | Fast dev server, strong typing catches bugs at build time |
| Routing | React Router v7 | Standard SPA routing |
| Styling | Tailwind CSS v3 | Utility-first; no separate CSS files to maintain |

---

## What's done / not done

### Done
- [x] SQL Server Docker setup
- [x] .NET 8 Web API with EF Core, Swagger, CORS
- [x] Auto-migrations and idempotent seed on startup
- [x] `GET /api/health`
- [x] All EF Core entities: `Branch`, `Mechanic`, `ServiceType`, `Slot`, `Appointment`, `WorkNote`
- [x] Unique index on `Appointments.SlotId` (double-booking guard)
- [x] Seed data: 2 branches, 3 mechanics, 4 service types, ~192 hourly slots
- [x] `GET /api/mechanics` — all mechanics with branch name
- [x] `GET /api/appointments?date=today` — today's appointments with mechanic, service type, status
- [x] `NavBar` with role-switcher dropdown (Admin + each mechanic by name)
- [x] Role context persisted to `localStorage`; restored on page refresh
- [x] `HomePage` — today's schedule grouped by mechanic, with `AppointmentCard` and `StatusBadge`
- [x] Vite React app with Tailwind + React Router

### Not yet implemented
- [ ] `GET /api/slots?branchId=&from=&to=` — available slots for booking
- [ ] `GET /api/branches`, `GET /api/service-types`
- [ ] `POST /api/appointments` with double-booking prevention and reference number generation
- [ ] `GET /api/appointments/:id` — full appointment detail
- [ ] `PATCH /api/appointments/:id/status` with transition validation
- [ ] `POST /api/appointments/:id/notes`
- [ ] `BookingPage`, `MechanicPage`, `AppointmentDetail` pages
- [ ] xUnit test project

---

## Known rough edges

- **Port hardcoded**: the React app fetches `http://localhost:5000` directly. A proper setup would use a Vite proxy or env variable.
- **No auth**: the role switcher is a dropdown stored in localStorage — sufficient per spec but not production-safe.
- **SA credentials in config**: `appsettings.json` contains the SA password in plain text. Fine for local dev; would use secrets management in production.
- **Seed idempotency**: seed data checks for existing rows before inserting. If you change seed data, truncate the tables first.

---

## AI tools used

- **Claude Code** (Claude Sonnet 4.6) — all code generation, issue planning, and TDD cycles were driven via Claude Code CLI
- **ralph** — the `ralph/` directory contains AFK automation scripts that run Claude Code autonomously across issues

---

## Planning approach

The project was planned as a PRD-first, vertical-slice build:

1. A product requirements document (`issues/prd.md`) was generated from the assignment brief
2. The PRD was broken into five independently-workable issues (`001`–`005`), each a complete vertical slice from DB to UI
3. Issues were worked in dependency order: setup → admin home → booking flow → mechanic flow → tests
4. Each slice was implemented test-first using a red-green-refactor TDD loop

---

## Prompts used

The following prompts drove the main AI-assisted work sessions:

**PRD generation**
> "Generate a PRD from the client brief in AI_Coding_Interview_Assignment.pdf and write it as issues/prd.md"

**Issue breakdown**
> "Break the PRD into independently-workable issues and write each as a local markdown file in issues/"

**Project scaffold (issue 001)**
> "Scaffold the full project structure end-to-end: docker-compose.yml for SQL Server, .NET 8 Web API with EF Core under backend/SmrScheduler.Api/, Vite React app under frontend/smr-ui/ with React Router and Tailwind CSS. GET /api/health returns 200 OK. dotnet build and npm run build must both pass."

**Admin home (issue 002)**
> "Implement issue 002 (Admin Home): all EF Core entities, hand-authored migration, idempotent seed, GET /api/mechanics and GET /api/appointments?date=today endpoints, NavBar with role switcher, RoleContext with localStorage persistence, HomePage grouped by mechanic with AppointmentCard and StatusBadge."

Subsequent slices follow the same pattern: pass the issue file as context, run `/tdd` to implement it, verify feedback loops (`dotnet build` + `npm run build`), commit.
