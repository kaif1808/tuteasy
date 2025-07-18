# Payment Processing System

A complete frontend payment processing system integrated with Stripe for secure lesson payments.

## Features

### 🔐 Secure Payment Processing
- **Stripe Elements Integration**: PCI-compliant payment forms
- **Multiple Payment Methods**: Cards, digital wallets, bank transfers
- **GBP Currency Support**: Optimized for UK market
- **Real-time Validation**: Comprehensive form validation with Zod

### 💳 Payment Management
- **Saved Payment Methods**: Store and manage payment methods
- **Default Payment Method**: Set preferred payment method
- **Billing Information**: Complete address and contact management
- **Payment History**: Transaction history with filtering and search

### 📄 Invoice & Billing
- **Invoice Generation**: Automatic invoice creation
- **PDF Download**: Download invoices as PDF
- **Payment Receipts**: Detailed payment confirmations
- **Line Item Details**: Lesson-specific billing information

### 🔄 Refund Management
- **Refund Requests**: Submit refund requests with reasons
- **Partial Refunds**: Support for partial refund amounts
- **Status Tracking**: Track refund request status
- **Automated Processing**: Integration with Stripe refund API

## Components

### Core Components

#### `PaymentForm`
Complete payment form with Stripe Elements integration.

```tsx
import { PaymentForm } from '@/components/features/payment';

<PaymentForm
  clientSecret="pi_xxx_secret_xxx"
  amount={5000} // £50.00 in pence
  currency="GBP"
  tutorName="John Doe"
  lessonDuration={60}
  onSuccess={(paymentIntentId) => console.log('Payment successful')}
  onError={(error) => console.error('Payment failed')}
/>
```

#### `PaymentHistory`
Transaction history with filtering and pagination.

```tsx
import { PaymentHistory } from '@/components/features/payment';

<PaymentHistory
  showFilters={true}
  pageSize={10}
/>
```

#### `SavedPaymentMethods`
Manage saved payment methods.

```tsx
import { SavedPaymentMethods } from '@/components/features/payment';

<SavedPaymentMethods
  onAddPaymentMethod={() => setShowAddForm(true)}
  onEditPaymentMethod={(method) => setEditingMethod(method)}
/>
```

#### `BillingInfo`
Billing information management.

```tsx
import { BillingInfo } from '@/components/features/payment';

<BillingInfo
  showEditButton={true}
  onUpdate={(details) => console.log('Billing updated')}
/>
```

#### `InvoiceDisplay`
Display invoice details with download option.

```tsx
import { InvoiceDisplay } from '@/components/features/payment';

<InvoiceDisplay
  invoiceId="inv_xxx"
  onClose={() => setShowInvoice(false)}
/>
```

#### `RefundRequest`
Refund request management.

```tsx
import { RefundRequest } from '@/components/features/payment';

<RefundRequest
  transactionId="txn_xxx" // Optional: pre-select transaction
/>
```

## Hooks

### Payment Processing
```tsx
import { usePaymentProcessing } from '@/hooks/usePayment';

const { processPayment, isProcessing, error } = usePaymentProcessing();
```

### Payment Methods
```tsx
import { 
  usePaymentMethods,
  useAddPaymentMethod,
  useDeletePaymentMethod 
} from '@/hooks/usePayment';

const { data: paymentMethods } = usePaymentMethods();
const addPaymentMethod = useAddPaymentMethod();
const deletePaymentMethod = useDeletePaymentMethod();
```

### Payment History
```tsx
import { usePaymentHistory } from '@/hooks/usePayment';

const { data: history } = usePaymentHistory({
  status: 'succeeded',
  dateFrom: '2024-01-01T00:00:00Z',
  page: 1,
  limit: 20
});
```

## Services

### PaymentService
Complete API service for payment operations.

```tsx
import { PaymentService } from '@/services/paymentService';

// Create payment intent
const intent = await PaymentService.createPaymentIntent({
  tutorId: 'tutor_xxx',
  duration: 60
});

// Get payment history
const history = await PaymentService.getPaymentHistory({
  status: 'succeeded',
  page: 1
});
```

## Configuration

### Environment Variables
```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API Configuration
VITE_API_URL=http://localhost:5000/api
```

### Stripe Setup
1. Add Stripe publishable key to environment variables
2. Configure Stripe Elements appearance (optional)
3. Set up webhook endpoints for payment confirmations

## Integration

### Booking Flow Integration
The payment system integrates seamlessly with the booking flow:

1. User selects lesson time and tutor
2. Booking page redirects to payment page
3. Payment is processed securely
4. User is redirected back to dashboard

### Authentication Integration
- Automatic user identification for payments
- Billing details linked to user profiles
- Role-based payment features (Parent paying for Student)

## Security

- **PCI Compliance**: Stripe Elements handles sensitive card data
- **No Card Storage**: Card details never touch your servers
- **Secure Tokens**: Payment intents and client secrets for secure processing
- **Validation**: Comprehensive input validation and sanitization

## Error Handling

- **User-Friendly Messages**: Clear error messages for users
- **Retry Logic**: Automatic retry for transient failures
- **Fallback States**: Graceful degradation for network issues
- **Toast Notifications**: Real-time feedback for all operations

## Testing

Run payment component tests:
```bash
npm test -- --testPathPattern=payment
```

## API Endpoints

The payment system integrates with these backend endpoints:

- `POST /api/payments/create-intent` - Create payment intent
- `GET /api/payments/methods` - Get saved payment methods
- `POST /api/payments/methods` - Add payment method
- `GET /api/payments/transactions` - Get payment history
- `POST /api/payments/refunds` - Create refund request
- `GET /api/payments/invoices` - Get invoices

## Currency Support

Currently optimized for GBP (British Pounds) with support for:
- Proper currency formatting (£50.00)
- Pence-based calculations
- UK postal code validation
- British date formats
