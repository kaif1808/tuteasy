import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, Save, X, MapPin, Mail, Phone, User } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../../../ui/Card';
import { Label } from '../../../ui/Label';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { Skeleton } from '../../../ui/Skeleton';
import { useBillingDetails, useUpdateBillingDetails } from '../../../../hooks/usePayment';
import { billingDetailsSchema } from '../../../../utils/paymentValidation';
import type { BillingDetails } from '../../../../types/payment.types';

interface BillingInfoProps {
  onUpdate?: (billingDetails: BillingDetails) => void;
  showEditButton?: boolean;
  className?: string;
}

const COUNTRIES = [
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'IE', label: 'Ireland' },
];

export const BillingInfo: React.FC<BillingInfoProps> = ({
  onUpdate,
  showEditButton = true,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: billingDetails, isLoading, error } = useBillingDetails();
  const updateBillingMutation = useUpdateBillingDetails();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BillingDetails>({
    resolver: zodResolver(billingDetailsSchema),
    defaultValues: billingDetails,
  });

  // Reset form when billing details change
  React.useEffect(() => {
    if (billingDetails) {
      reset(billingDetails);
    }
  }, [billingDetails, reset]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset(billingDetails);
  };

  const onSubmit = async (data: BillingDetails) => {
    try {
      await updateBillingMutation.mutateAsync(data);
      setIsEditing(false);
      onUpdate?.(data);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">
            Failed to load billing information. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Billing Information
          </CardTitle>
          {showEditButton && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="John Smith"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+44 7700 900123"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Address</h4>
              
              <div>
                <Label htmlFor="line1">Address Line 1 *</Label>
                <Input
                  id="line1"
                  {...register('address.line1')}
                  placeholder="123 Main Street"
                  className={errors.address?.line1 ? 'border-red-500' : ''}
                />
                {errors.address?.line1 && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.line1.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="line2">Address Line 2</Label>
                <Input
                  id="line2"
                  {...register('address.line2')}
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...register('address.city')}
                    placeholder="London"
                    className={errors.address?.city ? 'border-red-500' : ''}
                  />
                  {errors.address?.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State/County</Label>
                  <Input
                    id="state"
                    {...register('address.state')}
                    placeholder="Greater London"
                  />
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    {...register('address.postalCode')}
                    placeholder="SW1A 1AA"
                    className={errors.address?.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.address?.postalCode && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.postalCode.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Select
                  {...register('address.country')}
                  className={errors.address?.country ? 'border-red-500' : ''}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </Select>
                {errors.address?.country && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.country.message}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={!isDirty || updateBillingMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateBillingMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Display Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{billingDetails?.name}</p>
                  <p className="text-xs text-gray-500">Full Name</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{billingDetails?.email}</p>
                  <p className="text-xs text-gray-500">Email Address</p>
                </div>
              </div>
            </div>

            {billingDetails?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{billingDetails.phone}</p>
                  <p className="text-xs text-gray-500">Phone Number</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
              <div>
                <p className="text-sm font-medium">
                  {billingDetails?.address.line1}
                  {billingDetails?.address.line2 && `, ${billingDetails.address.line2}`}
                </p>
                <p className="text-sm">
                  {billingDetails?.address.city}
                  {billingDetails?.address.state && `, ${billingDetails.address.state}`}
                </p>
                <p className="text-sm">
                  {billingDetails?.address.postalCode}
                </p>
                <p className="text-sm">
                  {COUNTRIES.find(c => c.value === billingDetails?.address.country)?.label}
                </p>
                <p className="text-xs text-gray-500">Billing Address</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
