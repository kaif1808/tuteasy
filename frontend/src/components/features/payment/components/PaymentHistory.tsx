import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  History,
  Filter,
  Download,
  Search,
  Calendar,
  CreditCard,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../../../ui/Card';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { Badge } from '../../../ui/Badge';
import { Skeleton } from '../../../ui/Skeleton';
import { Pagination } from '../../../ui/Pagination';
import { usePaymentHistory } from '../../../../hooks/usePayment';
import { formatCurrency } from '../../../../utils/paymentValidation';
import type { PaymentHistoryFilters, Transaction } from '../../../../types/payment.types';

interface PaymentHistoryProps {
  className?: string;
  showFilters?: boolean;
  pageSize?: number;
}

const STATUS_COLORS = {
  succeeded: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  canceled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-blue-100 text-blue-800',
  partially_refunded: 'bg-blue-100 text-blue-800',
};

const TYPE_COLORS = {
  payment: 'bg-green-100 text-green-800',
  refund: 'bg-blue-100 text-blue-800',
  dispute: 'bg-red-100 text-red-800',
};

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  className = '',
  showFilters = true,
  pageSize = 10,
}) => {
  const [filters, setFilters] = useState<PaymentHistoryFilters>({
    page: 1,
    limit: pageSize,
  });
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  const { data: paymentHistory, isLoading, error, refetch } = usePaymentHistory(filters);

  const handleFilterChange = (key: keyof PaymentHistoryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: pageSize,
    });
  };

  const toggleTransactionDetails = (transactionId: string) => {
    setExpandedTransaction(
      expandedTransaction === transactionId ? null : transactionId
    );
  };

  const getStatusBadge = (status: Transaction['status']) => (
    <Badge className={STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}>
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );

  const getTypeBadge = (type: Transaction['type']) => (
    <Badge className={TYPE_COLORS[type] || 'bg-gray-100 text-gray-800'}>
      {type.toUpperCase()}
    </Badge>
  );

  const formatTransactionDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">Failed to load payment history</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Payment History
          </CardTitle>
          <div className="flex items-center gap-2">
            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFiltersPanel ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && showFiltersPanel && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                  <option value="">All Statuses</option>
                  <option value="succeeded">Succeeded</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="canceled">Canceled</option>
                  <option value="refunded">Refunded</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Type
                </label>
                <Select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                >
                  <option value="">All Types</option>
                  <option value="payment">Payment</option>
                  <option value="refund">Refund</option>
                  <option value="dispute">Dispute</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Date From
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''}
                  onChange={(e) => 
                    handleFilterChange('dateFrom', e.target.value ? `${e.target.value}T00:00:00Z` : undefined)
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Date To
                </label>
                <Input
                  type="date"
                  value={filters.dateTo ? filters.dateTo.split('T')[0] : ''}
                  onChange={(e) => 
                    handleFilterChange('dateTo', e.target.value ? `${e.target.value}T23:59:59Z` : undefined)
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : !paymentHistory?.transactions.length ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No transactions found</p>
            <p className="text-sm text-gray-400">
              Your payment history will appear here once you make your first payment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Transaction List */}
            {paymentHistory.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {transaction.description}
                      </h4>
                      {getTypeBadge(transaction.type)}
                      {getStatusBadge(transaction.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatTransactionDate(transaction.createdAt)}
                      </span>
                      
                      {transaction.paymentMethod && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {transaction.paymentMethod.card?.brand} ****{transaction.paymentMethod.card?.last4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {transaction.type === 'refund' ? '-' : ''}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTransactionDetails(transaction.id)}
                      className="text-xs"
                    >
                      {expandedTransaction === transaction.id ? 'Less' : 'More'}
                      {expandedTransaction === transaction.id ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTransaction === transaction.id && (
                  <div className="mt-4 pt-4 border-t bg-gray-50 -mx-4 px-4 rounded-b-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Transaction ID:</strong> {transaction.id}</p>
                        <p><strong>Payment Intent:</strong> {transaction.paymentIntentId}</p>
                        {transaction.metadata.tutorName && (
                          <p><strong>Tutor:</strong> {transaction.metadata.tutorName}</p>
                        )}
                        {transaction.metadata.lessonDuration && (
                          <p><strong>Duration:</strong> {transaction.metadata.lessonDuration} minutes</p>
                        )}
                      </div>
                      <div>
                        <p><strong>Created:</strong> {formatTransactionDate(transaction.createdAt)}</p>
                        <p><strong>Updated:</strong> {formatTransactionDate(transaction.updatedAt)}</p>
                        {transaction.metadata.lessonDate && (
                          <p><strong>Lesson Date:</strong> {format(new Date(transaction.metadata.lessonDate), 'MMM dd, yyyy')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {paymentHistory.pagination.totalPages > 1 && (
              <div className="flex justify-center pt-4">
                <Pagination
                  currentPage={paymentHistory.pagination.page}
                  totalPages={paymentHistory.pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
