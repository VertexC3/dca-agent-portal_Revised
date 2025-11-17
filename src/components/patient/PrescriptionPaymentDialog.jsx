import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CreditCard, Edit2, Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function PrescriptionPaymentDialog({ open, onClose, prescription }) {
  const [showUpdateCard, setShowUpdateCard] = useState(false);
  const [cardData, setCardData] = useState({
    card_holder_name: '',
    card_number: '',
    card_type: 'Visa',
    expiry_month: '',
    expiry_year: '',
    billing_address: ''
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const updatePaymentMutation = useMutation({
    mutationFn: (methods) => base44.auth.updateMe({ payment_methods: methods }),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setShowUpdateCard(false);
      resetForm();
      alert('Payment method updated successfully!');
    }
  });

  const resetForm = () => {
    setCardData({
      card_holder_name: '',
      card_number: '',
      card_type: 'Visa',
      expiry_month: '',
      expiry_year: '',
      billing_address: ''
    });
  };

  const handleUpdateCard = () => {
    const paymentMethods = user?.payment_methods || [];
    
    // If updating existing payment method
    if (paymentMethods.length > 0) {
      const updatedMethods = paymentMethods.map((m, idx) => 
        idx === 0 ? {
          ...m,
          card_holder_name: cardData.card_holder_name,
          card_last_four: cardData.card_number.slice(-4),
          card_type: cardData.card_type,
          expiry_month: cardData.expiry_month,
          expiry_year: cardData.expiry_year,
          billing_address: cardData.billing_address
        } : m
      );
      updatePaymentMutation.mutate(updatedMethods);
    } else {
      // Adding first payment method
      const newCard = {
        id: Date.now().toString(),
        card_holder_name: cardData.card_holder_name,
        card_last_four: cardData.card_number.slice(-4),
        card_type: cardData.card_type,
        expiry_month: cardData.expiry_month,
        expiry_year: cardData.expiry_year,
        billing_address: cardData.billing_address,
        is_primary: true
      };
      updatePaymentMutation.mutate([newCard]);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  // Dummy payment info - for Metformin show last 4 as 4532, others show 1234
  const dummyCard = prescription?.name === 'Metformin 500mg' 
    ? { last_four: '4532', type: 'Visa', holder_name: 'John Doe' }
    : { last_four: '1234', type: 'Mastercard', holder_name: 'John Doe' };

  const actualPaymentMethod = user?.payment_methods?.[0];
  const displayCard = actualPaymentMethod || dummyCard;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#8B1F1F]" />
            Payment for {prescription?.name}
          </DialogTitle>
        </DialogHeader>

        {!showUpdateCard ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Current Payment Method</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpdateCard(true)}
                  className="text-[#8B1F1F] hover:text-[#721919]"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Update
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center text-2xl">
                  💳
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{displayCard.card_type || displayCard.type}</p>
                  <p className="text-sm text-gray-600">•••• {displayCard.card_last_four || displayCard.last_four}</p>
                  {displayCard.card_holder_name && (
                    <p className="text-xs text-gray-500">{displayCard.card_holder_name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>Prescription:</strong> {prescription?.name}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Amount:</strong> ${prescription?.name === 'Metformin 500mg' ? '25.00' : '15.00'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Payment will be processed when prescription is ready for pickup or shipment.
              </p>
            </div>

            <Button onClick={onClose} className="w-full bg-[#8B1F1F] hover:bg-[#721919] text-white">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Cardholder Name</Label>
              <Input
                value={cardData.card_holder_name}
                onChange={(e) => setCardData({ ...cardData, card_holder_name: e.target.value })}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Card Number</Label>
              <Input
                value={formatCardNumber(cardData.card_number)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '');
                  if (/^\d*$/.test(value) && value.length <= 16) {
                    setCardData({ ...cardData, card_number: value });
                  }
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Card Type</Label>
              <Select
                value={cardData.card_type}
                onValueChange={(value) => setCardData({ ...cardData, card_type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Visa">Visa</SelectItem>
                  <SelectItem value="Mastercard">Mastercard</SelectItem>
                  <SelectItem value="American Express">American Express</SelectItem>
                  <SelectItem value="Discover">Discover</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expiry Month</Label>
                <Select
                  value={cardData.expiry_month}
                  onValueChange={(value) => setCardData({ ...cardData, expiry_month: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, '0');
                      return <SelectItem key={month} value={month}>{month}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expiry Year</Label>
                <Select
                  value={cardData.expiry_year}
                  onValueChange={(value) => setCardData({ ...cardData, expiry_year: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = (new Date().getFullYear() + i).toString();
                      return <SelectItem key={year} value={year}>{year}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Billing Address</Label>
              <Textarea
                value={cardData.billing_address}
                onChange={(e) => setCardData({ ...cardData, billing_address: e.target.value })}
                placeholder="123 Main St, City, State, ZIP"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpdateCard(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCard}
                disabled={
                  updatePaymentMutation.isPending ||
                  !cardData.card_holder_name ||
                  cardData.card_number.length < 13 ||
                  !cardData.expiry_month ||
                  !cardData.expiry_year
                }
                className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
              >
                {updatePaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Update Card'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}