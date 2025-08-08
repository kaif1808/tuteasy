## Payments Status

### Frontend (Complete)
- Stripe Elements checkout flow with PaymentElement/AddressElement
- Billing details management, saved methods (CRUD), default selection
- Transactions history with filters, invoices with PDF download
- Refund request UI (partial/full); comprehensive validation and toasts

### Backend (MVP)
- Schema: invoices, invoice_items, transactions, payment_methods
- Endpoint: POST /api/payments/create-intent via Stripe SDK

### Next
- Webhooks: payment_intent, charge, invoice lifecycle
- Reconciliation and reporting, refunds backend
- GBP defaults with extensible multi-currency support
