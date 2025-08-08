## Feature: Tutor Profile

Last updated: 2025-08-08 — Status: Green

### Scope
Tutor details, subjects with exam boards, qualifications, profile image, completeness.

### Code Map
- Backend: `backend/src/controllers/tutorProfile.controller.ts`, `backend/src/routes/tutorProfile.routes.ts`, `backend/src/services/tutorProfile.service.ts`
- Frontend: `frontend/src/components/features/tutor-profile/*`, `frontend/src/pages/TutorProfilePage.tsx`, `frontend/src/components/features/tutor-profile/ProfileImageUpload.tsx`, `frontend/src/components/features/tutor-profile/ProfileForm.tsx`, `frontend/src/components/features/tutor-profile/ProfileCompleteness.tsx`, `frontend/src/services/tutorProfileService.ts`

### Completed
- CRUD for tutor profile, subjects, qualifications
- Image upload with client cropping and server processing
- Completeness calculation and prompts

### In Progress
- Verification workflow for qualifications

### Next Milestones
- [ ] Admin verification flags and audit log
- [ ] Subject expertise badges generation
- [ ] Quotas and file retention policy enforcement

### Risks & Mitigations
- File abuse — strict validation + size/type limits + scanning

### Metrics & Targets
- ≥95% tutors reach 90% completeness within 3 days; upload error rate <0.5%
