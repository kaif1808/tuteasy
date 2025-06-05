# Payment Processing System - Sub-PRD

## Overview
The Payment Processing System handles all financial transactions within the tutoring CRM platform, providing secure, reliable processing of payments between students/parents and tutors. This system enables flexible payment options, recurring billing, and comprehensive financial tracking.

## Target Users
- **Primary**: Students/parents making payments for tutoring services
- **Secondary**: Tutors receiving payment for services rendered
- **Tertiary**: Tutoring agencies managing commission structures
- **Admin**: Platform administrators handling financial operations

## Feature Requirements

### Core Features (MVP)
- **Payment Methods**
  - Credit/debit card processing
  - Bank transfer/ACH support
  - Digital wallet integration (Apple Pay, Google Pay)
  - International payment support (Note: For UK-market focus, ensure GBP (£) is a primary supported currency from MVP, with user-facing defaults set to GBP.)
  - Currency conversion

- **Invoicing System**
  - Automated invoice generation
  - PDF invoice creation and delivery
  - Payment due date tracking
  - Payment status monitoring
  - Payment reminders

- **Payment History**
  - Comprehensive transaction logs
  - Payment receipt generation
  - Searchable payment history
  - Export functionality (CSV, PDF)
  - Tax documentation support

### Advanced Features (Phase 2)
- **Subscription Billing**
  - Recurring payment scheduling
  - Package/bundle payment options
  - Subscription management
  - Automatic renewals
  - Installment plans

- **Financial Reports**
  - Revenue analytics dashboard
  - Tax summaries
  - Period comparison reports
  - Detailed transaction breakdowns
  - Custom report generation

- **Extended Capabilities**
  - Multiple currency support
  - Split payments (multiple payers)
  - Refund processing
  - Dispute handling
  - Gift card/credit system

## Technical Requirements

### Recommended Tech Stack

#### Frontend
```typescript
// Core Libraries
- React 18+ with TypeScript
- Redux Toolkit for state management
- React Query for data fetching
- React Hook Form with Zod validation

// Payment UI Components
- @stripe/react-stripe-js for Stripe Elements
- react-pdf for invoice rendering
- recharts for financial visualizations
- react-table for transaction history
- react-datepicker for date selection
```

#### Backend
```typescript
// Core Server
- Node.js 18+ LTS
- Express.js with TypeScript
- PostgreSQL for transaction data
- Redis for caching payment state

// Payment Processing
- Stripe Node.js SDK (primary payment processor)
- PayPal SDK (secondary option)
- Plaid for bank account connections
- node-cron for scheduled tasks
- bull for payment job queues

// Security
- helmet for HTTP headers
- express-rate-limit
- data encryption at rest
- PCI DSS compliance tools
```

### Database Schema

```sql
-- Payment methods
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    payment_type VARCHAR(20) NOT NULL, -- card, bank, wallet
    provider VARCHAR(20) NOT NULL, -- stripe, paypal, etc.
    external_id VARCHAR(255) NOT NULL, -- ID in payment processor
    last_four VARCHAR(4), -- Last four digits (cards)
    expiry_date VARCHAR(7), -- MM/YYYY format
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    sender_id INTEGER REFERENCES users(id), -- tutor/agency
    recipient_id INTEGER REFERENCES users(id), -- student/parent
    amount_due DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, overdue, canceled
    due_date TIMESTAMP WITH TIME ZONE,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    notes TEXT,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice items (line items)
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(8,2) DEFAULT 1.00,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    session_id INTEGER REFERENCES sessions(id), -- Optional link to specific session
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_number VARCHAR(20) UNIQUE NOT NULL,
    payer_id INTEGER REFERENCES users(id),
    payee_id INTEGER REFERENCES users(id),
    invoice_id INTEGER REFERENCES invoices(id),
    payment_method_id INTEGER REFERENCES payment_methods(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    status VARCHAR(20) NOT NULL, -- pending, completed, failed, refunded
    processor VARCHAR(20) NOT NULL, -- stripe, paypal, etc.
    processor_transaction_id VARCHAR(255),
    fees DECIMAL(10,2) DEFAULT 0.00,
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    refunded_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    subscriber_id INTEGER REFERENCES users(id),
    provider_id INTEGER REFERENCES users(id),
    plan_name VARCHAR(100) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL, -- weekly, monthly, quarterly, yearly
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    status VARCHAR(20) DEFAULT 'active', -- active, paused, canceled
    payment_method_id INTEGER REFERENCES payment_methods(id),
    next_billing_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## User Stories

### As a Student/Parent
- I want to securely save my payment information for future transactions
- I want to see a clear breakdown of charges before confirming payment
- I want to receive detailed receipts for all payments
- I want to set up automatic payments for recurring sessions
- I want to view my complete payment history

### As a Tutor
- I want to create and send professional invoices to clients
- I want to track pending and completed payments
- I want to offer various payment options to my clients
- I want to receive notifications when payments are made
- I want to generate financial reports for tax purposes

### As an Agency
- I want to automate commission calculations on all transactions
- I want to track payments across all tutors in our agency
- I want to customize payment terms for different tutors and clients
- I want to generate comprehensive financial reports

## Stripe Integration

```typescript
// Server-side implementation
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Creating a payment intent
async function createPaymentIntent(amount: number, currency: string, customerId: string) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe uses cents
    currency,
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

