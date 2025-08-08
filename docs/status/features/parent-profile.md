## Feature: Parent Profile

Last updated: 2025-08-08 — Status: Green

### Scope
Parent details, emergency contact, communication preferences, timezone.

### Code Map
- Backend: `backend/src/controllers/parentProfile.controller.ts`, `backend/src/routes/parentProfile.routes.ts`, `backend/src/services/parentProfile.service.ts`
- Backend tests: `backend/src/tests/parentProfile.controller.test.ts`, `backend/src/tests/parentProfile.service.test.ts`
- Frontend: `frontend/src/components/features/parent-profile/*`, `frontend/src/pages/ParentProfilePage.tsx`, `frontend/src/services/features/parent-profile/parentProfileService.ts`

### Completed
- CRUD with validation and completeness calculation

### In Progress
- Cross-profile navigation UX

### Next Milestones
- [ ] Parent dashboard rollup of student progress
- [ ] Notification preferences and digest emails

### Risks & Mitigations
- PII handling — strict validation, audit logs, least privilege

### Metrics & Targets
- 95% completeness rate; <1% validation errors after first attempt
