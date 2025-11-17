import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Star, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const cardTypeIcons = {
  'Visa': '💳',
  'Mastercard': '💳',
  'American Express': '💳',
  'Discover': '💳'
};

export default function PaymentManagement({ user }) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardData, setCardData] = useState({
    card_holder_name: '',
    card_number: '',
    card_last_four: '',
    card_type: 'Visa',
    expiry_month: '',
    expiry_year: '',
    billing_address: '',
    is_primary: false
  });

  const queryClient = useQueryClient();
  const paymentMethods = user?.payment_methods || [];

  const updatePaymentMutation = useMutation({
    mutationFn: (methods) => base44.auth.updateMe({ payment_methods: methods }),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setShowAddCard(false);
      setEditingCard(null);
      resetForm();
    }
  });

  const resetForm = () => {
    setCardData({
      card_holder_name: '',
      card_number: '',
      card_last_four: '',
      card_type: 'Visa',
      expiry_month: '',
      expiry_year: '',
      billing_address: '',
      is_primary: false
    });
  };

  const handleAddCard = () => {
    const newCard = {
      id: Date.now().toString(),
      card_holder_name: cardData.card_holder_name,
      card_last_four: cardData.card_number.slice(-4),
      card_type: cardData.card_type,
      expiry_month: cardData.expiry_month,
      expiry_year: cardData.expiry_year,
      billing_address: cardData.billing_address,
      is_primary: paymentMethods.length === 0 ? true : cardData.is_primary
    };

    let updatedMethods = [...paymentMethods];
    
    if (newCard.is_primary) {
      updatedMethods = updatedMethods.map(m => ({ ...m, is_primary: false }));
    }
    
    updatedMethods.push(newCard);
    updatePaymentMutation.mutate(updatedMethods);
  };

  const handleUpdateCard = () => {
    const updatedMethods = paymentMethods.map(m => 
      m.id === editingCard.id 
        ? {
            ...m,
            card_holder_name: cardData.card_holder_name,
            expiry_month: cardData.expiry_month,
            expiry_year: cardData.expiry_year,
            billing_address: cardData.billing_address,
            is_primary: cardData.is_primary
          }
        : cardData.is_primary ? { ...m, is_primary: false } : m
    );
    updatePaymentMutation.mutate(updatedMethods);
  };

  const handleRemoveCard = (cardId) => {
    const updatedMethods = paymentMethods.filter(m => m.id !== cardId);
    
    // If removed card was primary and there are other cards, make first one primary
    if (updatedMethods.length > 0) {
      const hadPrimary = updatedMethods.some(m => m.is_primary);
      if (!hadPrimary) {
        updatedMethods[0].is_primary = true;
      }
    }
    
    updatePaymentMutation.mutate(updatedMethods);
  };

  const handleSetPrimary = (cardId) => {
    const updatedMethods = paymentMethods.map(m => ({
      ...m,
      is_primary: m.id === cardId
    }));
    updatePaymentMutation.mutate(updatedMethods);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setCardData({
      card_holder_name: card.card_holder_name,
      card_number: `****${card.card_last_four}`,
      card_last_four: card.card_last_four,
      card_type: card.card_type,
      expiry_month: card.expiry_month,
      expiry_year: card.expiry_year,
      billing_address: card.billing_address,
      is_primary: card.is_primary
    });
    setShowAddCard(true);
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payment Methods</h2>
          <p className="text-gray-600 text-sm mt-1">Manage your saved payment methods</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingCard(null);
            setShowAddCard(true);
          }}
          className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Card
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 font-medium">No payment methods saved</p>
          <p className="text-sm text-gray-500 mt-1">Add a credit or debit card to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                method.is_primary
                  ? 'border-[#8B1F1F] bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {method.is_primary && (
                <div className="absolute -top-3 left-4 bg-[#8B1F1F] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  Primary
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center text-2xl">
                    {cardTypeIcons[method.card_type]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{method.card_type}</p>
                    <p className="text-sm text-gray-600">•••• {method.card_last_four}</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditCard(method)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCard(method.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>Cardholder:</strong> {method.card_holder_name}
                </p>
                <p className="text-gray-700">
                  <strong>Expires:</strong> {method.expiry_month}/{method.expiry_year}
                </p>
                {method.billing_address && (
                  <p className="text-gray-700">
                    <strong>Billing Address:</strong> {method.billing_address}
                  </p>
                )}
              </div>

              {!method.is_primary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetPrimary(method.id)}
                  className="w-full mt-4"
                >
                  <Star className="w-3 h-3 mr-2" />
                  Set as Primary
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Card Dialog */}
      <Dialog open={showAddCard} onOpenChange={(open) => {
        setShowAddCard(open);
        if (!open) {
          setEditingCard(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{editingCard ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
          </DialogHeader>
          
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

            {!editingCard && (
              <div>
                <Label>Card Number</Label>
                <Input
                  value={cardData.card_number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '');
                    if (/^\d*$/.test(value) && value.length <= 16) {
                      setCardData({ ...cardData, card_number: value });
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  value={formatCardNumber(cardData.card_number)}
                  maxLength={19}
                  className="mt-1"
                />
              </div>
            )}

            {!editingCard && (
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
            )}

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

            {paymentMethods.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="set-primary"
                  checked={cardData.is_primary}
                  onChange={(e) => setCardData({ ...cardData, is_primary: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="set-primary" className="text-sm text-gray-700 cursor-pointer">
                  Set as primary payment method
                </label>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddCard(false);
                  setEditingCard(null);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={editingCard ? handleUpdateCard : handleAddCard}
                disabled={
                  updatePaymentMutation.isPending ||
                  !cardData.card_holder_name ||
                  (!editingCard && cardData.card_number.length < 13) ||
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
                ) : editingCard ? (
                  'Update Card'
                ) : (
                  'Add Card'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}