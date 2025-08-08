## Backend Status

Last updated: 2025-08-08

### Summary
- **State**: Green — Build stable, endpoints consistent, tests passing (39+)
- **Scope**: Auth, Profiles (Tutor/Student/Parent), Booking, Search, Payments (MVP), Video signaling, Validation, Storage, Email, Rate limiting

### Architecture & References
- Code: `backend/src` (routes, controllers, services)
- Schema: `backend/prisma/schema.prisma`
- Docs: `docs/database-schema.md`, `docs/video-conferencing-architecture.md`

### Completed
- **Auth**: JWT access+refresh with rotation; RBAC; password reset/verify; secure cookies
- **Security**: Per-endpoint rate limits; enumeration-safe errors; structured JSON security logs; helmet/CORS
- **Profiles**: Tutor, Student (UK/IB), Parent CRUD; validation with Zod; completeness calc
- **Booking**: Availability, slot selection, booking creation; timezone utilities
- **Search**: Basic tutor search endpoints; validation and pagination
- **Video Signaling**: Socket auth middleware; session lifecycle; Redis adapter-ready design
- **Validation & Errors**: Centralized `validate` middleware; `AppError` with safe responses

### Payments (MVP)
- DB: invoices, invoice_items, transactions, payment_methods (indexed for lookups)
- Endpoint: `POST /api/payments/create-intent` using Stripe SDK

### Test & Quality
- Jest unit/integration tests green (auth, booking, services, security)
- Target: >80% coverage on critical paths; e2e flows in `src/tests/e2e`

### In Progress
- Payments webhooks (invoice/charge/payment_intent) and reconciliation pipeline
- Curriculum-aware tutor search/matching (UK/IB filters)

### Next Milestones (2-3 weeks)
- [ ] Implement Stripe webhook handler with signature verification and idempotency
- [ ] Persist invoice/transaction lifecycle and reconcile on retries
- [ ] Search: add filters for UK key stage, exam board, IB programme
- [ ] Monitoring: integrate Sentry/APM with sampling and PII scrubbing

### Risks & Mitigations
- **Webhook ordering/duplication**: Use idempotency keys and event versioning
- **Timezones in booking**: Keep all persistence in UTC; convert at edges
- **Search perf**: Add indexes; consider caching top queries in Redis

### Metrics & Targets
- P95 auth response < 150ms; booking create < 300ms
- Error rate < 0.5%; 100% webhook processing success with retries
