import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  DollarSign,
  FileText,
  Send,
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../../../ui/Card';
import { Label } from '../../../ui/Label';
import { Input } from '../../../ui/Input';
import { Textarea } from '../../../ui/Textarea';
import { Select } from '../../../ui/Select';
import { Badge } from '../../../ui/Badge';
import { Modal } from '../../../ui/Modal';
import { Skeleton } from '../../../ui/Skeleton';
import {
  useRefundRequests,
  useCreateRefundRequest,
  useTransaction,
} from '../../../../hooks/usePayment';
import { createRefundRequestSchema } from '../../../../utils/paymentValidation';
import { formatCurrency } from '../../../../utils/paymentValidation';
import type { CreateRefundRequest, RefundRequest, Transaction } from '../../../../types/payment.types';

interface RefundRequestFormProps {
  transaction: Transaction;
  onSubmit: (data: CreateRefundRequest) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const RefundRequestForm: React.FC<RefundRequestFormProps> = ({
  transaction,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateRefundRequest>({
    resolver: zodResolver(createRefundRequestSchema),
    defaultValues: {
      transactionId: transaction.id,
      amount: transaction.amount, // Full refund by default
      reason: 'requested_by_customer',
      description: '',
    },
  });

  const watchAmount = watch('amount');
  const isPartialRefund = watchAmount && watchAmount < transaction.amount;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Transaction Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Amount:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(transaction.amount, transaction.currency as any)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Date:</span>
            <span className="ml-2 font-medium">
              {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Description:</span>
            <span className="ml-2 font-medium">{transaction.description}</span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className="ml-2 font-medium capitalize">{transaction.status}</span>
          </div>
        </div>
      </div>

      {/* Refund Amount */}
      <div>
        <Label htmlFor="amount">Refund Amount (in pence) *</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          max={transaction.amount}
          {...register('amount', { valueAsNumber: true })}
          className={errors.amount ? 'border-red-500' : ''}
        />
        {errors.amount && (
          <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
        )}
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>
            Refund: {formatCurrency(watchAmount || 0, transaction.currency as any)}
          </span>
          <span>
            Max: {formatCurrency(transaction.amount, transaction.currency as any)}
          </span>
        </div>
        {isPartialRefund && (
          <p className="text-sm text-blue-600 mt-1">
            This is a partial refund. The remaining amount will stay with the tutor.
          </p>
        )}
      </div>

      {/* Refund Reason */}
      <div>
        <Label htmlFor="reason">Reason for Refund *</Label>
        <Select
          {...register('reason')}
          className={errors.reason ? 'border-red-500' : ''}
        >
          <option value="requested_by_customer">Requested by Customer</option>
          <option value="lesson_canceled">Lesson Canceled</option>
          <option value="duplicate">Duplicate Payment</option>
          <option value="fraudulent">Fraudulent Transaction</option>
          <option value="other">Other</option>
        </Select>
        {errors.reason && (
          <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Additional Details</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Please provide additional details about your refund request..."
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Providing detailed information helps us process your request faster.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 mb-1">Important Notice</p>
            <ul className="text-yellow-700 space-y-1">
              <li>• Refund requests are reviewed within 1-2 business days</li>
              <li>• Approved refunds typically take 5-10 business days to appear in your account</li>
              <li>• You will receive email updates about your refund status</li>
              <li>• Refunds are subject to our refund policy terms</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Refund Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

interface RefundRequestListProps {
  refundRequests: RefundRequest[];
  onViewTransaction: (transactionId: string) => void;
}

const RefundRequestList: React.FC<RefundRequestListProps> = ({
  refundRequests,
  onViewTransaction,
}) => {
  const getStatusBadge = (status: RefundRequest['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: X },
      processed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  if (!refundRequests.length) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">No refund requests</p>
        <p className="text-sm text-gray-400">
          Your refund requests will appear here when you submit them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {refundRequests.map((refund) => (
        <div
          key={refund.id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">
                  Refund Request #{refund.id.slice(-8)}
                </h4>
                {getStatusBadge(refund.status)}
              </div>
              <p className="text-sm text-gray-600">
                Amount: {formatCurrency(refund.amount, 'GBP')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewTransaction(refund.transactionId)}
            >
              View Transaction
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Reason:</span>
              <span className="ml-2 capitalize">
                {refund.reason.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Requested:</span>
              <span className="ml-2">{formatDate(refund.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-600">Requested by:</span>
              <span className="ml-2">{refund.requestedBy.name}</span>
            </div>
            {refund.processedAt && (
              <div>
                <span className="text-gray-600">Processed:</span>
                <span className="ml-2">{formatDate(refund.processedAt)}</span>
              </div>
            )}
          </div>

          {refund.description && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">{refund.description}</p>
            </div>
          )}

          {refund.reviewedBy && (
            <div className="mt-3 text-sm text-gray-600">
              Reviewed by {refund.reviewedBy.name} on{' '}
              {formatDate(refund.reviewedBy.reviewedAt)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface RefundRequestProps {
  className?: string;
  transactionId?: string; // If provided, opens form for this transaction
}

export const RefundRequestComponent: React.FC<RefundRequestProps> = ({
  className = '',
  transactionId,
}) => {
  const [showForm, setShowForm] = useState(!!transactionId);
  const [selectedTransactionId, setSelectedTransactionId] = useState(transactionId);

  const { data: refundRequests, isLoading, error } = useRefundRequests();
  const { data: selectedTransaction } = useTransaction(selectedTransactionId || '');
  const createRefundMutation = useCreateRefundRequest();

  const handleCreateRefund = async (data: CreateRefundRequest) => {
    try {
      await createRefundMutation.mutateAsync(data);
      setShowForm(false);
      setSelectedTransactionId(undefined);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleViewTransaction = (transactionId: string) => {
    // In a real app, this would navigate to transaction details
    console.log('View transaction:', transactionId);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load refund requests</p>
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
              <RefreshCw className="h-5 w-5" />
              Refund Requests
            </CardTitle>
            <Button
              onClick={() => setShowForm(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Request Refund
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-48 mb-2" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <RefundRequestList
              refundRequests={refundRequests || []}
              onViewTransaction={handleViewTransaction}
            />
          )}
        </CardContent>
      </Card>

      {/* Refund Request Form Modal */}
      {showForm && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowForm(false);
            setSelectedTransactionId(undefined);
          }}
          title="Request Refund"
          size="lg"
        >
          {selectedTransaction ? (
            <RefundRequestForm
              transaction={selectedTransaction}
              onSubmit={handleCreateRefund}
              onCancel={() => {
                setShowForm(false);
                setSelectedTransactionId(undefined);
              }}
              isSubmitting={createRefundMutation.isPending}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Please select a transaction to request a refund for.
              </p>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setSelectedTransactionId(undefined);
                }}
              >
                Close
              </Button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
};
