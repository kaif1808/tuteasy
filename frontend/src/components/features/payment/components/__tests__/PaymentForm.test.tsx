import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentForm } from '../PaymentForm';

// Mock Stripe
const mockStripe = loadStripe('pk_test_mock');

// Mock hooks
jest.mock('../../../../../hooks/usePayment', () => ({
  usePaymentProcessing: () => ({
    processPayment: jest.fn(),
    isProcessing: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Elements stripe={mockStripe}>
        {component}
      </Elements>
    </QueryClientProvider>
  );
};

describe('PaymentForm', () => {
  const defaultProps = {
    clientSecret: 'pi_test_client_secret',
    amount: 5000, // £50.00 in pence
    currency: 'GBP',
    tutorName: 'John Doe',
    lessonDuration: 60,
  };

  it('renders payment form with correct amount', () => {
    renderWithProviders(<PaymentForm {...defaultProps} />);
    
    expect(screen.getByText('Payment Details')).toBeInTheDocument();
    expect(screen.getByText('£50.00')).toBeInTheDocument();
    expect(screen.getByText('Lesson 60 minutes with John Doe')).toBeInTheDocument();
  });

  it('renders billing information fields', () => {
    renderWithProviders(<PaymentForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
  });

  it('renders save payment method option', () => {
    renderWithProviders(<PaymentForm {...defaultProps} showSavePaymentMethod={true} />);
    
    expect(screen.getByLabelText(/save payment method/i)).toBeInTheDocument();
  });

  it('displays security notice', () => {
    renderWithProviders(<PaymentForm {...defaultProps} />);
    
    expect(screen.getByText(/your payment information is encrypted and secure/i)).toBeInTheDocument();
  });
});
