import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, User, Pill, DollarSign, FileText, Truck } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetailDialog({ order, open, onClose }) {
  if (!order) return null;

  const getPaymentStatusBadge = (status) => {
    const colors = {
      'paid': 'bg-green-100 text-green-800 border-green-200',
      'unpaid': 'bg-red-100 text-red-800 border-red-200',
      'partially_paid': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStageBadge = (stage) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800 border-blue-200',
      'in_process': 'bg-orange-100 text-orange-800 border-orange-200',
      'shipped': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Calculate pricing details
  const unitPrice = order.unit_price || (order.total_amount / (order.quantity_dispensed || 1));
  const extendedAmount = order.extended_line_amount || (order.quantity_dispensed * unitPrice);
  const discounts = order.discounts_rebates || 0;
  const subtotal = extendedAmount - discounts;
  const taxes = order.taxes || 0;
  const shipping = order.shipping_handling || 0;
  const totalDue = subtotal + taxes + shipping;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-6 h-6 text-[#1a1f5c]" />
            Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Identifiers */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-[#1a1f5c]" />
              <h3 className="text-lg font-bold text-gray-900">Order Identifiers</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Mochi Order ID</p>
                <p className="text-base text-gray-900 font-mono">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">DCA Pharmacy Rx#</p>
                <p className="text-base text-gray-900 font-mono">RX-{order.order_number?.replace('ORD-', '')}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Order Date</p>
                <p className="text-base text-gray-900">{format(new Date(order.order_date), 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Status</p>
                <div className="flex gap-2 mt-1">
                  <Badge className={getStageBadge(order.order_stage)}>
                    {order.order_stage?.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getPaymentStatusBadge(order.payment_status)}>
                    {order.payment_status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Identifier (De-identified) */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-[#1a1f5c]" />
              <h3 className="text-lg font-bold text-gray-900">Patient Information (De-identified)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Patient Initials</p>
                <p className="text-base text-gray-900">{order.patient_initials || order.patient_name?.split(' ').map(n => n[0]).join('.')}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Patient Code</p>
                <p className="text-base text-gray-900 font-mono">{order.patient_code || `PT-${order.id?.padStart(6, '0')}`}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3 italic">
              * Patient identity information is de-identified per HIPAA and BAA requirements
            </p>
          </div>

          {/* Medication Details */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-5 h-5 text-[#1a1f5c]" />
              <h3 className="text-lg font-bold text-gray-900">Medication Details</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Drug Name</p>
                <p className="text-base text-gray-900">{order.medication_name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Strength & Form</p>
                <p className="text-base text-gray-900">{order.medication_strength || '2.5mg per mL, Multi-dose Vial'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Quantity Dispensed</p>
                <p className="text-base text-gray-900">{order.quantity_dispensed || 1} {order.quantity_dispensed === 1 ? 'Unit' : 'Units'}</p>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-[#1a1f5c]" />
              <h3 className="text-lg font-bold text-gray-900">Pricing Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm text-gray-700">Unit Price (per vial/pen)</p>
                <p className="text-base font-semibold text-gray-900">${unitPrice.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-700">Quantity</p>
                <p className="text-base font-semibold text-gray-900">× {order.quantity_dispensed || 1}</p>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2">
                <p className="text-sm text-gray-700">Extended Line Amount</p>
                <p className="text-base font-semibold text-gray-900">${extendedAmount.toFixed(2)}</p>
              </div>
              {discounts > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm text-green-700">Discounts/Rebates Applied</p>
                  <p className="text-base font-semibold text-green-700">-${discounts.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Totals */}
          <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Invoice Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-gray-700">Subtotal</p>
                <p className="text-base font-semibold text-gray-900">${subtotal.toFixed(2)}</p>
              </div>
              {taxes > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700">Taxes</p>
                  <p className="text-base font-semibold text-gray-900">${taxes.toFixed(2)}</p>
                </div>
              )}
              {shipping > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700">Shipping/Handling</p>
                  <p className="text-base font-semibold text-gray-900">${shipping.toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-gray-400 pt-2 mt-2">
                <p className="text-lg font-bold text-gray-900">Total Due</p>
                <p className="text-xl font-bold text-[#1a1f5c]">${totalDue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Shipping Information (if shipped) */}
          {order.order_stage === 'shipped' && order.tracking_number && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-green-900">FedEx Shipment Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Tracking Number</p>
                  <a 
                    href={`https://www.fedex.com/fedextrack/?trknbr=${order.tracking_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-blue-600 hover:underline font-mono"
                  >
                    {order.tracking_number}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Shipped Date</p>
                  <p className="text-base text-gray-900">{format(new Date(order.shipped_date), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Estimated Delivery</p>
                  <p className="text-base text-gray-900">{format(new Date(order.estimated_delivery), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}