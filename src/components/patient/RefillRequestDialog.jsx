import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, Pill } from 'lucide-react';

export default function RefillRequestDialog({ open, onClose, prescription }) {
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
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

Delivery Method: ${deliveryMethod === 'pickup' ? 'Pickup' : 'Home Delivery'}
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
      notes: `Delivery: ${deliveryMethod}${notes ? `. Additional notes: ${notes}` : ''}`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#8B1F1F]" />
            Request Refill
          </DialogTitle>
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
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-800">Prescription</p>
              <p className="text-gray-700">{prescription?.name}</p>
              <p className="text-xs text-gray-600 mt-1">{prescription?.dosage}</p>
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

            <div>
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or questions..."
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-700">
                <strong>Expected Ready Time:</strong><br />
                {deliveryMethod === 'pickup' 
                  ? '2-4 hours for pickup'
                  : '2-3 business days for delivery'}
              </p>
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
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}