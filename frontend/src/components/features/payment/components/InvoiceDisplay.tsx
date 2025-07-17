import React from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Download,
  Calendar,
  User,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Skeleton } from '../../../ui/Skeleton';
import { useInvoice, useDownloadInvoice } from '../../../../hooks/usePayment';
import { formatCurrency } from '../../../../utils/paymentValidation';
import type { Invoice } from '../../../../types/payment.types';

interface InvoiceDisplayProps {
  invoiceId: string;
  onClose?: () => void;
  className?: string;
}

interface InvoiceHeaderProps {
  invoice: Invoice;
  onDownload: () => void;
  onClose?: () => void;
  isDownloading: boolean;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoice,
  onDownload,
  onClose,
  isDownloading,
}) => {
  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Mail },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      canceled: { color: 'bg-gray-100 text-gray-800', icon: X },
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

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Invoice {invoice.invoiceNumber}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(invoice.status)}
            <span className="text-sm text-gray-500">
              {formatCurrency(invoice.amount, invoice.currency as any)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onDownload}
          disabled={isDownloading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Download PDF'}
        </Button>
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        )}
      </div>
    </div>
  );
};

interface InvoiceDetailsProps {
  invoice: Invoice;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoice }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Invoice Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Invoice Number:</span>
            <span className="text-sm font-medium">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Issue Date:</span>
            <span className="text-sm font-medium">{formatDate(invoice.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Due Date:</span>
            <span className="text-sm font-medium">{formatDate(invoice.dueDate)}</span>
          </div>
          {invoice.paidAt && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Paid Date:</span>
              <span className="text-sm font-medium">{formatDate(invoice.paidAt)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <span className="text-sm font-medium capitalize">{invoice.status}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      {invoice.paymentDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Transaction ID:</span>
              <span className="text-sm font-medium font-mono">
                {invoice.paymentDetails.transactionId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Method:</span>
              <span className="text-sm font-medium">{invoice.paymentDetails.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount Paid:</span>
              <span className="text-sm font-medium">
                {formatCurrency(invoice.paymentDetails.paidAmount, invoice.currency as any)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface ParticipantsInfoProps {
  invoice: Invoice;
}

const ParticipantsInfo: React.FC<ParticipantsInfoProps> = ({ invoice }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Tutor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Tutor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{invoice.tutorDetails.name}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {invoice.tutorDetails.email}
          </p>
        </CardContent>
      </Card>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Student
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{invoice.studentDetails.name}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {invoice.studentDetails.email}
          </p>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Billing Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm">{invoice.billingDetails.name}</p>
          <p className="text-sm">{invoice.billingDetails.address.line1}</p>
          {invoice.billingDetails.address.line2 && (
            <p className="text-sm">{invoice.billingDetails.address.line2}</p>
          )}
          <p className="text-sm">
            {invoice.billingDetails.address.city}
            {invoice.billingDetails.address.state && `, ${invoice.billingDetails.address.state}`}
          </p>
          <p className="text-sm">{invoice.billingDetails.address.postalCode}</p>
          <p className="text-sm">{invoice.billingDetails.address.country}</p>
        </CardContent>
      </Card>
    </div>
  );
};

interface LineItemsProps {
  invoice: Invoice;
}

const LineItems: React.FC<LineItemsProps> = ({ invoice }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700">
          Invoice Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm font-medium text-gray-700">Description</th>
                <th className="text-center py-2 text-sm font-medium text-gray-700">Quantity</th>
                <th className="text-right py-2 text-sm font-medium text-gray-700">Unit Price</th>
                <th className="text-right py-2 text-sm font-medium text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3">
                    <div>
                      <p className="text-sm font-medium">{item.description}</p>
                      {item.metadata?.lessonDate && (
                        <p className="text-xs text-gray-500">
                          Lesson Date: {format(new Date(item.metadata.lessonDate), 'MMM dd, yyyy')}
                        </p>
                      )}
                      {item.metadata?.lessonDuration && (
                        <p className="text-xs text-gray-500">
                          Duration: {item.metadata.lessonDuration} minutes
                        </p>
                      )}
                      {item.metadata?.subject && (
                        <p className="text-xs text-gray-500">
                          Subject: {item.metadata.subject}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-center text-sm">{item.quantity}</td>
                  <td className="py-3 text-right text-sm">
                    {formatCurrency(item.unitPrice, invoice.currency as any)}
                  </td>
                  <td className="py-3 text-right text-sm font-medium">
                    {formatCurrency(item.totalPrice, invoice.currency as any)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-3 text-right text-sm font-medium">
                  Total Amount:
                </td>
                <td className="py-3 text-right text-lg font-bold">
                  {formatCurrency(invoice.amount, invoice.currency as any)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export const InvoiceDisplay: React.FC<InvoiceDisplayProps> = ({
  invoiceId,
  onClose,
  className = '',
}) => {
  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const downloadInvoiceMutation = useDownloadInvoice();

  const handleDownload = () => {
    downloadInvoiceMutation.mutate(invoiceId);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">Failed to load invoice</p>
              {onClose && (
                <Button onClick={onClose} variant="outline" size="sm" className="mt-4">
                  Close
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <InvoiceHeader
        invoice={invoice}
        onDownload={handleDownload}
        onClose={onClose}
        isDownloading={downloadInvoiceMutation.isPending}
      />
      
      <InvoiceDetails invoice={invoice} />
      <ParticipantsInfo invoice={invoice} />
      <LineItems invoice={invoice} />
    </div>
  );
};
