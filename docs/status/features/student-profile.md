## Feature: Student Profile (UK/IB)

Last updated: 2025-08-08 — Status: Green

### Scope
Academic levels (UK/IB), interests, targets, validation, completeness.

### Code Map
- Backend: `backend/src/controllers/studentProfile.controller.ts`, `backend/src/routes/studentProfile.routes.ts`, `backend/src/services/studentProfile.service.ts`
- Backend tests: `backend/tests/student-profile-api.test.ts`, `backend/tests/studentProfile.controller.test.ts`, `backend/tests/studentProfile.service.test.ts`
- Frontend: `frontend/src/components/features/student-profile/*`, `frontend/src/pages/StudentProfilePage.tsx`, `frontend/src/components/features/student-profile/StudentProfileForm.tsx`, `frontend/src/components/features/student-profile/UKIBStudentProfileForm.tsx`, `frontend/src/services/studentProfileApi.ts`

### Completed
- UK year groups, key stages; IB programmes (SL/HL)
- Validation for cross-field constraints; progression checks

### In Progress
- Progress analytics and goal tracking

### Next Milestones
- [ ] Profile insights widgets (strengths, gaps)
- [ ] Parent visibility controls and consent

### Risks & Mitigations
- Terminology mismatch — centralized constants; PRD alignment reviews

### Metrics & Targets
- ≥90% students specify academic level correctly; form error rate <2%
