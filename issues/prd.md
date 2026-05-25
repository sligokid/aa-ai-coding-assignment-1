# PRD: AA SMR Appointment Scheduler

## Problem Statement

The AA Service, Maintenance & Repair (SMR) team currently tracks vehicle bookings using spreadsheets and shared calendars. This causes double-bookings, missed jobs, and lost mechanic notes. There is no single source of truth for the daily schedule, no structured way for mechanics to record work notes, and no confirmation reference given to customers at the time of booking.

## Solution

Build a minimum viable internal web application that replaces the spreadsheet/calendar workflow. The app supports three roles — booking agent, mechanic, and admin — with a simple role-switcher dropdown (no authentication required). Booking agents can browse available slots and book appointments. Mechanics can view their schedule and update job status and notes. Admins can see today's full schedule across all mechanics and branches.

## User Stories

### Booking Agent Flow

1. As a booking agent, I want to view all available appointment slots for the next 7 days, so that I can find a suitable time for a customer.
2. As a booking agent, I want to filter available slots by service type (Inspection, Service, Repair, Diagnostics), so that I can quickly find relevant availability.
3. As a booking agent, I want to filter available slots by branch/location, so that I can find slots near the customer.
4. As a booking agent, I want to book an appointment by providing customer name, phone number, vehicle registration, service type, branch, and notes, so that the job is captured in the system.
5. As a booking agent, I want the system to prevent me from booking a slot that has already been taken, so that double-bookings cannot occur.
6. As a booking agent, I want to receive a unique booking reference number on confirmation, so that the customer has something to quote when they arrive.
7. As a booking agent, I want to see a confirmation screen after booking with all appointment details, so that I can verify the booking was recorded correctly.

### Mechanic Flow

8. As a mechanic, I want to see a list of my appointments for today, so that I know what jobs I have coming in.
9. As a mechanic, I want to see a list of my appointments for tomorrow, so that I can plan ahead.
10. As a mechanic, I want to open an appointment and see the customer name, phone number, vehicle registration, service type, and customer notes, so that I have everything I need before starting work.
11. As a mechanic, I want to add timestamped work notes to an appointment, so that I can record what I did and when.
12. As a mechanic, I want to update the status of an appointment from Scheduled to In Progress, so that the admin can see work has started.
13. As a mechanic, I want to update the status from In Progress to Completed, so that the job is marked as done.
14. As a mechanic, I want to mark an appointment as No-Show, so that the slot is recorded as unused and the reason is clear.
15. As a mechanic, I want the status to progress only in the defined direction (Scheduled → In Progress → Completed or No-Show), so that the history is accurate.

### Admin Flow

16. As an admin, I want to see today's full schedule across all mechanics on a single home page, so that I have a live overview of the workshop.
17. As an admin, I want to see each mechanic's appointments grouped by mechanic on the home page, so that I can identify who is busy and who has capacity.
18. As an admin, I want to see the status of each appointment on the home page, so that I can see at a glance how the day is progressing.

### Role Switcher

19. As any user, I want to switch between Admin, and each named Mechanic using a dropdown in the navigation bar, so that the app is usable without a login system.
20. As any user, I want my selected role to persist across page refreshes, so that I don't have to re-select it every time.

## Implementation Decisions

