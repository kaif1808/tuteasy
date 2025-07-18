import { z } from 'zod';

// Billing details validation schema
export const billingDetailsSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  
  address: z.object({
    line1: z.string()
      .min(5, 'Address line 1 must be at least 5 characters')
      .max(100, 'Address line 1 must be less than 100 characters'),
    
    line2: z.string()
      .max(100, 'Address line 2 must be less than 100 characters')
      .optional()
      .or(z.literal('')),
    
    city: z.string()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City must be less than 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'City can only contain letters, spaces, hyphens, and apostrophes'),
    
    state: z.string()
      .max(50, 'State must be less than 50 characters')
      .optional()
      .or(z.literal('')),
    
    postalCode: z.string()
      .min(3, 'Postal code must be at least 3 characters')
      .max(10, 'Postal code must be less than 10 characters')
      .regex(/^[A-Z0-9\s-]+$/i, 'Please enter a valid postal code'),
    
    country: z.string()
      .length(2, 'Country must be a 2-letter country code')
      .regex(/^[A-Z]{2}$/, 'Country must be a valid 2-letter country code'),
  }),
});

// Payment form validation schema
export const paymentFormSchema = z.object({
  billingDetails: billingDetailsSchema,
  savePaymentMethod: z.boolean().default(false),
  setAsDefault: z.boolean().default(false),
});

// Create payment intent validation schema
export const createPaymentIntentSchema = z.object({
  tutorId: z.string()
    .uuid('Invalid tutor ID format'),
  
  duration: z.number()
    .int('Duration must be a whole number')
    .min(15, 'Minimum lesson duration is 15 minutes')
    .max(480, 'Maximum lesson duration is 8 hours'),
  
  bookingId: z.string()
    .uuid('Invalid booking ID format')
    .optional(),
});

// Payment history filters validation schema
export const paymentHistoryFiltersSchema = z.object({
  status: z.enum(['pending', 'succeeded', 'failed', 'canceled', 'refunded', 'partially_refunded']).optional(),
  type: z.enum(['payment', 'refund', 'dispute']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  tutorId: z.string().uuid().optional(),
  minAmount: z.number().min(0, 'Minimum amount must be positive').optional(),
  maxAmount: z.number().min(0, 'Maximum amount must be positive').optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
}).refine(
  (data) => !data.dateFrom || !data.dateTo || new Date(data.dateFrom) <= new Date(data.dateTo),
  {
    message: 'Date from must be before date to',
    path: ['dateTo'],
  }
).refine(
  (data) => !data.minAmount || !data.maxAmount || data.minAmount <= data.maxAmount,
  {
    message: 'Minimum amount must be less than or equal to maximum amount',
    path: ['maxAmount'],
  }
);

// Refund request validation schema
export const createRefundRequestSchema = z.object({
  transactionId: z.string()
    .uuid('Invalid transaction ID format'),
  
  amount: z.number()
    .int('Amount must be a whole number')
    .min(1, 'Refund amount must be at least 1 pence')
    .optional(),
  
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer', 'lesson_canceled', 'other']),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

// Currency validation
export const currencySchema = z.enum(['GBP', 'USD', 'EUR']);

// Amount validation (in pence/cents)
export const amountSchema = z.number()
  .int('Amount must be a whole number')
  .min(1, 'Amount must be at least 1 pence')
  .max(999999999, 'Amount is too large'); // £9,999,999.99 max

// Card validation helpers
export const cardNumberRegex = /^[0-9\s]{13,19}$/;
export const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
export const cvcRegex = /^[0-9]{3,4}$/;

// Validation helper functions
export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cardNumberRegex.test(cleaned) && luhnCheck(cleaned);
};

export const validateExpiry = (expiry: string): boolean => {
  if (!expiryRegex.test(expiry)) return false;
  
  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expiryYear = parseInt(year, 10);
  const expiryMonth = parseInt(month, 10);
  
  if (expiryYear < currentYear) return false;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
  
  return true;
};

export const validateCVC = (cvc: string): boolean => {
  return cvcRegex.test(cvc);
};

// Luhn algorithm for card number validation
const luhnCheck = (cardNumber: string): boolean => {
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Format validation helpers
export const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const match = cleaned.match(/.{1,4}/g);
  return match ? match.join(' ') : cleaned;
};

export const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return cleaned;
};

export const formatCurrency = (
  amount: number,
  currency: string = 'GBP',
  locale: string = 'en-GB'
): string => {
  // Convert from pence/cents to main currency unit
  const mainAmount = amount / 100;

  // Validate currency code - fallback to GBP if invalid
  const validCurrency = /^[A-Z]{3}$/.test(currency) ? currency : 'GBP';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: validCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(mainAmount);
  } catch (error) {
    // Fallback to GBP if currency is not supported
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(mainAmount);
  }
};

export const parseCurrencyInput = (value: string): number => {
  // Remove currency symbols and convert to pence/cents
  const cleaned = value.replace(/[£$€,\s]/g, '');
  const amount = parseFloat(cleaned);
  return Math.round(amount * 100);
};

// Postal code validation by country
export const validatePostalCode = (postalCode: string, country: string): boolean => {
  const patterns: Record<string, RegExp> = {
    GB: /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i, // UK postcodes
    US: /^[0-9]{5}(-[0-9]{4})?$/, // US ZIP codes
    CA: /^[A-Z][0-9][A-Z]\s?[0-9][A-Z][0-9]$/i, // Canadian postal codes
    DE: /^[0-9]{5}$/, // German postal codes
    FR: /^[0-9]{5}$/, // French postal codes
    // Add more countries as needed
  };
  
  const pattern = patterns[country.toUpperCase()];
  return pattern ? pattern.test(postalCode) : /^[A-Z0-9\s-]{3,10}$/i.test(postalCode);
};

// Error message helpers
export const getValidationErrorMessage = (error: z.ZodError): string => {
  const firstError = error.errors[0];
  return firstError?.message || 'Validation error occurred';
};

export const getFieldErrorMessage = (error: z.ZodError, fieldPath: string): string | undefined => {
  const fieldError = error.errors.find(err => err.path.join('.') === fieldPath);
  return fieldError?.message;
};
