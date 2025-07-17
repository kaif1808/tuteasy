import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  MoreVertical,
  Star,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Skeleton } from '../../../ui/Skeleton';
import { Modal } from '../../../ui/Modal';
import {
  usePaymentMethods,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
} from '../../../../hooks/usePayment';
import type { PaymentMethod } from '../../../../types/payment.types';

interface SavedPaymentMethodsProps {
  onAddPaymentMethod?: () => void;
  onEditPaymentMethod?: (paymentMethod: PaymentMethod) => void;
  className?: string;
  showAddButton?: boolean;
}

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onEdit?: (paymentMethod: PaymentMethod) => void;
  onDelete: (paymentMethodId: string) => void;
  onSetDefault: (paymentMethodId: string) => void;
  isDeleting?: boolean;
  isSettingDefault?: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting = false,
  isSettingDefault = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getCardBrandIcon = (brand: string) => {
    // In a real app, you'd use actual card brand icons
    const brandColors = {
      visa: 'text-blue-600',
      mastercard: 'text-red-600',
      amex: 'text-green-600',
      discover: 'text-orange-600',
    };
    
    return (
      <CreditCard 
        className={`h-6 w-6 ${brandColors[brand.toLowerCase() as keyof typeof brandColors] || 'text-gray-600'}`} 
      />
    );
  };

  const formatCardNumber = (last4: string) => `•••• •••• •••• ${last4}`;

  const formatExpiry = (month: number, year: number) => 
    `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;

  return (
    <div className="relative border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {paymentMethod.card && getCardBrandIcon(paymentMethod.card.brand)}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">
                {paymentMethod.card?.brand.toUpperCase()} {paymentMethod.card?.funding}
              </h4>
              {paymentMethod.isDefault && (
                <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Default
                </Badge>
              )}
            </div>
            
            {paymentMethod.card && (
              <>
                <p className="text-sm text-gray-600 mb-1">
                  {formatCardNumber(paymentMethod.card.last4)}
                </p>
                <p className="text-xs text-gray-500">
                  Expires {formatExpiry(paymentMethod.card.expMonth, paymentMethod.card.expYear)}
                </p>
              </>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              {paymentMethod.billingDetails.name}
            </p>
          </div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-10 min-w-[160px]">
              {!paymentMethod.isDefault && (
                <button
                  onClick={() => {
                    onSetDefault(paymentMethod.id);
                    setShowMenu(false);
                  }}
                  disabled={isSettingDefault}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  Set as Default
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(paymentMethod);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
              )}
              
              <button
                onClick={() => {
                  onDelete(paymentMethod.id);
                  setShowMenu(false);
                }}
                disabled={isDeleting || paymentMethod.isDefault}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {paymentMethod.isDefault ? 'Cannot Delete Default' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlays */}
      {(isDeleting || isSettingDefault) && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            {isDeleting ? 'Deleting...' : 'Setting as default...'}
          </div>
        </div>
      )}
    </div>
  );
};

export const SavedPaymentMethods: React.FC<SavedPaymentMethodsProps> = ({
  onAddPaymentMethod,
  onEditPaymentMethod,
  className = '',
  showAddButton = true,
}) => {
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { data: paymentMethods, isLoading, error } = usePaymentMethods();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const setDefaultPaymentMethodMutation = useSetDefaultPaymentMethod();

  const handleDelete = async (paymentMethodId: string) => {
    setDeletingMethodId(paymentMethodId);
    try {
      await deletePaymentMethodMutation.mutateAsync(paymentMethodId);
    } finally {
      setDeletingMethodId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    setSettingDefaultId(paymentMethodId);
    try {
      await setDefaultPaymentMethodMutation.mutateAsync(paymentMethodId);
    } finally {
      setSettingDefaultId(null);
    }
  };

  const confirmDelete = (paymentMethodId: string) => {
    setShowDeleteConfirm(paymentMethodId);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load payment methods</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Saved Payment Methods
            </CardTitle>
            {showAddButton && onAddPaymentMethod && (
              <Button
                onClick={onAddPaymentMethod}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Method
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-6 w-6" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !paymentMethods?.length ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No saved payment methods</p>
              <p className="text-sm text-gray-400 mb-4">
                Add a payment method to make future payments faster and easier.
              </p>
              {showAddButton && onAddPaymentMethod && (
                <Button onClick={onAddPaymentMethod} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Payment Method
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((paymentMethod) => (
                <PaymentMethodCard
                  key={paymentMethod.id}
                  paymentMethod={paymentMethod}
                  onEdit={onEditPaymentMethod}
                  onDelete={confirmDelete}
                  onSetDefault={handleSetDefault}
                  isDeleting={deletingMethodId === paymentMethod.id}
                  isSettingDefault={settingDefaultId === paymentMethod.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Delete Payment Method"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this payment method? This action cannot be undone.
            </p>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deletePaymentMethodMutation.isPending}
              >
                {deletePaymentMethodMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
