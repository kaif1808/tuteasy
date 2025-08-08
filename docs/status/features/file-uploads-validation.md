## Feature: File Uploads & Validation

Last updated: 2025-08-08 — Status: Green

### Scope
Upload handling, validation/scanning, storage abstraction, quotas.

### Code Map
- Backend: `backend/src/services/fileValidation.service.ts`, `backend/src/services/storage.service.ts`, `backend/src/utils/upload.ts`
- Backend tests: `backend/src/tests/fileValidation.service.test.ts`
- Frontend: `frontend/src/components/features/tutor-profile/ProfileImageUpload.tsx`

### Completed
- Validation service with type/size checks and scanning hooks
- Storage abstraction for flexible backends (e.g., S3)

### In Progress
- Quotas, lifecycle policies, and retention

### Next Milestones
- [ ] Antivirus scan integration or stubbed gate
- [ ] Per-user storage quotas and alerts

### Risks & Mitigations
- Malicious uploads — denylist + allowlist + scanning + content-type checks

### Metrics & Targets
- 0 malware incidents; upload success > 99.5%