// Client-side implementation with React
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-confirmation`,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>Pay Now</button>
    </form>
  );
}

function PaymentPage({ clientSecret }: { clientSecret: string }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}
```

## API Endpoints

```typescript
// Payment Methods
POST   /api/payment-methods               // Add payment method
GET    /api/payment-methods               // List user payment methods
DELETE /api/payment-methods/:id           // Remove payment method
PUT    /api/payment-methods/:id/default   // Set default payment method

// Invoices
POST   /api/invoices                      // Create invoice
GET    /api/invoices                      // List invoices
GET    /api/invoices/:id                  // Get invoice details
PUT    /api/invoices/:id                  // Update invoice
POST   /api/invoices/:id/send             // Send invoice to recipient
POST   /api/invoices/:id/pay              // Pay invoice
GET    /api/invoices/:id/pdf              // Download invoice PDF

// Transactions
GET    /api/transactions                  // List user transactions
GET    /api/transactions/:id              // Get transaction details
POST   /api/transactions/:id/refund       // Process refund

// Subscriptions
POST   /api/subscriptions                 // Create subscription
GET    /api/subscriptions                 // List user subscriptions
PUT    /api/subscriptions/:id             // Update subscription
PUT    /api/subscriptions/:id/cancel      // Cancel subscription
PUT    /api/subscriptions/:id/pause       // Pause subscription

// Reports
GET    /api/reports/earnings              // Get earnings report
GET    /api/reports/tax                   // Get tax summary
GET    /api/reports/transactions          // Get transaction report
```

## Success Metrics
- Payment success rate: >99%
- Average payment processing time: <3 seconds
- Invoice payment rate: >95% within due date
- User satisfaction with payment experience: >4.7/5
- Payment method addition completion rate: >90%

## Security & Compliance
- PCI DSS compliance for all payment processing
- No direct storage of sensitive payment data
- GDPR and CCPA compliance for user financial data
- Secure API endpoints with authentication and authorization
- Regular security audits and penetration testing
- Detailed transaction logging for dispute resolution

## Implementation Timeline
- **Week 1-2**: Integration with payment processors (Stripe primary)
- **Week 3-4**: Basic payment flow and payment method management
- **Week 5-6**: Invoice generation and management
- **Week 7-8**: Transaction tracking and reporting
- **Week 9-10**: Subscription and recurring payment system
- **Week 11-12**: Financial reporting and analytics

## Error Handling
- Graceful handling of payment failures
- Clear user messaging for declined transactions
- Automatic retry strategies for failed payments
- Session preservation during payment process
- Comprehensive error logging for debugging

## Future Enhancements
- Multi-currency support with automatic conversion
- Tax calculation based on geographical jurisdiction
- Advanced subscription management (upgrades, downgrades)
- Loyalty program and referral rewards
- Automated dunning management for failed payments
- Enhanced financial analytics and forecasting
- Payment plan options for higher-cost packages
- Wallet/credit system for platform-specific balance