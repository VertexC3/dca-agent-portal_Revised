import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Package, Calendar, DollarSign, Receipt, Loader2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function OrderHistory({ patientEmail }) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', patientEmail],
    queryFn: async () => {
      const allOrders = await base44.entities.Order.list('-order_date', 100);
      return allOrders.filter(o => o.patient_email === patientEmail);
    },
    enabled: !!patientEmail
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No order history yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => {
          const items = order.items ? JSON.parse(order.items) : [];
          return (
            <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#8B1F1F] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">Order #{order.order_number}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(order.order_date), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <Badge className={statusColors[order.status]}>{order.status}</Badge>
              </div>

              <div className="space-y-2 mb-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-600">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-gray-200">
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-gray-800">
                    ${order.total_amount.toFixed(2)}
                  </p>
                  {order.payment_method && (
                    <p className="text-sm text-gray-600">{order.payment_method}</p>
                  )}
                </div>
                {order.receipt_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReceipt(order)}
                    className="text-[#8B1F1F] hover:text-[#721919]"
                  >
                    <Receipt className="w-4 h-4 mr-1" />
                    View Receipt
                  </Button>
                )}
              </div>

              {order.pharmacy_location && (
                <p className="text-xs text-gray-500 mt-2">Location: {order.pharmacy_location}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Receipt Dialog */}
      {selectedReceipt && (
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#8B1F1F]" />
                Receipt - Order #{selectedReceipt.order_number}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={selectedReceipt.receipt_url}
                alt="Receipt"
                className="w-1/2 mx-auto rounded-lg border border-gray-200"
              />
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {format(new Date(selectedReceipt.order_date), 'MMM d, yyyy h:mm a')}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total:</strong> ${selectedReceipt.total_amount.toFixed(2)}
                </p>
                {selectedReceipt.payment_method && (
                  <p className="text-sm text-gray-600">
                    <strong>Payment Method:</strong> {selectedReceipt.payment_method}
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}