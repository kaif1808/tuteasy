## Backend Status

### State
- Build passing and stable. Jest tests green (39+).

### Completed
- **Auth**: Registration, login, reset, verify; JWT access + refresh; role-based access; secure cookies
- **Security**: Endpoint-specific rate limits; enumeration-safe errors; JSON security logs; helmet/CORS
- **Profiles**: Tutor, Student (UK/IB), Parent (CRUD + completeness)
- **Services**: File storage abstraction; image processing; validation via Zod
- **APIs**: 12+ endpoints from PRD implemented; consistent error handling

### Payments (MVP)
- DB schema for invoices, items, transactions, payment methods
- Stripe create-intent endpoint implemented

### In Progress / Next
- Payment webhooks, invoice/transaction lifecycle, reconciliation
- Tutor search/matching with curriculum filters (UK/IB)
- Monitoring/alerting integration (Sentry/APM) for production
