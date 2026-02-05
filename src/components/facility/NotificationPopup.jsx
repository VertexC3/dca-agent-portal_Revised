import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function NotificationPopup({ open, onClose, notification }) {
  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Order Issue: Missing Information
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="font-semibold text-orange-800">Information missing for Order {notification.orderId}</p>
            <p className="text-sm text-orange-700 mt-1">Required field is missing to process this order.</p>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Order Details</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Order Number</p>
                <p className="text-gray-600">{notification.orderId}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Patient Name</p>
                <p className="text-gray-600">{notification.patientName}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Medication</p>
                <p className="text-gray-600">{notification.medication}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Order Date</p>
                <p className="text-gray-600">{notification.orderDate}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Shipping Address</p>
                <p className="text-gray-600">{notification.address}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Zip Code</p>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    Missing
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <strong>Action Required:</strong> Please update the zip code to proceed with shipping this order.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}