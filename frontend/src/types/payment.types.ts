// Payment-related TypeScript type definitions

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number; // Amount in pence (smallest currency unit)
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  metadata?: {
    userId?: string;
    tutorId?: string;
    lessonDuration?: string;
    bookingId?: string;
  };
}

export interface CreatePaymentIntentRequest {
  tutorId: string;
  duration: number; // Duration in minutes
  bookingId?: string;
}

export interface CreatePaymentIntentResponse {
  status: 'success';
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'digital_wallet';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
  };
  billingDetails: BillingDetails;
  isDefault: boolean;
  createdAt: string;
}

export interface BillingDetails {
  name: string;
  email: string;
  phone?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}

export interface Transaction {
  id: string;
  paymentIntentId: string;
  amount: number; // Amount in pence
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded' | 'partially_refunded';
  type: 'payment' | 'refund' | 'dispute';
  description: string;
  metadata: {
    tutorId?: string;
    tutorName?: string;
    studentId?: string;
    studentName?: string;
    lessonDuration?: number;
    lessonDate?: string;
    bookingId?: string;
  };
  paymentMethod?: {
    type: string;
    card?: {
      brand: string;
      last4: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentHistoryFilters {
  status?: Transaction['status'];
  type?: Transaction['type'];
  dateFrom?: string;
  dateTo?: string;
  tutorId?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  amount: number;
  currency: string;
  dueDate: string;
  paidAt?: string;
  description: string;
  lineItems: InvoiceLineItem[];
  billingDetails: BillingDetails;
  tutorDetails: {
    id: string;
    name: string;
    email: string;
  };
  studentDetails: {
    id: string;
    name: string;
    email: string;
  };
  paymentDetails?: {
    transactionId: string;
    paymentMethod: string;
    paidAmount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // Price in pence
  totalPrice: number; // Price in pence
  metadata?: {
    lessonDate?: string;
    lessonDuration?: number;
    subject?: string;
  };
}

export interface RefundRequest {
  id: string;
  transactionId: string;
  amount: number; // Amount to refund in pence
  currency: string; // Currency of the original transaction
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'lesson_canceled' | 'other';
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedBy: {
    userId: string;
    userType: 'student' | 'parent' | 'tutor';
    name: string;
  };
  reviewedBy?: {
    userId: string;
    name: string;
    reviewedAt: string;
  };
  processedAt?: string;
  refundId?: string; // Stripe refund ID when processed
  createdAt: string;
  updatedAt: string;
}

export interface CreateRefundRequest {
  transactionId: string;
  amount?: number; // Optional partial refund amount
  reason: RefundRequest['reason'];
  description?: string;
}

export interface PaymentFormData {
  billingDetails: BillingDetails;
  savePaymentMethod: boolean;
  setAsDefault: boolean;
}

export interface PaymentError {
  code: string;
  message: string;
  type: 'card_error' | 'validation_error' | 'api_error' | 'authentication_error' | 'rate_limit_error';
  param?: string;
}

export interface PaymentState {
  isProcessing: boolean;
  error: PaymentError | null;
  paymentIntent: PaymentIntent | null;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  invoices: Invoice[];
  refundRequests: RefundRequest[];
}

// Utility types for currency formatting
export type CurrencyCode = 'GBP' | 'USD' | 'EUR';

export interface CurrencyFormatOptions {
  currency: CurrencyCode;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Stripe-specific types
export interface StripeElementsOptions {
  clientSecret: string;
  appearance?: {
    theme?: 'stripe' | 'night' | 'flat';
    variables?: Record<string, string>;
  };
  loader?: 'auto' | 'always' | 'never';
}

export interface StripePaymentElementOptions {
  layout?: 'tabs' | 'accordion' | 'auto';
  defaultValues?: {
    billingDetails?: Partial<BillingDetails>;
  };
  business?: {
    name?: string;
  };
}

// React Query keys
export const paymentKeys = {
  all: ['payments'] as const,
  paymentMethods: () => [...paymentKeys.all, 'methods'] as const,
  transactions: () => [...paymentKeys.all, 'transactions'] as const,
  transactionHistory: (filters: PaymentHistoryFilters) => [...paymentKeys.transactions(), filters] as const,
  invoices: () => [...paymentKeys.all, 'invoices'] as const,
  invoice: (id: string) => [...paymentKeys.invoices(), id] as const,
  refunds: () => [...paymentKeys.all, 'refunds'] as const,
  paymentIntent: (data: CreatePaymentIntentRequest) => [...paymentKeys.all, 'intent', data] as const,
} as const;
