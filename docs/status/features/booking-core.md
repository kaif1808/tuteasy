## Feature: Booking Core

Last updated: 2025-08-08 — Status: Green

### Scope
Calendar, time slots, booking creation, confirmation, cancellation policy.

### Code Map
- Backend: `backend/src/controllers/booking.controller.ts`, `backend/src/controllers/availability.controller.ts`, `backend/src/routes/booking.routes.ts`, `backend/src/routes/availability.routes.ts`, `backend/src/services/booking.service.ts`, `backend/src/services/availability.service.ts`, `backend/src/utils/timezoneUtils.ts`, `backend/src/types/booking.types.ts`
- Backend tests: `backend/src/tests/integration/booking.integration.test.ts`, `backend/src/tests/integration/booking-workflow.integration.test.ts`, `backend/src/tests/services/booking.service.test.ts`, `backend/src/tests/services/availability.service.test.ts`
- Frontend: `frontend/src/pages/BookingPage.tsx`, `frontend/src/components/features/booking/*`, `frontend/src/services/bookingService.ts`

### Completed
- Availability browsing, slot selection, booking create + confirmation
- Timezone-correct rendering; robust loading/error states

### In Progress
- Post-booking emails and reminders; payment hold handshake

### Next Milestones
- [ ] Prevent double booking with transactional guarantees
- [ ] Reminder emails and cancellation windows enforcement
- [ ] Tutor blackout/holiday calendar synchronization

### Risks & Mitigations
- Timezone/DST issues — thorough tests; store UTC only; convert at edges

### Metrics & Targets
- Success rate ≥98%; disputes <1%; P95 booking create <300ms
