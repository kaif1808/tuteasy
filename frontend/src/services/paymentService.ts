import { api } from './api';
import type {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  PaymentMethod,
  PaymentHistory,
  PaymentHistoryFilters,
  Invoice,
  RefundRequest,
  CreateRefundRequest,
  Transaction,
  BillingDetails,
} from '../types/payment.types';

// API Response wrapper type
interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  timestamp?: string;
}

export class PaymentService {
  // Create payment intent for lesson payment
  static async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> {
    try {
      const response = await api.post<CreatePaymentIntentResponse>(
        '/payments/create-intent',
        request
      );
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Confirm payment after Stripe Elements processing
  static async confirmPayment(paymentIntentId: string): Promise<Transaction> {
    try {
      const response = await api.post<ApiResponse<Transaction>>(
        `/payments/confirm/${paymentIntentId}`
      );
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get user's payment methods
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get<ApiResponse<PaymentMethod[]>>('/payments/methods');
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Add new payment method
  static async addPaymentMethod(
    paymentMethodId: string,
    billingDetails: BillingDetails,
    setAsDefault: boolean = false
  ): Promise<PaymentMethod> {
    try {
      const response = await api.post<ApiResponse<PaymentMethod>>('/payments/methods', {
        paymentMethodId,
        billingDetails,
        setAsDefault,
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Update payment method
  static async updatePaymentMethod(
    paymentMethodId: string,
    billingDetails: BillingDetails
  ): Promise<PaymentMethod> {
    try {
      const response = await api.put<ApiResponse<PaymentMethod>>(
        `/payments/methods/${paymentMethodId}`,
        { billingDetails }
      );
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Delete payment method
  static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await api.delete(`/payments/methods/${paymentMethodId}`);
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Set default payment method
  static async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const response = await api.put<ApiResponse<PaymentMethod>>(
        `/payments/methods/${paymentMethodId}/default`
      );
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get payment history with filters
  static async getPaymentHistory(filters: PaymentHistoryFilters = {}): Promise<PaymentHistory> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<ApiResponse<PaymentHistory>>(
        `/payments/transactions?${params.toString()}`
      );
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get specific transaction details
  static async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await api.get<ApiResponse<Transaction>>(
        `/payments/transactions/${transactionId}`
      );
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get user's invoices
  static async getInvoices(page: number = 1, limit: number = 20): Promise<{
    invoices: Invoice[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const response = await api.get<ApiResponse<{
        invoices: Invoice[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>>(`/payments/invoices?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get specific invoice
  static async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const response = await api.get<ApiResponse<Invoice>>(`/payments/invoices/${invoiceId}`);
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Download invoice PDF
  static async downloadInvoicePDF(invoiceId: string): Promise<Blob> {
    try {
      const response = await api.get(`/payments/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Create refund request
  static async createRefundRequest(request: CreateRefundRequest): Promise<RefundRequest> {
    try {
      const response = await api.post<ApiResponse<RefundRequest>>(
        '/payments/refunds',
        request
      );
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get user's refund requests
  static async getRefundRequests(): Promise<RefundRequest[]> {
    try {
      const response = await api.get<ApiResponse<RefundRequest[]>>('/payments/refunds');
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get specific refund request
  static async getRefundRequest(refundId: string): Promise<RefundRequest> {
    try {
      const response = await api.get<ApiResponse<RefundRequest>>(`/payments/refunds/${refundId}`);
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Cancel refund request (if still pending)
  static async cancelRefundRequest(refundId: string): Promise<RefundRequest> {
    try {
      const response = await api.delete<ApiResponse<RefundRequest>>(`/payments/refunds/${refundId}`);
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Update billing details
  static async updateBillingDetails(billingDetails: BillingDetails): Promise<BillingDetails> {
    try {
      const response = await api.put<ApiResponse<BillingDetails>>(
        '/payments/billing',
        billingDetails
      );
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get current billing details
  static async getBillingDetails(): Promise<BillingDetails> {
    try {
      const response = await api.get<ApiResponse<BillingDetails>>('/payments/billing');
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Error handling helper
  private static handleApiError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.response?.status === 401) {
      return new Error('Authentication required. Please log in again.');
    }
    
    if (error.response?.status === 403) {
      return new Error('You do not have permission to perform this action.');
    }
    
    if (error.response?.status === 404) {
      return new Error('The requested resource was not found.');
    }
    
    if (error.response?.status >= 500) {
      return new Error('A server error occurred. Please try again later.');
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return new Error('Network error. Please check your connection and try again.');
    }
    
    return new Error(error.message || 'An unexpected error occurred.');
  }
}

// Export service instance for convenience
export const paymentService = PaymentService;
