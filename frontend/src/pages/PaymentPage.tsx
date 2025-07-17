import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { PaymentForm } from '../components/features/payment/components/PaymentForm';
import { useCreatePaymentIntent, useBillingDetails } from '../hooks/usePayment';
import { useToast } from '../hooks/useToast';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/paymentValidation';
import type { CreatePaymentIntentRequest } from '../types/payment.types';

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...'
);

interface PaymentPageProps {}

export const PaymentPage: React.FC<PaymentPageProps> = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { user } = useAuthStore();

  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentCurrency, setPaymentCurrency] = useState<string>('GBP');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Get payment parameters from URL
  const duration = parseInt(searchParams.get('duration') || '60');
  const bookingId = searchParams.get('bookingId') || undefined;
  const tutorName = searchParams.get('tutorName') || undefined;
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  // Hooks
  const createPaymentIntentMutation = useCreatePaymentIntent();
  const { data: billingDetails } = useBillingDetails();

  // Create payment intent on component mount
  useEffect(() => {
    if (!tutorId) {
      showToast({
        title: 'Invalid Payment Request',
        description: 'Tutor ID is required for payment processing.',
        type: 'error',
      });
      navigate('/dashboard');
      return;
    }

    const createIntent = async () => {
      try {
        const request: CreatePaymentIntentRequest = {
          tutorId,
          duration,
          bookingId,
        };

        const response = await createPaymentIntentMutation.mutateAsync(request);
        setClientSecret(response.clientSecret);
        setPaymentAmount(response.amount);
        setPaymentCurrency(response.currency);
      } catch (error) {
        // Error is handled by the mutation hook
        navigate('/dashboard');
      }
    };

    createIntent();
  }, [tutorId, duration, bookingId, navigate, showToast, createPaymentIntentMutation]);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentSuccess(true);
    setPaymentIntentId(paymentIntentId);
    
    showToast({
      title: 'Payment Successful!',
      description: 'Your lesson payment has been processed successfully.',
      type: 'success',
    });

    // Redirect after a short delay
    setTimeout(() => {
      navigate(returnUrl);
    }, 3000);
  };

  const handlePaymentError = (error: Error) => {
    showToast({
      title: 'Payment Failed',
      description: error.message,
      type: 'error',
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Loading state
  if (createPaymentIntentMutation.isPending || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Setting up payment...
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Please wait while we prepare your payment form.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Your lesson payment has been processed successfully. You will receive a confirmation email shortly.
            </p>
            {paymentIntentId && (
              <p className="text-xs text-gray-500 mb-4">
                Payment ID: {paymentIntentId}
              </p>
            )}
            <Button onClick={() => navigate(returnUrl)} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (createPaymentIntentMutation.isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Setup Failed
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              We couldn't set up your payment. Please try again or contact support if the problem persists.
            </p>
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={handleGoBack} className="flex-1">
                Go Back
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main payment form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Complete Payment
              </h1>
              {tutorName && (
                <p className="text-sm text-gray-600">
                  Lesson with {tutorName} • {duration} minutes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#3b82f6',
                    colorBackground: '#ffffff',
                    colorText: '#1f2937',
                    colorDanger: '#ef4444',
                    fontFamily: 'system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '6px',
                  },
                },
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                amount={paymentAmount}
                currency={paymentCurrency}
                tutorName={tutorName}
                lessonDuration={duration}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                returnUrl={`${window.location.origin}/payment-success`}
                initialBillingDetails={billingDetails}
                showSavePaymentMethod={true}
              />
            </Elements>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lesson Duration:</span>
                    <span>{duration} minutes</span>
                  </div>
                  {tutorName && (
                    <div className="flex justify-between text-sm">
                      <span>Tutor:</span>
                      <span>{tutorName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Student:</span>
                    <span>{user?.email}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(paymentAmount, paymentCurrency)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Payment is processed securely by Stripe</p>
                  <p>• You will receive a confirmation email</p>
                  <p>• Refunds are available according to our policy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
