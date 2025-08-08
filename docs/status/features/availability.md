## Feature: Availability

Last updated: 2025-08-08 — Status: Green

### Scope
Tutor availability management, recurring schedules, exceptions/holidays.

### Code Map
- Backend: `backend/src/controllers/availability.controller.ts`, `backend/src/routes/availability.routes.ts`, `backend/src/services/availability.service.ts`
- Frontend: `frontend/src/components/features/booking/AvailabilityCalendar.tsx`

### Completed
- Read APIs for availability and slot exposure

### In Progress
- Recurrence rules and holiday/exception management

### Next Milestones
- [ ] CRUD APIs for tutor availability blocks and exceptions
- [ ] UI for recurring rules and one-off overrides

### Risks & Mitigations
- Complexity of recurrence — RFC 5545-like rules encapsulated server-side

### Metrics & Targets
- Availability accuracy ≥ 99%; UI error rate < 1%
