## Parent PRD

`issues/prd.md`

## What to build

Deliver the full mechanic flow end-to-end: viewing today's and tomorrow's appointments, opening an appointment to see all customer and vehicle details, adding timestamped work notes, and updating the appointment status through its lifecycle. By the end of this slice, a mechanic can switch to their role via the dropdown, see their schedule for today and tomorrow, open a job, record what they did, and mark it as completed or no-show.

## Acceptance criteria

- [ ] `GET /api/appointments?mechanicId=&date=` returns appointments for a specific mechanic on a given date, including customer name, phone, vehicle reg, service type, customer notes, status, and all work notes
- [ ] `GET /api/appointments/:id` returns full appointment detail including all work notes in chronological order
- [ ] `PATCH /api/appointments/:id/status` accepts `{ "status": "InProgress" | "Completed" | "NoShow" }` and updates the status; returns `400 Bad Request` for invalid transitions
- [ ] Valid status transitions enforced: `Scheduled → InProgress`, `InProgress → Completed`, `InProgress → NoShow`; all other transitions rejected
- [ ] `POST /api/appointments/:id/notes` accepts `{ "content": "..." }` and appends a timestamped work note; returns the created note
- [ ] `MechanicPage` shows the active mechanic's appointments for today and tomorrow in two separate sections
- [ ] Each appointment on `MechanicPage` renders as an `AppointmentCard` with customer name, vehicle reg, service type, time, and `StatusBadge`
- [ ] Clicking an appointment navigates to `AppointmentDetail`
- [ ] `AppointmentDetail` displays customer name, phone, vehicle reg, service type, customer notes, current status, and all work notes with timestamps
- [ ] `AppointmentDetail` shows a `WorkNoteForm` for adding new notes; submitting appends the note without a page reload
- [ ] `AppointmentDetail` shows status transition buttons appropriate to the current status (e.g. "Start Job" when Scheduled, "Complete" and "No-Show" when In Progress); buttons are hidden once terminal status is reached

## Blocked by

- Blocked by `issues/002-admin-home.md`

## User stories addressed

- User story 8: mechanic sees today's appointments
- User story 9: mechanic sees tomorrow's appointments
- User story 10: open appointment to see customer and vehicle details
- User story 11: add timestamped work notes
- User story 12: update status to In Progress
- User story 13: update status to Completed
- User story 14: mark appointment as No-Show
- User story 15: status transitions enforced in correct direction
