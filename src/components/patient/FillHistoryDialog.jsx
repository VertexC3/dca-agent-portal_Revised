import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { History, Calendar, Package, CheckCircle, Receipt, Eye, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FillHistoryDialog({ open, onClose, prescription }) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showChangeNote, setShowChangeNote] = useState(null);

  if (!prescription) return null;

  // Dummy fill history data with receipt URLs and RX numbers
  const fillHistory = [
    { date: '2025-11-01', quantity: 30, dosage: '20 mg', prescriber: prescription.prescriber, rx_number: 'RX-2025-89432', status: 'Completed', receipt_url: 'https://images.unsplash.com/photo-1554224311-beee460c201a?w=400', hasChange: true, changeNote: "Reviewed patient's current therapy and instructed change in prescription as follows: increase dosage of lisinopril from 10 mg once daily to 20 mg once daily due to persistent elevated blood pressure; quantity updated to 30 tablets with 2 refills. Patient was informed of the change, counseled on potential side effects (including dizziness and cough), and advised to monitor blood pressure at home and report any adverse symptoms." },
    { date: '2025-10-01', quantity: 30, dosage: '10 mg', prescriber: prescription.prescriber, rx_number: 'RX-2025-76521', status: 'Completed', receipt_url: 'https://images.unsplash.com/photo-1554224311-beee460c201a?w=400' },
    { date: '2025-09-01', quantity: 30, dosage: '10 mg', prescriber: prescription.prescriber, rx_number: 'RX-2025-63410', status: 'Completed', receipt_url: 'https://images.unsplash.com/photo-1554224311-beee460c201a?w=400' },
    { date: '2025-08-01', quantity: 30, dosage: '10 mg', prescriber: prescription.prescriber, rx_number: 'RX-2025-51299', status: 'Completed' },
    { date: '2025-07-01', quantity: 30, dosage: '10 mg', prescriber: prescription.prescriber, rx_number: 'RX-2025-42188', status: 'Completed' }
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
            {fillHistory.map((fill, idx) => {
              const previousFill = fillHistory[idx + 1];
              const hasChanges = previousFill && (fill.dosage !== previousFill.dosage || fill.quantity !== previousFill.quantity);
              
              return (
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
                          {format(new Date(fill.date), 'MM/dd/yyyy')}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Package className="w-3 h-3" />
                          {fill.rx_number}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {fill.dosage && `Dosage: ${fill.dosage} • `}
                          Quantity: {fill.quantity} tablets
                        </p>
                        
                        {/* Show changes from previous fill */}
                        {hasChanges && (
                          <button
                            onClick={() => setShowChangeNote(idx)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" />
                            Changed from previous fill
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {fill.status}
                      </Badge>
                      {fill.receipt_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReceipt(fill)}
                          className="text-[#8B1F1F] hover:text-[#721919]"
                        >
                          <Receipt className="w-3 h-3 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Receipt Viewer Dialog */}
        {selectedReceipt && (
          <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
            <DialogContent className="max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#8B1F1F]" />
                  Receipt - {format(new Date(selectedReceipt.date), 'MM/dd/yyyy')}
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
                    <strong>RX Number:</strong> {selectedReceipt.rx_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Quantity:</strong> {selectedReceipt.quantity} tablets
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Change Note Dialog */}
        {showChangeNote !== null && fillHistory[showChangeNote]?.hasChange && (
          <Dialog open={showChangeNote !== null} onOpenChange={() => setShowChangeNote(null)}>
            <DialogContent className="max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Prescription Change Notes
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {fillHistory[showChangeNote].changeNote}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Fill Date:</strong> {format(new Date(fillHistory[showChangeNote].date), 'MM/dd/yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>RX Number:</strong> {fillHistory[showChangeNote].rx_number}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}