import React, { useState } from 'react';
import { X, Truck, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CheckoutFlow({ open, onClose, selectedItems, patient }) {
  const [step, setStep] = useState(1); // 1: Shipping/Pickup, 2: Payment, 3: Confirmation
  const [shippingMethod, setShippingMethod] = useState(null);
  const [cardData, setCardData] = useState({ name: '', number: '', expiry: '', cvc: '' });

  const handleShippingSelect = (method) => {
    setShippingMethod(method);
    setStep(2);
  };

  const handlePaymentSubmit = () => {
    if (cardData.name && cardData.number && cardData.expiry && cardData.cvc) {
      setStep(3);
    }
  };

  const handleClose = () => {
    setStep(1);
    setShippingMethod(null);
    setCardData({ name: '', number: '', expiry: '', cvc: '' });
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              {step === 1 && 'Delivery Method'}
              {step === 2 && 'Payment Information'}
              {step === 3 && 'Order Confirmed'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {step === 1 && 'Step 1 of 3'}
              {step === 2 && 'Step 2 of 3'}
              {step === 3 && 'Complete'}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Step 1: Shipping/Pickup */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 mb-4">How would you like to receive your order?</p>
              <button
                onClick={() => handleShippingSelect('ship')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Ship to Address</p>
                    <p className="text-xs text-gray-500 mt-0.5">{patient?.address || '123 Main St, Anytown, CA 90001'}</p>
                    <p className="text-xs text-green-700 font-semibold mt-1">Free Shipping</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleShippingSelect('pickup')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Pickup at Pharmacy</p>
                    <p className="text-xs text-gray-500 mt-0.5">Downtown DCA Pharmacy • 2.3 miles away</p>
                    <p className="text-xs text-green-700 font-semibold mt-1">Ready in 24 hours</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Cardholder Name</label>
                <Input
                  placeholder="John Doe"
                  value={cardData.name}
                  onChange={e => setCardData({ ...cardData, name: e.target.value })}
                  className="text-xs h-9"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Card Number</label>
                <Input
                  placeholder="4242 4242 4242 4242"
                  value={cardData.number}
                  onChange={e => setCardData({ ...cardData, number: e.target.value })}
                  className="text-xs h-9 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Expiry</label>
                  <Input
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">CVC</label>
                  <Input
                    placeholder="123"
                    value={cardData.cvc}
                    onChange={e => setCardData({ ...cardData, cvc: e.target.value })}
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <p className="text-xs font-semibold text-blue-900">Order Summary</p>
                <p className="text-xs text-blue-700 mt-1">{selectedItems?.length || 0} item{selectedItems?.length !== 1 ? 's' : ''}</p>
                <p className="text-sm font-bold text-blue-900 mt-2">Total: $125.99</p>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Order Confirmed!</h3>
              <p className="text-xs text-gray-600 mb-4">
                {shippingMethod === 'ship'
                  ? 'Your order will be shipped to your address and delivered in 2-3 business days.'
                  : 'Your order is ready for pickup at Downtown DCA Pharmacy in 24 hours.'}
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-left">
                <p className="text-xs font-semibold text-gray-700 mb-2">Delivery Method</p>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  {shippingMethod === 'ship' ? (
                    <>
                      <Truck className="w-3.5 h-3.5" /> Ship to {patient?.address || 'your address'}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5" /> Pickup at Downtown DCA Pharmacy
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
          {step < 3 && (
            <>
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs"
                onClick={() => step === 2 ? setStep(1) : handleClose()}
              >
                {step === 2 ? 'Back' : 'Cancel'}
              </Button>
              <Button
                className="flex-1 h-9 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={() => step === 1 ? null : handlePaymentSubmit()}
                disabled={step === 2 && (!cardData.name || !cardData.number || !cardData.expiry || !cardData.cvc)}
              >
                {step === 1 ? 'Continue' : 'Complete Order'}
              </Button>
            </>
          )}
          {step === 3 && (
            <Button
              className="w-full h-9 text-xs bg-green-600 hover:bg-green-700"
              onClick={handleClose}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}