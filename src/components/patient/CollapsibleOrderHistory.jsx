import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Package, Calendar, ChevronDown, ChevronUp, Loader2, Receipt, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function CollapsibleOrderHistory({ limit = 5, showSeeAll = false }) {
  const [expandedOrders, setExpandedOrders] = useState({});
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      return await base44.entities.Order.list('-order_date', 100);
    }
  });

  const displayOrders = limit ? orders.slice(0, limit) : orders;

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

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
      {showSeeAll && orders.length > limit && (
        <div className="flex justify-end mb-4">
          <Link to={createPageUrl('PatientProfile') + '#orders'}>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              See All
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {displayOrders.map((order) => {
          const items = order.items ? JSON.parse(order.items) : [];
          const isExpanded = expandedOrders[order.id];

          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 hover:border-[#8B1F1F] transition-all">
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-800">Order #{order.order_number}</p>
                      <Badge className={statusColors[order.status]}>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(order.order_date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">
                      ${order.total_amount.toFixed(2)}
                    </p>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="text-gray-600">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.payment_method && (
                    <p className="text-sm text-gray-600">
                      <strong>Payment:</strong> {order.payment_method}
                    </p>
                  )}

                  {order.pharmacy_location && (
                    <p className="text-sm text-gray-600">
                      <strong>Location:</strong> {order.pharmacy_location}
                    </p>
                  )}

                  {order.receipt_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReceipt(order);
                      }}
                      className="w-full text-[#8B1F1F] hover:text-[#721919]"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      View Receipt
                    </Button>
                  )}
                </div>
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