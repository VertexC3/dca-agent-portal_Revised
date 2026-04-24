import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ChevronLeft, Check, Lock } from 'lucide-react';
import WorkflowProgressBar from '../workflows/WorkflowProgressBar';

const STEPS = ['Select Payment Method', 'Enter Card Details', 'Confirm Payment'];

export default function PaymentWorkflow({ patient, cartTotal, onBack, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('new');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const handleNext = () => {
    if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
  };

  const handleSubmit = () => {
    onComplete?.({
      method: paymentMethod,
      card: { name: cardName, number: cardNumber, expiry: cardExpiry, cvc: cardCvc },
      amount: cartTotal,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <WorkflowProgressBar currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Select Payment Method</h2>
            <div className="space-y-3">
              {patient?.cards?.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-gray-700">Saved Cards</p>
                  {patient.cards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => setPaymentMethod(`saved_${card.id}`)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        paymentMethod === `saved_${card.id}`
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <p className="font-semibold text-sm text-gray-900">{card.brand} •••• {card.last4}</p>
                        {card.is_default && <Badge className="text-xs bg-blue-100 text-blue-800">Default</Badge>}
                      </div>
                      <p className="text-xs text-gray-500">Expires {card.expiry}</p>
                    </button>
                  ))}
                </>
              )}
              <button
                onClick={() => setPaymentMethod('new')}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  paymentMethod === 'new'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <p className="font-semibold text-sm text-gray-900">Add New Card</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && paymentMethod === 'new' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Enter Card Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cardholder Name</label>
                <Input
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="Full name on card"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Card Number</label>
                <Input
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  className="text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry (MM/YY)</label>
                  <Input
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    placeholder="12/26"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">CVC</label>
                  <Input
                    value={cardCvc}
                    onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    type="password"
                    className="text-xs"
                  />
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-700">
                <Lock className="w-3.5 h-3.5" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && paymentMethod !== 'new' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Confirm Saved Card</h2>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">Using saved payment method for this transaction.</p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Confirm Payment</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <p className="text-xs text-gray-600">Patient: <strong>{patient?.name}</strong></p>
                <p className="text-xs text-gray-600">Email: <strong>{patient?.email}</strong></p>
                <div className="pt-2 border-t border-gray-300 mt-2">
                  <p className="text-xs text-gray-600">Total Amount:</p>
                  <p className="text-2xl font-bold text-[#8B1F1F] mt-1">${cartTotal?.toFixed(2)}</p>
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-green-700">
                    <p className="font-semibold">Ready to Process</p>
                    <p className="mt-1">Click "Complete Payment" to finalize this transaction. A confirmation will be sent to the patient.</p>
                  </div>
                </div>
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
              <Check className="w-3 h-3 mr-1" /> Complete Payment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}