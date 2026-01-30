import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

// Mock data (same as dashboard)
const mockOrders = [
  { id: '1', order_number: 'ORD-001', order_stage: 'new', payment_status: 'unpaid', total_amount: 250, invoice_id: 'INV-001', patient_name: 'John Doe', order_date: '2026-01-10' },
  { id: '2', order_number: 'ORD-002', order_stage: 'new', payment_status: 'unpaid', total_amount: 180, invoice_id: 'INV-001', patient_name: 'Jane Smith', order_date: '2026-01-12' },
  { id: '3', order_number: 'ORD-003', order_stage: 'in_process', payment_status: 'unpaid', total_amount: 320, invoice_id: 'INV-002', patient_name: 'Bob Johnson', order_date: '2026-01-18' },
  { id: '4', order_number: 'ORD-004', order_stage: 'in_process', payment_status: 'paid', total_amount: 150, invoice_id: 'INV-002', patient_name: 'Alice Brown', order_date: '2026-01-19' },
  { id: '5', order_number: 'ORD-005', order_stage: 'shipped', payment_status: 'paid', total_amount: 400, invoice_id: 'INV-003', patient_name: 'Charlie Davis', order_date: '2026-01-22' },
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

export default function FacilityPayment() {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);

  useEffect(() => {
    // Check if we have an orderId in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    if (orderId) {
      setSelectedOrders([orderId]);
      setHighlightedOrderId(orderId);
      // Remove highlight after 2 seconds
      setTimeout(() => setHighlightedOrderId(null), 2000);
    }
  }, []);

  const toggleOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const totalSelected = mockOrders
    .filter(order => selectedOrders.includes(order.id))
    .reduce((sum, order) => sum + order.total_amount, 0);

  const handlePayment = () => {
    alert(`Processing payment of $${totalSelected.toFixed(2)} for ${selectedOrders.length} order(s)`);
    // Here you would process the payment
    setSelectedOrders([]);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Center</h1>
          <p className="text-gray-600 mt-1">Select orders to pay</p>
        </div>
        {selectedOrders.length > 0 && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-green-900">Total Selected</p>
              <p className="text-2xl font-bold text-green-900">${totalSelected.toFixed(2)}</p>
              <p className="text-xs text-green-700">{selectedOrders.length} order(s)</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Action Bar */}
      {selectedOrders.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-[#1a1f5c] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6">
            <div>
              <p className="text-sm opacity-80">Total to Pay</p>
              <p className="text-2xl font-bold">${totalSelected.toFixed(2)}</p>
            </div>
            <Button
              onClick={handlePayment}
              className="bg-white text-[#1a1f5c] hover:bg-gray-100 font-bold px-8 py-3 rounded-full"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Process Payment
            </Button>
          </div>
        </div>
      )}

      {/* Invoices with Orders */}
      <div className="space-y-6">
        {mockInvoices.map(invoice => {
          const invoiceOrders = mockOrders.filter(o => o.invoice_id === invoice.id);
          const unpaidOrders = invoiceOrders.filter(o => o.payment_status === 'unpaid');

          return (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {format(new Date(invoice.billing_period_start), 'MMM d')} - {format(new Date(invoice.billing_period_end), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${invoice.total_due.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Balance: ${(invoice.total_due - invoice.total_paid).toFixed(2)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {invoiceOrders.map(order => (
                    <div
                      key={order.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        highlightedOrderId === order.id
                          ? 'border-yellow-400 bg-yellow-50 animate-pulse'
                          : selectedOrders.includes(order.id)
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      } ${order.payment_status === 'paid' ? 'opacity-50' : 'cursor-pointer'}`}
                      onClick={() => order.payment_status !== 'paid' && toggleOrder(order.id)}
                    >
                      <div className="flex items-center gap-4">
                        {order.payment_status !== 'paid' && (
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => toggleOrder(order.id)}
                          />
                        )}
                        {order.payment_status === 'paid' && (
                          <div className="w-5 h-5 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{order.order_number}</p>
                            <Badge className={`text-xs ${getPaymentStatusBadge(order.payment_status)}`}>
                              {order.payment_status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Patient: {order.patient_name}</p>
                          <p className="text-xs text-gray-500">Order Date: {format(new Date(order.order_date), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}