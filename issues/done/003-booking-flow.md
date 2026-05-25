## Parent PRD

`issues/prd.md`

## What to build

Deliver the full booking agent flow end-to-end: browsing available slots filtered by branch and service type, completing a booking form, and receiving a confirmation with a unique reference number. Includes double-booking prevention at both the application and database layers. By the end of this slice, a booking agent can select a slot, fill in customer details, submit the booking, and see a confirmation screen showing the reference number.

## Acceptance criteria

- [ ] `GET /api/branches` returns all branches
- [ ] `GET /api/service-types` returns all service types
- [ ] `GET /api/slots?branchId=&from=&to=` returns only slots with no existing appointment for the next 7 days, including mechanic name, branch, start time, and duration
- [ ] `POST /api/appointments` creates an appointment with customer name, phone, vehicle reg, service type, slot, and notes; returns `201 Created` with the full appointment including generated reference number
- [ ] Reference number follows the format `SMR-YYYYMMDD-XXXX` (zero-padded daily sequence)
- [ ] `POST /api/appointments` returns `409 Conflict` if the slot already has an appointment
- [ ] Application-layer check for existing appointment occurs before insert; unique DB index on `SlotId` acts as concurrency safety net
- [ ] `BookingPage` renders a `SlotPicker` showing available slots for the next 7 days
- [ ] Slots can be filtered by branch and service type in the UI
- [ ] Selecting a slot opens a booking form pre-filled with the selected service type
- [ ] Submitting the form calls `POST /api/appointments` and displays a confirmation screen with reference number, customer name, vehicle reg, date/time, and mechanic
- [ ] If the slot was taken (409 response), the UI shows an appropriate message and re-fetches available slots

## Blocked by

- Blocked by `issues/002-admin-home.md`

## User stories addressed

- User story 1: view available slots for the next 7 days
- User story 2: filter slots by service type
- User story 3: filter slots by branch/location
- User story 4: book an appointment with full customer details
- User story 5: double-booking prevented
- User story 6: unique booking reference number on confirmation
- User story 7: confirmation screen with full appointment details
