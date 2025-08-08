## Feature: Email & Notifications

Last updated: 2025-08-08 — Status: Amber

### Scope
Transactional emails (verification, reset), booking confirmations, reminders, digests.

### Code Map
- Backend: `backend/src/services/emailService.ts`

### Completed
- Email service scaffolding; verification and reset integrated

### In Progress
- Booking confirmations, reminders, and digest scheduling

### Next Milestones
- [ ] Template system with localization
- [ ] Event-driven notifications (booking created/canceled)
- [ ] Daily/weekly digest opt-in preferences

### Risks & Mitigations
- Deliverability — warmed domains, DKIM/SPF/DMARC, retries

### Metrics & Targets
- Delivery success ≥ 98%; complaint rate < 0.1%
