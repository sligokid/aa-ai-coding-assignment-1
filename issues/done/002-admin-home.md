## Parent PRD

`issues/prd.md`

## What to build

Deliver the admin home page end-to-end: define all database entities, apply migrations, seed realistic data, expose today's appointments via the API, and render them in the React app grouped by mechanic. Also includes the NavBar with the role switcher dropdown, which is shared across all subsequent slices. By the end of this slice, an admin can open the app, see today's full schedule across all mechanics, and switch roles via the dropdown.

## Acceptance criteria

- [ ] All EF Core entities exist and migrate cleanly: `Branch`, `Mechanic`, `ServiceType`, `Slot`, `Appointment`, `WorkNote`
- [ ] Unique index on `Appointments.SlotId` is applied via migration
- [ ] Seed data is applied idempotently on startup: 2 branches, 3 mechanics, 4 service types, hourly slots 09:00–17:00 for each mechanic for today + next 7 days (~192 slots)
- [ ] `GET /api/mechanics` returns all mechanics with their branch
- [ ] `GET /api/appointments?date=today` returns all appointments for today across all mechanics, including mechanic name, customer name, vehicle reg, service type, and status
- [ ] `HomePage` renders today's appointments grouped by mechanic, each with an `AppointmentCard` showing customer name, vehicle reg, service type, time, and a `StatusBadge`
- [ ] `NavBar` renders a dropdown listing "Admin" plus each mechanic by name
- [ ] Selecting a role in the dropdown updates React context and persists to `localStorage`
- [ ] Page refreshing restores the previously selected role from `localStorage`

## Blocked by

- Blocked by `issues/001-project-setup.md`

## User stories addressed

- User story 16: admin home showing today's schedule across all mechanics
- User story 17: appointments grouped by mechanic
- User story 18: appointment status visible on home page
- User story 19: role switcher dropdown in navigation
- User story 20: selected role persists across page refreshes
