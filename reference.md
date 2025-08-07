# Reference Files for TutEasy CRM Platform Development

## Product Requirements Documents
- prd/video-conferencing-prd.md
- prd/overall-project-prd.md

## Database Schema
- docs/database-schema.md
- backend/prisma/schema.prisma

## Backend Architecture
- backend/SETUP.md
- backend/package.json
- backend/src/server.ts
- backend/src/routes/availability.routes.ts
- backend/src/routes/booking.routes.ts
- backend/src/routes/search.routes.ts
- backend/src/controllers/availability.controller.ts
- backend/src/controllers/booking.controller.ts
- backend/src/services/availability.service.ts
- backend/src/services/booking.service.ts
- backend/src/utils/auditLogger.ts
- backend/src/utils/timezoneUtils.ts
- backend/src/types/booking.types.ts
- backend/src/validation/booking.validation.ts

## Frontend Architecture
- frontend/package.json
- frontend/src/pages/BookingPage.tsx
- frontend/src/components/features/booking/components/AvailabilityCalendar.tsx
- frontend/src/components/features/booking/components/TimeSlotSelector.tsx
- frontend/src/components/features/booking/components/BookingConfirmationModal.tsx
- frontend/src/services/bookingService.ts
- frontend/src/services/searchService.ts

## API Documentation
- backend/README-SEARCH-API.md
- backend/docs/booking-api.md
- backend/docs/booking-system-implementation-summary.md

## Environment Configuration
- docs/deployment/environment-variables.md
- backend/.env.example

## Testing
- backend/src/tests/integration/booking-workflow.integration.test.ts
- backend/src/tests/services/booking.service.test.ts