import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle, Pill, CreditCard, Plus, Trash2, MapPin, Star, DollarSign } from 'lucide-react';

export default function RefillRequestDialog({ open, onClose, prescription }) {
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: 'Home', address: '', is_primary: false });
  const [payAtPharmacy, setPayAtPharmacy] = useState(false);
  const queryClient = useQueryClient();

  // Calculate estimated cost (base $15 for medications, plus $5 for delivery)
  const estimatedCost = deliveryMethod === 'pickup' ? 15.00 : 20.00;

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const userAddresses = user?.addresses || [];

  React.useEffect(() => {
    if (userAddresses.length > 0 && !selectedAddress) {
      const primary = userAddresses.find(a => a.is_primary);
      setSelectedAddress(primary ? primary.address : userAddresses[0].address);
    }
  }, [userAddresses, selectedAddress]);

  const addAddressMutation = useMutation({
    mutationFn: async (address) => {
      const updatedAddresses = [...userAddresses, address];
      if (address.is_primary) {
        updatedAddresses.forEach((addr, idx) => {
          if (idx < updatedAddresses.length - 1) addr.is_primary = false;
        });
      }
      await base44.auth.updateMe({ addresses: updatedAddresses });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setShowAddAddress(false);
      setNewAddress({ name: 'Home', address: '', is_primary: false });
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressToDelete) => {
      const updatedAddresses = userAddresses.filter(a => a.address !== addressToDelete);
      await base44.auth.updateMe({ addresses: updatedAddresses });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      if (selectedAddress && !userAddresses.find(a => a.address === selectedAddress)) {
        setSelectedAddress('');
      }
    }
  });

  const setPrimaryAddressMutation = useMutation({
    mutationFn: async (addressToPrimary) => {
      const updatedAddresses = userAddresses.map(addr => ({
        ...addr,
        is_primary: addr.address === addressToPrimary
      }));
      await base44.auth.updateMe({ addresses: updatedAddresses });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
    }
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      // Create prescription request
      const request = await base44.entities.PrescriptionRequest.create(data);
      
      // Send notification email to pharmacy
      await base44.integrations.Core.SendEmail({
        to: 'pharmacy@dca.com',
        subject: `New Refill Request - ${prescription?.name}`,
        body: `Patient ${user?.full_name} (${user?.email}) has requested a refill for ${prescription?.name}.

Delivery Method: ${deliveryMethod === 'pickup' ? 'Pickup' : `Home Delivery to ${selectedAddress}`}
${notes ? `Notes: ${notes}` : ''}

Please process this request in the system.`
      });

      // Send confirmation email to patient
      await base44.integrations.Core.SendEmail({
        to: user?.email,
        subject: 'Refill Request Received',
        body: `Hi ${user?.full_name},

We've received your refill request for ${prescription?.name}. 

Your prescription will be ready for ${deliveryMethod === 'pickup' ? 'pickup in 2-4 hours' : 'delivery within 2-3 business days'}.

You'll receive a notification when it's ready.

Thank you,
DCA Pharmacy Team`
      });

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['prescription-requests']);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setNotes('');
        setDeliveryMethod('pickup');
        setSelectedAddress('');
      }, 2000);
    }
  });

  const handleSubmit = () => {
    if (!user || !prescription) return;

    createRequestMutation.mutate({
      patient_name: user.full_name,
      patient_email: user.email,
      patient_phone: user.phone || '',
      medication_name: prescription.name,
      prescription_number: prescription.id.toString(),
      requested_via: 'manual',
      status: 'pending',
      notes: `Delivery: ${deliveryMethod}${deliveryMethod === 'delivery' ? ` to ${selectedAddress}` : ''}${notes ? `. Additional notes: ${notes}` : ''}`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Refill</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Request Submitted!</h3>
            <p className="text-gray-600">
              Your refill request for {prescription?.name} has been sent to the pharmacy.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Prescription</p>
                <p className="text-gray-700">{prescription?.name}</p>
                <p className="text-xs text-gray-600 mt-1">{prescription?.dosage}</p>
                {prescription?.quantity && (
                  <p className="text-xs text-gray-600">Quantity: {prescription.quantity} units</p>
                )}
              </div>
              {prescription?.image && (
                <img 
                  src={prescription.image} 
                  alt={prescription.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
              )}
            </div>

            <div>
              <Label>Delivery Method</Label>
              <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup at Pharmacy</SelectItem>
                  <SelectItem value="delivery">Home Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {deliveryMethod === 'delivery' && (
              <div>
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#8B1F1F]" />
                  Delivery Address
                </Label>
                <div className="space-y-3 mt-2">
                  {userAddresses.map((addr, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedAddress === addr.address
                          ? 'border-[#8B1F1F] bg-red-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAddress(addr.address)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800">{addr.name}</p>
                            {addr.is_primary && (
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{addr.address}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrimaryAddressMutation.mutate(addr.address);
                            }}
                            className="p-1 hover:bg-white rounded transition-colors"
                            title="Set as primary"
                          >
                            <Star className={`w-4 h-4 ${addr.is_primary ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAddressMutation.mutate(addr.address);
                            }}
                            className="p-1 hover:bg-white rounded transition-colors text-red-600"
                            title="Delete address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!showAddAddress && userAddresses.length < 4 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowAddAddress(true)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Address
                    </Button>
                  )}

                  {showAddAddress && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                      <div>
                        <Label className="text-xs">Address Type</Label>
                        <Select
                          value={newAddress.name}
                          onValueChange={(value) => setNewAddress({ ...newAddress, name: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Home">Home</SelectItem>
                            <SelectItem value="Work">Work</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Full Address</Label>
                        <Textarea
                          value={newAddress.address}
                          onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                          placeholder="123 Main St, Springfield, IL 62701"
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="new-primary"
                          checked={newAddress.is_primary}
                          onCheckedChange={(checked) => setNewAddress({ ...newAddress, is_primary: checked })}
                        />
                        <label htmlFor="new-primary" className="text-sm text-gray-700 cursor-pointer flex items-center gap-1">
                          <Star className={`w-4 h-4 ${newAddress.is_primary ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          Set as primary address
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddAddress(false);
                            setNewAddress({ name: 'Home', address: '', is_primary: false });
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => addAddressMutation.mutate(newAddress)}
                          disabled={!newAddress.address || addAddressMutation.isPending}
                          className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
                        >
                          {addAddressMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Add'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {userAddresses.length >= 4 && !showAddAddress && (
                    <p className="text-xs text-gray-500 text-center">Maximum of 4 addresses reached</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or questions..."
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
              <p className="text-xs text-gray-700">
                <strong>Expected Ready Time:</strong><br />
                {deliveryMethod === 'pickup' 
                  ? '2-4 hours for pickup'
                  : '2-3 business days for delivery'}
              </p>
              <div className="pt-2 border-t border-blue-200 space-y-1">
                {deliveryMethod === 'delivery' && (
                  <>
                    <p className="text-xs text-gray-700">
                      <strong>Prescription Cost:</strong> $15.00
                    </p>
                    <p className="text-xs text-gray-700">
                      <strong>Shipping & Handling:</strong> $5.00
                    </p>
                  </>
                )}
                <p className="text-xs text-gray-700">
                  <strong>Estimated Cost:</strong> ${estimatedCost.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Payment Section */}
            <div className="border-t pt-4">
              {deliveryMethod === 'pickup' && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="pay-at-pharmacy"
                      checked={payAtPharmacy}
                      onCheckedChange={(checked) => {
                        setPayAtPharmacy(checked);
                        if (checked) setShowPayment(false);
                      }}
                    />
                    <label htmlFor="pay-at-pharmacy" className="text-sm text-gray-700 cursor-pointer font-medium">
                      Pay at Pharmacy
                    </label>
                  </div>
                </div>
              )}

              {!payAtPharmacy && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowPayment(!showPayment)}
                    className="w-full mb-3"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {showPayment ? 'Hide Payment' : 'Add Payment Method'}
                  </Button>

                  {showPayment && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label>Card Number</Label>
                        <Input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Expiry Date</Label>
                          <Input placeholder="MM/YY" className="mt-1" />
                        </div>
                        <div>
                          <Label>CVV</Label>
                          <Input placeholder="123" className="mt-1" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="save-card"
                          checked={saveCard}
                          onCheckedChange={setSaveCard}
                        />
                        <label htmlFor="save-card" className="text-sm text-gray-700 cursor-pointer">
                          Save card for future purchases
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={createRequestMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createRequestMutation.isPending}
                className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
              >
                {createRequestMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add to Cart'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}