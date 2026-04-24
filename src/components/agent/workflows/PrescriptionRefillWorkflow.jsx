import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Pill, ChevronLeft, Check } from 'lucide-react';
import WorkflowProgressBar from './WorkflowProgressBar';

const STEPS = ['Select Prescriptions', 'Verify Details', 'Confirm & Submit'];

export default function PrescriptionRefillWorkflow({ patient, selectedRx, onBack, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState(patient?.address || '');

  const prescriptions = selectedRx && selectedRx.length > 0
    ? patient.prescriptions.filter(rx => selectedRx.includes(rx.id))
    : [];

  const handleNext = () => {
    if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
  };

  const handleSubmit = () => {
    onComplete?.({
      prescriptions: prescriptions.map(rx => rx.id),
      notes,
      shippingAddress: address,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <WorkflowProgressBar currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Select Prescriptions</h2>
            <p className="text-xs text-gray-600 mb-3">{prescriptions.length} prescription(s) selected</p>
            <div className="space-y-2">
              {prescriptions.map(rx => (
                <div key={rx.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Pill className="w-4 h-4 text-blue-600" />
                    <p className="font-semibold text-gray-900">{rx.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <span>Rx #: <strong>{rx.rx_number}</strong></span>
                    <span>Dosage: <strong>{rx.dosage}</strong></span>
                    <span>Frequency: <strong>{rx.frequency}</strong></span>
                    <span>Refills: <strong>{rx.refills}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Verify Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Shipping Address</label>
                <Input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Patient Contact</label>
                <div className="text-xs text-gray-600">
                  <p><strong>Phone:</strong> {patient?.phone}</p>
                  <p><strong>Email:</strong> {patient?.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Delivery Window Preference</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500">
                  <option>Standard (5-7 business days)</option>
                  <option>Express (2-3 business days)</option>
                  <option>Overnight</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Confirm & Submit</h2>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-800 mb-2">Ready to Submit</p>
                <ul className="text-xs text-green-700 space-y-1">
                  <li className="flex items-center gap-2"><Check className="w-3 h-3" /> {prescriptions.length} prescription(s) selected</li>
                  <li className="flex items-center gap-2"><Check className="w-3 h-3" /> Address verified</li>
                  <li className="flex items-center gap-2"><Check className="w-3 h-3" /> Contact info confirmed</li>
                </ul>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Internal Notes (Optional)</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add any special instructions or notes..."
                  className="text-xs h-20 resize-none"
                />
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
              <Check className="w-3 h-3 mr-1" /> Submit Refill Request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}