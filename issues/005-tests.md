## Parent PRD

`issues/prd.md`

## What to build

Add a `SmrScheduler.Tests` xUnit project covering the three highest-risk units of business logic plus one end-to-end integration test for double-booking. Tests verify external behaviour only — no assertions on internal implementation details. By the end of this slice, `dotnet test` passes green.

## Acceptance criteria

- [ ] `SmrScheduler.Tests` xUnit project exists and is referenced in the solution
- [ ] **Unit test — reference number format**: given a known date and daily sequence number, assert the generated string matches `SMR-YYYYMMDD-XXXX` with correct zero-padding
- [ ] **Unit test — status transitions (valid)**: assert that `Scheduled → InProgress`, `InProgress → Completed`, and `InProgress → NoShow` are all accepted without error
- [ ] **Unit test — status transitions (invalid)**: assert that transitions such as `Completed → InProgress`, `Scheduled → Completed`, and `NoShow → InProgress` are rejected (return an error or throw)
- [ ] **Unit test — double-booking logic**: given a slot that already has an appointment, assert that the application-layer check returns a conflict result before any DB insert is attempted
- [ ] **Integration test — double-booking endpoint**: using EF Core InMemory or SQLite provider, seed one slot, `POST /api/appointments` succeeds with `201` and returns a reference number, a second `POST` to the same slot returns `409 Conflict`
- [ ] All tests pass with `dotnet test` from the repo root

## Blocked by

- Blocked by `issues/002-admin-home.md`
- Blocked by `issues/003-booking-flow.md`
- Blocked by `issues/004-mechanic-flow.md`

## User stories addressed

None directly — this slice validates the correctness of behaviour delivered in issues 002–004.
