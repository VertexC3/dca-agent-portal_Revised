import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, AlertTriangle, Pill, Receipt, Building2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function InvoicePaymentModal({ invoice, patient, onClose, onPaid }) {
  const [step, setStep] = useState('review'); // 'review' | 'payment' | 'success'
  const [useExisting, setUseExisting] = useState(patient.cards.length > 0);
  const [selectedCard, setSelectedCard] = useState(patient.cards[0]?.id || null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  const validate = () => {
    if (useExisting) return true;
    const e = {};
    if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter a valid 16-digit card number';
    if (!cardName.trim()) e.cardName = 'Cardholder name required';
    if (expiry.length < 5) e.expiry = 'Enter valid expiry (MM/YY)';
    if (cvv.length < 3) e.cvv = 'Enter valid CVV';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCharge = () => {
    if (!validate()) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep('success');
      onPaid && onPaid(invoice.id);
    }, 1800);
  };

  const outstanding = invoice.amount - invoice.paid;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B1F1F] to-[#a52525] px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-white/80" />
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wide">Invoice</p>
              <h2 className="text-white font-bold text-sm">{invoice.number}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`text-xs font-bold ${invoice.status === 'open' ? 'bg-red-200 text-red-900' : 'bg-yellow-100 text-yellow-900'}`}>
              {invoice.status === 'open' ? 'Unpaid' : 'Partially Paid'}
            </Badge>
            <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {step === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Successful</h3>
            <p className="text-sm text-gray-500 mb-2">
              ${outstanding.toFixed(2)} charged to {useExisting && selectedCard
                ? `${patient.cards.find(c => c.id === selectedCard)?.brand} ••••${patient.cards.find(c => c.id === selectedCard)?.last4}`
                : `card ending ••••${cardNumber.replace(/\s/g, '').slice(-4)}`
              }
            </p>
            <p className="text-xs text-gray-400">Receipt sent to {patient.email}</p>
            <Button className="mt-6 bg-[#8B1F1F] hover:bg-[#721919]" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">

            {/* Receipt / Invoice Detail */}
            <div className="px-5 py-4 border-b border-gray-100">
              {/* Billed To / From */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                <div>
                  <p className="text-gray-500 font-semibold uppercase mb-1">Billed To</p>
                  <p className="font-bold text-gray-900">{patient.name}</p>
                  <p className="text-gray-600">{patient.email}</p>
                  <p className="text-gray-600">{patient.phone}</p>
                  <p className="text-gray-600">{patient.address}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold uppercase mb-1">From</p>
                  <p className="font-bold text-gray-900">DCA Pharmacy</p>
                  <p className="text-gray-600">billing@dcapharmacy.com</p>
                  <p className="text-gray-600">(615) 555-0000</p>
                  <p className="text-gray-600">Invoice Date: {format(new Date(invoice.date), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
                <div className="grid grid-cols-12 gap-2 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-200">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-center">Rx #</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-3 text-right">Amount</div>
                </div>
                {invoice.line_items?.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2.5 text-xs border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <div className="col-span-5">
                      <p className="font-semibold text-gray-900 flex items-center gap-1">
                        <Pill className="w-3 h-3 text-[#8B1F1F] flex-shrink-0" />{item.name}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.dosage} · {item.frequency}</p>
                    </div>
                    <div className="col-span-2 text-center text-gray-700 font-mono">{item.rx_number}</div>
                    <div className="col-span-2 text-center text-gray-700">{item.qty}</div>
                    <div className="col-span-3 text-right font-semibold text-gray-900">${item.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${invoice.amount.toFixed(2)}</span>
                </div>
                {invoice.paid > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Previously Paid</span>
                    <span>−${invoice.paid.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-gray-900 border-t border-gray-200 pt-2 mt-2">
                  <span>Balance Due</span>
                  <span className="text-[#8B1F1F]">${outstanding.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            {step === 'payment' ? (
              <div className="px-5 py-4 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Payment Information</p>
                </div>

                {/* Use existing card toggle */}
                {patient.cards.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUseExisting(true)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${useExisting ? 'border-[#8B1F1F] bg-red-50 text-[#8B1F1F]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        Use Card on File
                      </button>
                      <button
                        onClick={() => setUseExisting(false)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${!useExisting ? 'border-[#8B1F1F] bg-red-50 text-[#8B1F1F]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        New Card
                      </button>
                    </div>
                    {useExisting && (
                      <div className="space-y-1.5">
                        {patient.cards.map(card => (
                          <button
                            key={card.id}
                            onClick={() => setSelectedCard(card.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${selectedCard === card.id ? 'border-[#8B1F1F] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <div className="flex items-center gap-2">
                              <CreditCard className={`w-4 h-4 ${selectedCard === card.id ? 'text-[#8B1F1F]' : 'text-gray-500'}`} />
                              <span className="font-semibold text-gray-900">{card.brand} •••• {card.last4}</span>
                              <span className="text-gray-500">Exp {card.expiry}</span>
                            </div>
                            {card.is_default && <Badge className="bg-blue-100 text-blue-800 text-xs">Default</Badge>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* New card form */}
                {!useExisting && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">Card Number</label>
                      <Input
                        className={`text-xs font-mono ${errors.cardNumber ? 'border-red-400' : ''}`}
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                      />
                      {errors.cardNumber && <p className="text-xs text-red-500 mt-0.5">{errors.cardNumber}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">Cardholder Name</label>
                      <Input
                        className={`text-xs ${errors.cardName ? 'border-red-400' : ''}`}
                        placeholder="Full name on card"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                      />
                      {errors.cardName && <p className="text-xs text-red-500 mt-0.5">{errors.cardName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">Expiry (MM/YY)</label>
                        <Input
                          className={`text-xs font-mono ${errors.expiry ? 'border-red-400' : ''}`}
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={e => setExpiry(formatExpiry(e.target.value))}
                          maxLength={5}
                        />
                        {errors.expiry && <p className="text-xs text-red-500 mt-0.5">{errors.expiry}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">CVV</label>
                        <Input
                          className={`text-xs font-mono ${errors.cvv ? 'border-red-400' : ''}`}
                          placeholder="•••"
                          value={cvv}
                          onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          type="password"
                        />
                        {errors.cvv && <p className="text-xs text-red-500 mt-0.5">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                  <Lock className="w-3 h-3" />
                  <span>Payment info is encrypted and processed securely</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 text-xs h-9" onClick={() => setStep('review')}>Back</Button>
                  <Button
                    className="flex-1 text-xs h-9 bg-green-600 hover:bg-green-700"
                    onClick={handleCharge}
                    disabled={processing}
                  >
                    {processing ? (
                      <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing...</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />Charge ${outstanding.toFixed(2)}</span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4">
                <Button
                  className="w-full h-10 bg-[#8B1F1F] hover:bg-[#721919] text-sm font-semibold"
                  onClick={() => setStep('payment')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Collect Payment — ${outstanding.toFixed(2)}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}