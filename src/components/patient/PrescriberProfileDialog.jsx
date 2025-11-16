import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, MapPin, Phone, FileText } from 'lucide-react';

// Dummy prescriber data
const prescriberData = {
  'Dr. Smith': {
    fullName: 'Dr. John Smith, MD',
    specialty: 'Internal Medicine',
    address: '123 Medical Plaza, Suite 200, Springfield, IL 62701',
    phone: '(555) 123-4567',
    prescriptionsWritten: 45,
    yearsExperience: 15
  },
  'Dr. Johnson': {
    fullName: 'Dr. Sarah Johnson, MD',
    specialty: 'Endocrinology',
    address: '456 Health Center Dr, Springfield, IL 62702',
    phone: '(555) 987-6543',
    prescriptionsWritten: 32,
    yearsExperience: 12
  }
};

export default function PrescriberProfileDialog({ open, onClose, prescriberName }) {
  const prescriber = prescriberData[prescriberName] || {
    fullName: prescriberName,
    specialty: 'General Practice',
    address: 'N/A',
    phone: 'N/A',
    prescriptionsWritten: 0,
    yearsExperience: 0
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#8B1F1F]" />
            Prescriber Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{prescriber.fullName}</h3>
            <p className="text-sm text-gray-600">{prescriber.specialty}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#8B1F1F] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Address</p>
                <p className="text-sm text-gray-600">{prescriber.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#8B1F1F] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Phone</p>
                <p className="text-sm text-gray-600">{prescriber.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-[#8B1F1F] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Prescriptions Written (Your History)</p>
                <p className="text-sm text-gray-600">{prescriber.prescriptionsWritten} prescriptions</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {prescriber.yearsExperience} years of experience
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}