## Feature: Payments

Last updated: 2025-08-08 — Status: Amber

### Scope
Payment intents, saved methods, billing, invoices, transactions, refunds.

### Code Map
- Backend: `backend/src/controllers/payment.controller.ts`, `backend/src/routes/payment.routes.ts`, `backend/src/services/payment.service.ts`
- Frontend: `frontend/src/components/features/payment/*`, `frontend/src/pages/PaymentPage.tsx`, `frontend/src/hooks/usePayment.ts`, `frontend/src/services/paymentService.ts`

### Completed
- FE Elements flow with billing, methods, transactions list, invoices, refunds UI
- BE create-intent endpoint; schema for invoices/items/transactions/methods

### In Progress
- Webhook handler and reconciliation pipeline; backend refunds and reporting

### Next Milestones
- [ ] Stripe webhook endpoint with signature verification + idempotency
- [ ] Persist lifecycle and reconcile retries
- [ ] Refunds API and UI sync; reporting endpoints

### Risks & Mitigations
- Out-of-order events — track version/ts; last-processed checkpoint

### Metrics & Targets
- 100% webhook success with retries; zero duplicate charges
