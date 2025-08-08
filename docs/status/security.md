## Security Status

Last updated: 2025-08-08

### Summary
- **State**: Green — Backend hardening implemented; expanding monitoring

### Completed
- Per-endpoint rate limiting with safe headers; skip on successful auth
- HttpOnly refresh tokens with rotation; SameSite=strict; secure in production
- Enumeration-safe errors across auth surfaces; consistent timing
- Structured security logging (JSON) for auth flows and critical events
- Standards enforced: strong passwords, JWT TTLs, input validation, CORS/helmet

### In Progress
- Staging deployment with monitoring/alerting (Sentry/APM)
- Security documentation refresh and runbooks

### Next Milestones (2-3 weeks)
- [ ] Integrate Sentry SDK (BE/FE) with sampling and PII scrubbing
- [ ] Add audit logging for student data access (FERPA)
- [ ] Rate limit tuning per route based on prod-like traffic
- [ ] Security e2e tests for auth and rate limiting edge cases

### Risks & Mitigations
- **Token theft**: Short-lived access tokens + refresh rotation; device revocation
- **Brute force**: IP and user-based rate limits; exponential backoff messaging

### Metrics & Targets
- 0 secrets committed; monthly dependency audits; <0.5% 4xx spike sustained
