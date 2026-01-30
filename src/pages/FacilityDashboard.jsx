import React, { useState } from 'react';
import { Package, TrendingUp, Truck, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { createPageUrl } from '../utils';
import { useNavigate } from 'react-router-dom';

// Mock data
const mockOrders = [
  { id: '1', order_number: 'ORD-001', order_stage: 'new', payment_status: 'unpaid', total_amount: 250, invoice_id: 'INV-001' },
  { id: '2', order_number: 'ORD-002', order_stage: 'new', payment_status: 'unpaid', total_amount: 180, invoice_id: 'INV-001' },
  { id: '3', order_number: 'ORD-003', order_stage: 'in_process', payment_status: 'unpaid', total_amount: 320, invoice_id: 'INV-002' },
  { id: '4', order_number: 'ORD-004', order_stage: 'in_process', payment_status: 'paid', total_amount: 150, invoice_id: 'INV-002' },
  { id: '5', order_number: 'ORD-005', order_stage: 'shipped', payment_status: 'paid', total_amount: 400, invoice_id: 'INV-003' },
];

const mockInvoices = [
  {
    id: 'INV-001',
    invoice_number: 'INV-2026-001',
    invoice_date: '2026-01-15',
    billing_period_start: '2026-01-01',
    billing_period_end: '2026-01-15',
    payment_terms: 'Net 30 days',
    bill_to_name: 'DCA Pharmacy',
    bill_from_name: 'Mochi Health Corp.',
    subtotal: 430,
    total_due: 430,
    total_paid: 0,
    status: 'open'
  },
  {
    id: 'INV-002',
    invoice_number: 'INV-2026-002',
    invoice_date: '2026-01-20',
    billing_period_start: '2026-01-16',
    billing_period_end: '2026-01-20',
    payment_terms: 'Net 30 days',
    bill_to_name: 'DCA Pharmacy',
    bill_from_name: 'Mochi Health Corp.',
    subtotal: 470,
    total_due: 470,
    total_paid: 150,
    status: 'partially_paid'
  },
  {
    id: 'INV-003',
    invoice_number: 'INV-2026-003',
    invoice_date: '2026-01-25',
    billing_period_start: '2026-01-21',
    billing_period_end: '2026-01-25',
    payment_terms: 'Net 30 days',
    bill_to_name: 'DCA Pharmacy',
    bill_from_name: 'Mochi Health Corp.',
    subtotal: 400,
    total_due: 400,
    total_paid: 400,
    status: 'paid'
  }
];

export default function FacilityDashboard() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const navigate = useNavigate();

  const newOrders = mockOrders.filter(o => o.order_stage === 'new');
  const inProcessOrders = mockOrders.filter(o => o.order_stage === 'in_process');
  const shippedOrders = mockOrders.filter(o => o.order_stage === 'shipped');

  const handlePayNow = (orderId) => {
    navigate(createPageUrl('FacilityPayment') + `?orderId=${orderId}`);
  };

  const getStatusBadge = (status) => {
    const colors = {
      'open': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'partially_paid': 'bg-blue-100 text-blue-800 border-blue-200',
      'paid': 'bg-green-100 text-green-800 border-green-200',
      'overdue': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      'paid': 'bg-green-100 text-green-800 border-green-200',
      'unpaid': 'bg-red-100 text-red-800 border-red-200',
      'partially_paid': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facility Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of orders and invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">New Orders</CardTitle>
            <Package className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{newOrders.length}</div>
            <p className="text-xs text-blue-700 mt-1">
              ${newOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">In Process</CardTitle>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{inProcessOrders.length}</div>
            <p className="text-xs text-orange-700 mt-1">
              ${inProcessOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Shipped</CardTitle>
            <Truck className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{shippedOrders.length}</div>
            <p className="text-xs text-green-700 mt-1">
              ${shippedOrders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Invoices
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockInvoices.map(invoice => (
              <div
                key={invoice.id}
                onClick={() => setSelectedInvoice(invoice)}
                className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-600">
                      Period: {format(new Date(invoice.billing_period_start), 'MMM d')} - {format(new Date(invoice.billing_period_end), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {invoice.payment_terms} | {invoice.bill_from_name} → {invoice.bill_to_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${invoice.total_due.toFixed(2)}</p>
                    <Badge className={`mt-1 ${getStatusBadge(invoice.status)}`}>
                      {invoice.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Invoice Date</p>
                  <p className="text-sm text-gray-900">{format(new Date(selectedInvoice.invoice_date), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Payment Terms</p>
                  <p className="text-sm text-gray-900">{selectedInvoice.payment_terms}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Bill From</p>
                  <p className="text-sm text-gray-900">{selectedInvoice.bill_from_name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Bill To</p>
                  <p className="text-sm text-gray-900">{selectedInvoice.bill_to_name}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Orders in this Invoice</h3>
                <div className="space-y-2">
                  {mockOrders
                    .filter(order => order.invoice_id === selectedInvoice.id)
                    .map(order => (
                      <div key={order.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{order.order_number}</p>
                            <p className="text-sm text-gray-600">Stage: {order.order_stage.replace('_', ' ')}</p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-lg font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                              <Badge className={`text-xs ${getPaymentStatusBadge(order.payment_status)}`}>
                                {order.payment_status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            {order.payment_status === 'unpaid' && (
                              <button
                                onClick={() => handlePayNow(order.id)}
                                className="px-3 py-1 bg-[#1a1f5c] hover:bg-[#151a4d] text-white text-sm font-semibold rounded-lg transition-all"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Due:</span>
                  <span>${selectedInvoice.total_due.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Total Paid:</span>
                  <span>${selectedInvoice.total_paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600 mt-2">
                  <span>Balance Due:</span>
                  <span>${(selectedInvoice.total_due - selectedInvoice.total_paid).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}