### Stack
- **Frontend**: React (Vite), React Router, Tailwind CSS
- **Backend**: .NET 8 Web API (C#), single flat project structure (no Clean Architecture layers)
- **Database**: SQL Server running in Docker; API and frontend run locally
- **ORM**: Entity Framework Core with code-first migrations
- **Containerisation**: `docker-compose.yml` for SQL Server only; `docker-compose up` starts the DB

### Data Model

- **Branch**: Id, Name, Address
- **Mechanic**: Id, Name, BranchId
- **ServiceType**: Id, Name (Inspection, Service, Repair, Diagnostics)
- **Slot**: Id, MechanicId, StartTime, DurationMinutes — generic, not typed to a service
- **Appointment**: Id, SlotId, CustomerName, Phone, VehicleReg, ServiceTypeId, Notes, Status (enum), ReferenceNumber, CreatedAt — unique index on SlotId (prevents double-booking)
- **WorkNote**: Id, AppointmentId, Content, CreatedAt

### API Endpoints

- `GET /api/branches` — list all branches
- `GET /api/mechanics` — list all mechanics (used by role switcher)
- `GET /api/service-types` — list all service types
- `GET /api/slots?branchId=&serviceTypeId=&from=&to=` — available slots for next 7 days
- `POST /api/appointments` — create a booking
- `GET /api/appointments/:id` — appointment detail
- `GET /api/appointments?mechanicId=&date=` — mechanic's appointments for a given date
- `GET /api/appointments?date=today` — all appointments today (admin home)
- `PATCH /api/appointments/:id/status` — update appointment status `{ "status": "InProgress" }`
- `POST /api/appointments/:id/notes` — add a work note `{ "content": "..." }`

### Double-Booking Prevention
- Application layer checks for an existing appointment on a slot before inserting
- Unique database constraint on `Appointments.SlotId` as a safety net for concurrent requests
- API returns `409 Conflict` if the slot is taken; frontend re-fetches available slots and shows an appropriate message

### Reference Number Format
- Format: `SMR-YYYYMMDD-XXXX` where XXXX is a zero-padded daily sequence
- Generated server-side on appointment insert
- Human-readable and suitable for verbal confirmation

### Slot Generation
- Slots are generic (not typed to a service type)
- Seed generates hourly slots 09:00–17:00 for each mechanic for today + next 7 days
- Seed is idempotent — runs via `MigrateAsync()` on startup, checks for existing data before inserting

### Seed Data
- 2 branches: Dublin HQ, Cork Branch
- 3 mechanics spread across both branches
- 4 service types: Inspection, Service, Repair, Diagnostics
- ~192 slots generated on first run (8 slots × 3 mechanics × 8 days)

### Frontend Structure

**Pages**
- `HomePage` — admin view, today's schedule across all mechanics
- `BookingPage` — slot browser with service type/branch filter + booking form + confirmation
- `MechanicPage` — today and tomorrow appointment list for the active mechanic
- `AppointmentDetail` — customer info, vehicle, notes, work note form, status update

**Components**
- `NavBar` — role switcher dropdown + nav links
- `SlotPicker` — slot grid with filter controls
- `AppointmentCard` — reusable card used in HomePage and MechanicPage
- `StatusBadge` — coloured badge for each appointment status
- `WorkNoteForm` — textarea + submit for mechanic work notes

### Role Switcher
- React context holding `{ role: 'admin' | 'mechanic', mechanicId?, mechanicName? }`
- Persisted in `localStorage`
- Dropdown in NavBar lists "Admin" plus each seeded mechanic by name

### Build Order (Vertical Slices)
1. **Setup** — git init, docker-compose, `dotnet new webapi`, `npm create vite`, CORS
2. **Slice 1** — Admin home: seed + migrations + today's appointments endpoint + HomePage component
3. **Slice 2** — Booking flow: slots endpoint + POST appointment + BookingPage + confirmation
4. **Slice 3** — Mechanic flow: mechanic appointments + AppointmentDetail + status PATCH + work notes
5. **Wrap-up** — README, tidy commits, push

One commit per slice.

## Testing Decisions

A good test verifies external behaviour, not implementation details — it treats the unit under test as a black box and asserts on observable outputs given controlled inputs.

### Unit Tests (.NET — xUnit)

A separate test project (`SmrScheduler.Tests`) with unit tests covering pure business logic:

- **Reference number generation** — given a date and a daily sequence number, assert the correct `SMR-YYYYMMDD-XXXX` format is produced
- **Appointment status transitions** — assert that valid transitions (Scheduled → InProgress, InProgress → Completed, InProgress → NoShow) are accepted, and that invalid transitions (e.g. Completed → InProgress) are rejected
- **Double-booking check logic** — given a slot that already has an appointment, assert the service/validator returns a conflict result rather than proceeding

These three cover the highest-risk logic that is easy to get subtly wrong and hard to catch by eye.

### Integration Test (.NET — xUnit + EF Core InMemory or SQLite)

One integration test covering the double-booking endpoint end-to-end:

- Seed a slot and book it successfully via `POST /api/appointments` — assert `201 Created` and a reference number in the response
- Attempt to book the same slot again — assert `409 Conflict` is returned
- This test validates that the application-layer check, the DB constraint, and the HTTP response all work together correctly

### Manual Verification

- Booking an appointment and receiving a reference number
- Switching mechanic roles and seeing only that mechanic's appointments
- Adding a work note and seeing it timestamped on the appointment detail
- Progressing appointment status through the full lifecycle

## Out of Scope

- Authentication and login (role switcher dropdown is sufficient)
- Email or SMS notifications
- Rescheduling and cancellation flows
- Recurring appointments
- Payments and invoicing
- Mobile-specific UI
- Clean Architecture / layered .NET project structure
- Pagination or search on any list view
- Mechanic specialisations (slots are generic, any mechanic can take any service type)
- Slot duration variation by service type

## Further Notes

- The application should fully set itself up on first run — `dotnet run` applies migrations and seeds data automatically.
- The README should cover: how to run, stack choice rationale, what's done/not done, known rough edges, AI tools used, planning approach, and prompts used.
- During the interview, the candidate will be asked to make a live change to the running application using AI assistance — familiarity with every generated file is essential.
