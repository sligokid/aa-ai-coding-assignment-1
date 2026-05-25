# Plan: Add frontend + backend to docker-compose

## Context

`docker-compose.yml` currently only starts SQL Server. The API and frontend are run manually with `dotnet run` and `npm run dev`. The goal is to add both services so `docker-compose up --build` starts the entire stack. Local dev (outside Docker) must continue to work unchanged.

Two problems must be solved first:
1. All frontend fetch calls hardcode `http://localhost:5000` — these must become relative paths (`/api/...`) so they work in both environments.
2. In Docker the API's connection string must target `sqlserver` (compose service name) not `localhost` — handled via env var override in compose, no `appsettings.json` change needed.

---

## Architecture

```
Browser (local dev)               Browser (Docker)
        |                                 |
 http://localhost:5173             http://localhost:80
        |                                 |
  Vite dev server                  Nginx container
  /api/* → proxy to                /api/* → proxy_pass
  http://localhost:5000            http://api:5000
        |                                 |
  dotnet run (5000)            API container (5000)
        |                                 |
  SQL Server (localhost:1433)  SQL Server container
```

---

## Changes

### 1. Frontend: replace hardcoded API URLs with relative paths

**`frontend/smr-ui/src/pages/BookingPage.tsx`**
- Remove `const API = 'http://localhost:5000'`
- Replace every `${API}/api/` with `/api/` (4 fetch call sites: `fetchSlots`, `init` x3, `handleSubmit`)

**`frontend/smr-ui/src/pages/AppointmentDetail.tsx`**
- Line 36: `http://localhost:5000/api/appointments/${id}` → `/api/appointments/${id}`
- Line 50: `http://localhost:5000/api/appointments/${id}/notes` → `/api/appointments/${id}/notes`
- Line 68: `http://localhost:5000/api/appointments/${id}/status` → `/api/appointments/${id}/status`

**`frontend/smr-ui/src/components/NavBar.tsx`**
- `http://localhost:5000/api/mechanics` → `/api/mechanics`

**`frontend/smr-ui/src/pages/HomePage.tsx`**
- `http://localhost:5000/api/appointments?date=today` → `/api/appointments?date=today`

**`frontend/smr-ui/src/pages/MechanicPage.tsx`**
- `` `http://localhost:5000/api/appointments?mechanicId=...` `` → `` `/api/appointments?mechanicId=...` ``

### 2. Vite dev proxy — `frontend/smr-ui/vite.config.ts`

Add `server.proxy` so relative `/api/*` calls work with `npm run dev`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

### 3. CORS — `backend/SmrScheduler.Api/Program.cs`

Add `http://localhost` (port 80, Docker frontend) to the allowed origins:

```csharp
- policy.WithOrigins("http://localhost:5173")
+ policy.WithOrigins("http://localhost:5173", "http://localhost")
```

### 4. NEW: `backend/SmrScheduler.Api/Dockerfile`

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY SmrScheduler.Api.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_HTTP_PORTS=5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "SmrScheduler.Api.dll"]
```

> `ASPNETCORE_HTTP_PORTS=5000` is required — the .NET 8 aspnet base image defaults to port **8080**, not 5000.

### 5. NEW: `backend/SmrScheduler.Api/.dockerignore`

```
bin/
obj/
appsettings.Development.json
Properties/launchSettings.json
```

### 6. NEW: `frontend/smr-ui/nginx.conf`

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass       http://api:5000;
        proxy_http_version 1.1;
        proxy_set_header Host            $host;
        proxy_set_header X-Real-IP       $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 7. NEW: `frontend/smr-ui/Dockerfile`

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 8. NEW: `frontend/smr-ui/.dockerignore`

```
node_modules/
dist/
.cache/
```

### 9. UPDATE: `docker-compose.yml`

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "SMR_Dev_2024!"
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Developer"
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
    healthcheck:
      test: ["CMD", "/opt/mssql-tools18/bin/sqlcmd", "-S", "localhost",
             "-U", "sa", "-P", "SMR_Dev_2024!", "-Q", "SELECT 1", "-No"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

  api:
    build:
      context: ./backend/SmrScheduler.Api
    ports:
      - "5000:5000"
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__DefaultConnection: >-
        Server=sqlserver,1433;Database=SmrScheduler;User Id=sa;Password=SMR_Dev_2024!;TrustServerCertificate=True;
    depends_on:
      sqlserver:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend/smr-ui
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  sqlserver_data:
```

> `ConnectionStrings__DefaultConnection` overrides `appsettings.json` via ASP.NET Core's env-var config convention (`__` = `:` separator). `appsettings.json` keeps `localhost,1433` for local dev.

> `start_period: 30s` prevents false healthcheck failures during SQL Server's ~25s cold-start.

### 10. UPDATE: `README.md`

- Add "Docker (single command)" section before the manual startup steps:
  - `docker-compose up --build` — starts all three services
  - Table: Frontend `http://localhost`, API `http://localhost:5000`, SQL Server `localhost:1433`
- Update project structure tree to show `Dockerfile` and `nginx.conf` for each service
- Update "Known rough edges" — remove hardcoded port note (now fixed)

---

## Verification

**Local dev unchanged:**
```bash
docker-compose up sqlserver -d
cd backend/SmrScheduler.Api && dotnet run
cd frontend/smr-ui && npm run dev   # http://localhost:5173
```
`curl http://localhost:5173/api/health` → `{"status":"healthy"}` (Vite proxy)

**Full Docker stack:**
```bash
docker-compose up --build
curl http://localhost:5000/api/health   # API direct
curl http://localhost/api/health        # via Nginx proxy
# Open http://localhost — app loads, mechanic dropdown populates
```

`docker-compose ps` — all three services healthy/running.
