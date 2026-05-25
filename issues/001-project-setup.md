## Parent PRD

`issues/prd.md`

## What to build

Scaffold the full project structure end-to-end so that all subsequent slices have a working foundation to build on. This means a running SQL Server instance (Docker), a .NET 8 Web API that connects to it and applies EF Core migrations on startup, and a Vite React app that can reach the API. By the end of this slice, `docker-compose up` starts SQL Server, `dotnet run` starts the API (with Swagger reachable), and `npm run dev` starts the React app — all three talking to each other.

## Acceptance criteria

- [ ] `docker-compose.yml` starts a SQL Server container on port 1433 with a known SA password
- [ ] `.NET 8 Web API` project exists under `backend/SmrScheduler.Api/` with EF Core and SQL Server packages installed
- [ ] `DbContext` is registered and connection string points to the Docker SQL Server instance
- [ ] `Program.cs` calls `MigrateAsync()` on startup — an empty initial migration applies cleanly
- [ ] CORS is configured to allow requests from the Vite dev server origin (`localhost:5173`)
- [ ] Swagger/OpenAPI is available at `/swagger` in development
- [ ] Vite React app exists under `frontend/smr-ui/` with React Router and Tailwind CSS configured
- [ ] A placeholder `GET /api/health` endpoint returns `200 OK` and the React app fetches and displays it
- [ ] `.gitignore` covers `bin/`, `obj/`, `node_modules/`, `.env`, and SQL Server data volumes
- [ ] Git repository initialised with an initial commit

## Blocked by

None — can start immediately.

## User stories addressed

None directly. This slice is the foundation for all subsequent slices.
