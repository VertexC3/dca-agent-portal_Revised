import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, DollarSign, Info, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createPageUrl } from '../../utils';
import { useNavigate } from 'react-router-dom';

export default function NotificationPanel({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [showMissingInfoDialog, setShowMissingInfoDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [missingZip, setMissingZip] = useState('');

  const notifications = [
    {
      id: 1,
      type: 'outstanding_invoice',
      title: 'Outstanding Invoice',
      message: 'Invoice INV-2026-001 is outstanding',
      amount: 430.00,
      dueDate: '02/14/2026',
      severity: 'warning',
      action: () => navigate(createPageUrl('FacilityInvoices'))
    },
    {
      id: 2,
      type: 'missing_info',
      title: 'Missing Information',
      message: 'Order 1234 is missing zip code for patient Johnson, Robert',
      missingField: 'zip_code',
      missingFieldLabel: 'Zip Code',
      orderId: '1234',
      patientName: 'Johnson, Robert',
      severity: 'error',
      action: (notification) => {
        setSelectedNotification(notification);
        setShowMissingInfoDialog(true);
      }
    },
    {
      id: 3,
      type: 'payment_received',
      title: 'Payment Received',
      message: 'Payment of $150.00 received for Invoice INV-2026-002',
      severity: 'success',
      action: () => navigate(createPageUrl('FacilityInvoices'))
    },
    {
      id: 4,
      type: 'new_order',
      title: 'New Order Received',
      message: '2 new orders pending processing',
      severity: 'info',
      action: () => navigate(createPageUrl('FacilityDashboard'))
    }
  ];

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'success':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      default:
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <DollarSign className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notifications.length} items require attention</p>
            </div>

            <div className="p-4 space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${getSeverityStyles(notification.severity)}`}
                  onClick={() => notification.action(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSeverityIcon(notification.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1">{notification.title}</p>
                      <p className="text-sm text-gray-700">{notification.message}</p>
                      {notification.type === 'missing_info' && (
                        <p className="text-xs text-red-600 mt-2 font-semibold">
                          Missing: {notification.missingFieldLabel}
                        </p>
                      )}
                      {notification.amount && (
                        <p className="text-lg font-bold text-gray-900 mt-2">${notification.amount.toFixed(2)}</p>
                      )}
                      {notification.dueDate && (
                        <p className="text-xs text-gray-600 mt-1">Due: {notification.dueDate}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Missing Info Dialog */}
      {showMissingInfoDialog && (
        <Dialog open={showMissingInfoDialog} onOpenChange={setShowMissingInfoDialog}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Missing Information
              </DialogTitle>
            </DialogHeader>
            {selectedNotification && (
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Order:</strong> #{selectedNotification.orderId}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Patient:</strong> {selectedNotification.patientName}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Missing:</strong> {selectedNotification.missingFieldLabel}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Enter {selectedNotification.missingFieldLabel}
                  </label>
                  <Input
                    placeholder={selectedNotification.missingField === 'zip_code' ? '12345' : 'Enter value'}
                    value={missingZip}
                    onChange={(e) => setMissingZip(e.target.value)}
                    maxLength={selectedNotification.missingField === 'zip_code' ? 5 : undefined}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowMissingInfoDialog(false);
                setMissingZip('');
              }}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  alert(`${selectedNotification?.missingFieldLabel} saved: ${missingZip}`);
                  setShowMissingInfoDialog(false);
                  setMissingZip('');
                }}
                className="bg-[#1a1f5c]"
                disabled={!missingZip}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}