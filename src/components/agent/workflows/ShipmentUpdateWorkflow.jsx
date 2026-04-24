import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Truck, ChevronLeft, Check, ExternalLink } from 'lucide-react';
import WorkflowProgressBar from './WorkflowProgressBar';

const STEPS = ['Review Order', 'Update Status', 'Notify Patient'];

export default function ShipmentUpdateWorkflow({ patient, selectedOrder, onBack, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderStatus, setOrderStatus] = useState(selectedOrder?.status || 'In Progress');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notificationMethod, setNotificationMethod] = useState('email');

  const handleNext = () => {
    if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
  };

  const handleSubmit = () => {
    onComplete?.({
      orderId: selectedOrder?.id,
      newStatus: orderStatus,
      notification: { method: notificationMethod, message: notifyMessage },
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <WorkflowProgressBar currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Review Order</h2>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Order #</p>
                  <p className="font-semibold text-gray-900">{selectedOrder?.receipt}</p>
                </div>
                <div>
                  <p className="text-gray-500">Medication</p>
                  <p className="font-semibold text-gray-900">{selectedOrder?.medication}</p>
                </div>
                <div>
                  <p className="text-gray-500">Order Date</p>
                  <p className="font-semibold text-gray-900">{selectedOrder?.date}</p>
                </div>
                <div>
                  <p className="text-gray-500">Current Status</p>
                  <Badge className="mt-1 text-xs">{selectedOrder?.status}</Badge>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1"><strong>Tracking:</strong></p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{selectedOrder?.tracking}</code>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">New Order Status</label>
                <select
                  value={orderStatus}
                  onChange={e => setOrderStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option>Processing</option>
                  <option>In Progress</option>
                  <option>In Transit</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                  <option>Exception</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Estimated Delivery</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs" defaultValue={selectedOrder?.est_delivery} />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Notify Patient</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Notification Method</label>
                <div className="flex gap-2">
                  {['email', 'sms', 'both'].map(method => (
                    <button
                      key={method}
                      onClick={() => setNotificationMethod(method)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        notificationMethod === method
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {method === 'email' ? '📧 Email' : method === 'sms' ? '💬 SMS' : '📧 Both'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Message to Patient</label>
                <Textarea
                  value={notifyMessage}
                  onChange={e => setNotifyMessage(e.target.value)}
                  placeholder="Pre-filled message will be sent to patient..."
                  className="text-xs h-20 resize-none"
                  defaultValue={`Your order #${selectedOrder?.receipt} is now ${orderStatus}. Tracking: ${selectedOrder?.tracking}`}
                />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                <p className="font-semibold mb-1">Preview:</p>
                <p>{notifyMessage || `Your order #${selectedOrder?.receipt} is now ${orderStatus}. Tracking: ${selectedOrder?.tracking}`}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-2 justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="text-xs flex items-center gap-1"
        >
          <ChevronLeft className="w-3 h-3" /> Back to Patient
        </Button>
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-xs"
            >
              Previous
            </Button>
          )}
          {currentStep < STEPS.length && (
            <Button
              size="sm"
              onClick={handleNext}
              className="text-xs bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          )}
          {currentStep === STEPS.length && (
            <Button
              size="sm"
              onClick={handleSubmit}
              className="text-xs bg-green-600 hover:bg-green-700"
            >
              <Check className="w-3 h-3 mr-1" /> Send Update
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}