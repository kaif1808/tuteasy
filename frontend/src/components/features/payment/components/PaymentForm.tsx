import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from '@stripe/react-stripe-js';
import { Loader2, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../../../ui/Card';
import { Label } from '../../../ui/Label';
import { Input } from '../../../ui/Input';
import { usePaymentProcessing } from '../../../../hooks/usePayment';
import { paymentFormSchema } from '../../../../utils/paymentValidation';
import { formatCurrency } from '../../../../utils/paymentValidation';
import type { PaymentFormData, BillingDetails } from '../../../../types/payment.types';

interface PaymentFormProps {
  clientSecret: string;
  amount: number; // Amount in pence
  currency?: string;
  tutorName?: string;
  lessonDuration?: number;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: Error) => void;
  returnUrl?: string;
  initialBillingDetails?: Partial<BillingDetails>;
  showSavePaymentMethod?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  amount,
  currency = 'GBP',
  tutorName,
  lessonDuration,
  onSuccess,
  onError,
  returnUrl,
  initialBillingDetails,
  showSavePaymentMethod = true,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { processPayment, isProcessing, error, clearError } = usePaymentProcessing();
  const [isFormValid, setIsFormValid] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      billingDetails: {
        name: initialBillingDetails?.name || '',
        email: initialBillingDetails?.email || '',
        phone: initialBillingDetails?.phone || '',
        address: {
          line1: initialBillingDetails?.address?.line1 || '',
          line2: initialBillingDetails?.address?.line2 || '',
          city: initialBillingDetails?.address?.city || '',
          state: initialBillingDetails?.address?.state || '',
          postalCode: initialBillingDetails?.address?.postalCode || '',
          country: initialBillingDetails?.address?.country || 'GB',
        },
      },
      savePaymentMethod: false,
      setAsDefault: false,
    },
  });

  const watchSavePaymentMethod = watch('savePaymentMethod');

  // Check if Stripe Elements are ready
  useEffect(() => {
    if (!stripe || !elements) {
      setIsFormValid(false);
      return;
    }

    const paymentElement = elements.getElement(PaymentElement);
    if (paymentElement) {
      setIsFormValid(true);
    }
  }, [stripe, elements]);

  // Clear errors when form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watch(), clearError]);

  const onSubmit = async () => {
    if (!stripe || !elements) {
      onError?.(new Error('Stripe has not loaded yet'));
      return;
    }

    try {
      const paymentIntent = await processPayment(clientSecret, returnUrl);
      
      if (paymentIntent?.status === 'succeeded') {
        onSuccess?.(paymentIntent.id);
      }
    } catch (err: any) {
      onError?.(err);
    }
  };

  const formatLessonDetails = () => {
    if (!tutorName && !lessonDuration) return null;
    
    const duration = lessonDuration ? `${lessonDuration} minutes` : '';
    const tutor = tutorName ? `with ${tutorName}` : '';
    
    return [duration, tutor].filter(Boolean).join(' ');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        {(tutorName || lessonDuration) && (
          <p className="text-sm text-gray-600">
            Lesson {formatLessonDetails()}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Amount */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Amount:</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(amount, currency as any)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Billing Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Billing Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register('billingDetails.name')}
                  placeholder="John Smith"
                  className={errors.billingDetails?.name ? 'border-red-500' : ''}
                />
                {errors.billingDetails?.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.billingDetails.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('billingDetails.email')}
                  placeholder="john@example.com"
                  className={errors.billingDetails?.email ? 'border-red-500' : ''}
                />
                {errors.billingDetails?.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.billingDetails.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('billingDetails.phone')}
                  placeholder="+44 7700 900123"
                  className={errors.billingDetails?.phone ? 'border-red-500' : ''}
                />
                {errors.billingDetails?.phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.billingDetails.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address Element */}
          <div className="space-y-2">
            <Label>Billing Address *</Label>
            <div className="border rounded-md p-3">
              <AddressElement
                options={{
                  mode: 'billing',
                  defaultValues: {
                    name: initialBillingDetails?.name,
                    address: {
                      line1: initialBillingDetails?.address?.line1,
                      line2: initialBillingDetails?.address?.line2,
                      city: initialBillingDetails?.address?.city,
                      state: initialBillingDetails?.address?.state,
                      postal_code: initialBillingDetails?.address?.postalCode,
                      country: initialBillingDetails?.address?.country || 'GB',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Payment Element */}
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <div className="border rounded-md p-3">
              <PaymentElement
                options={{
                  layout: 'tabs',
                  defaultValues: {
                    billingDetails: {
                      name: initialBillingDetails?.name,
                      email: initialBillingDetails?.email,
                      phone: initialBillingDetails?.phone,
                      address: {
                        line1: initialBillingDetails?.address?.line1,
                        line2: initialBillingDetails?.address?.line2,
                        city: initialBillingDetails?.address?.city,
                        state: initialBillingDetails?.address?.state,
                        postal_code: initialBillingDetails?.address?.postalCode,
                        country: initialBillingDetails?.address?.country || 'GB',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Save Payment Method Options */}
          {showSavePaymentMethod && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="savePaymentMethod"
                  {...register('savePaymentMethod')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="savePaymentMethod" className="text-sm">
                  Save payment method for future use
                </Label>
              </div>

              {watchSavePaymentMethod && (
                <div className="flex items-center space-x-2 ml-6">
                  <input
                    type="checkbox"
                    id="setAsDefault"
                    {...register('setAsDefault')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="setAsDefault" className="text-sm">
                    Set as default payment method
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error.message}</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <Shield className="h-4 w-4 text-green-600" />
            <p className="text-xs text-green-700">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || !isFormValid || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing Payment...
              </>
            ) : (
              <>
                Pay {formatCurrency(amount, currency as any)}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
