import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { PaymentService } from '../services/paymentService';
import { useToast } from './useToast';
import type {
  CreatePaymentIntentRequest,
  PaymentHistoryFilters,
  CreateRefundRequest,
  BillingDetails,
  PaymentError,
} from '../types/payment.types';
import { paymentKeys } from '../types/payment.types';

// Payment processing hook
export const usePaymentProcessing = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);

  const processPayment = async (clientSecret: string, returnUrl?: string) => {
    if (!stripe || !elements) {
      throw new Error('Stripe has not loaded yet');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl || `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        const paymentError: PaymentError = {
          code: stripeError.code || 'unknown_error',
          message: stripeError.message || 'An unknown error occurred',
          type: stripeError.type as PaymentError['type'] || 'card_error',
        };
        setError(paymentError);
        throw new Error(paymentError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        showToast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully.',
          type: 'success',
        });
        return paymentIntent;
      }

      return paymentIntent;
    } catch (err: any) {
      const errorMessage = err.message || 'Payment processing failed';
      showToast({
        title: 'Payment Failed',
        description: errorMessage,
        type: 'error',
      });
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
};

// Payment intent creation hook
export const useCreatePaymentIntent = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: PaymentService.createPaymentIntent,
    onError: (error: Error) => {
      showToast({
        title: 'Payment Setup Failed',
        description: error.message,
        type: 'error',
      });
    },
  });
};

// Payment methods management hooks
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: paymentKeys.paymentMethods(),
    queryFn: PaymentService.getPaymentMethods,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      paymentMethodId,
      billingDetails,
      setAsDefault,
    }: {
      paymentMethodId: string;
      billingDetails: BillingDetails;
      setAsDefault?: boolean;
    }) => PaymentService.addPaymentMethod(paymentMethodId, billingDetails, setAsDefault),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.paymentMethods() });
      showToast({
        title: 'Payment Method Added',
        description: 'Your payment method has been saved successfully.',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      showToast({
        title: 'Failed to Add Payment Method',
        description: error.message,
        type: 'error',
      });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      paymentMethodId,
      billingDetails,
    }: {
      paymentMethodId: string;
      billingDetails: BillingDetails;
    }) => PaymentService.updatePaymentMethod(paymentMethodId, billingDetails),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.paymentMethods() });
      showToast({
        title: 'Payment Method Updated',
        description: 'Your payment method has been updated successfully.',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      showToast({
        title: 'Failed to Update Payment Method',
        description: error.message,
        type: 'error',
      });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: PaymentService.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.paymentMethods() });
      showToast({
        title: 'Payment Method Removed',
        description: 'Your payment method has been removed successfully.',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      showToast({
        title: 'Failed to Remove Payment Method',
        description: error.message,
        type: 'error',
      });
    },
  });
};

export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: PaymentService.setDefaultPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.paymentMethods() });
      showToast({
        title: 'Default Payment Method Updated',
        description: 'Your default payment method has been updated.',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      showToast({
        title: 'Failed to Update Default Payment Method',
        description: error.message,
        type: 'error',
      });
    },
  });
};

// Payment history hooks
export const usePaymentHistory = (filters: PaymentHistoryFilters = {}) => {
  return useQuery({
    queryKey: paymentKeys.transactionHistory(filters),
    queryFn: () => PaymentService.getPaymentHistory(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTransaction = (transactionId: string) => {
  return useQuery({
    queryKey: [...paymentKeys.transactions(), transactionId],
    queryFn: () => PaymentService.getTransaction(transactionId),
    enabled: !!transactionId,
  });
};

// Invoice hooks
export const useInvoices = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: [...paymentKeys.invoices(), { page, limit }],
    queryFn: () => PaymentService.getInvoices(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: paymentKeys.invoice(invoiceId),
    queryFn: () => PaymentService.getInvoice(invoiceId),
    enabled: !!invoiceId,
  });
};

export const useDownloadInvoice = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: PaymentService.downloadInvoicePDF,
    onSuccess: (blob, invoiceId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast({
        title: 'Invoice Downloaded',
        description: 'Your invoice has been downloaded successfully.',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      showToast({
        title: 'Download Failed',
        description: error.message,
        type: 'error',
      });
    },
  });
};

// Refund hooks
export const useRefundRequests = () => {
  return useQuery({
    queryKey: paymentKeys.refunds(),
    queryFn: PaymentService.getRefundRequests,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateRefundRequest = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: PaymentService.createRefundRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.refunds() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.transactions() });
      showToast({
        title: 'Refund Request Submitted',
        description: 'Your refund request has been submitted and will be reviewed.',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      showToast({
        title: 'Failed to Submit Refund Request',
        description: error.message,
        type: 'error',
      });
    },
  });
};

// Billing details hooks
export const useBillingDetails = () => {
  return useQuery({
    queryKey: [...paymentKeys.all, 'billing'],
    queryFn: PaymentService.getBillingDetails,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateBillingDetails = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: PaymentService.updateBillingDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...paymentKeys.all, 'billing'] });
      showToast({
        title: 'Billing Details Updated',
        description: 'Your billing details have been updated successfully.',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      showToast({
        title: 'Failed to Update Billing Details',
        description: error.message,
        type: 'error',
      });
    },
  });
};
