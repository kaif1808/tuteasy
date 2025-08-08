## Payments Status

Last updated: 2025-08-08

### Summary
- **State**: Amber — Frontend complete; Backend at MVP; webhooks & reconciliation next

### Frontend
- Stripe Elements: PaymentElement, AddressElement integrated
- Billing management (CRUD), default payment method, saved methods
- Transactions history with filters; invoices view with PDF download
- Refund UI (full/partial) with validation and user feedback
- Error/Loading states and toasts implemented throughout

### Backend (MVP)
- Schema entities: `invoice`, `invoice_item`, `transaction`, `payment_method`
- Endpoint: `POST /api/payments/create-intent`

### In Progress
- Webhook handler (payment_intent.succeeded/processing/canceled, charge.*, invoice.*)
- Idempotent processing and retry-safe reconciliation pipeline

### Next Milestones (2-3 weeks)
- [ ] Implement Stripe webhook endpoint with signature verification
- [ ] Persist lifecycle changes and reconcile failed retries
- [ ] Refunds backend: create refund and sync status to UI
- [ ] Reporting endpoints for payouts/fees and monthly summaries

### Risks & Mitigations
- **Out-of-order events**: Use event timestamps and versions; store last-processed
- **Currency mismatches**: Default GBP; validate currency on intent and invoice

### Metrics & Targets
- 100% webhook handling success with retries; Refund SLA < 24h
- P95 payment intent create < 400ms; zero duplicate charges
