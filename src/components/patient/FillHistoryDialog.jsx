import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { History, Calendar, Package, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function FillHistoryDialog({ open, onClose, prescription }) {
  if (!prescription) return null;

  // Dummy fill history data
  const fillHistory = [
    { date: '2025-11-01', quantity: 30, prescriber: prescription.prescriber, pharmacy: 'DCA Pharmacy - Main', status: 'Completed' },
    { date: '2025-10-01', quantity: 30, prescriber: prescription.prescriber, pharmacy: 'DCA Pharmacy - Main', status: 'Completed' },
    { date: '2025-09-01', quantity: 30, prescriber: prescription.prescriber, pharmacy: 'DCA Pharmacy - Main', status: 'Completed' },
    { date: '2025-08-01', quantity: 30, prescriber: prescription.prescriber, pharmacy: 'DCA Pharmacy - Main', status: 'Completed' },
    { date: '2025-07-01', quantity: 30, prescriber: prescription.prescriber, pharmacy: 'DCA Pharmacy - Main', status: 'Completed' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#8B1F1F]" />
            Fill History: {prescription.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Total Fills:</strong> {fillHistory.length}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Prescriber:</strong> {prescription.prescriber}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Current Refills Remaining:</strong> {prescription.refills}
            </p>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {fillHistory.map((fill, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-[#8B1F1F] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Fill #{fillHistory.length - idx}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(fill.date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Package className="w-3 h-3" />
                        {fill.pharmacy}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Quantity: {fill.quantity} tablets</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {fill.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}