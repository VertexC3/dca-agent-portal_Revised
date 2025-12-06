import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, MapPin, Phone, FileText, Pill, Building2, BadgeCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Dummy prescriber data
const prescriberData = {
  'Dr. Smith': {
    fullName: 'Dr. John Smith, MD',
    specialty: 'Internal Medicine',
    facilityName: 'Springfield Medical Center',
    address: '123 Medical Plaza, Suite 200, Springfield, IL 62701',
    phone: '(555) 123-4567',
    nil: '1234567890',
    prescriptionsList: [
      { name: 'Lisinopril 10mg', status: 'active' },
      { name: 'Metformin 500mg', status: 'active' },
      { name: 'Atorvastatin 20mg', status: 'active' },
      { name: 'Aspirin 81mg', status: 'inactive' }
    ]
  },
  'Dr. Johnson': {
    fullName: 'Dr. Sarah Johnson, MD',
    specialty: 'Endocrinology',
    facilityName: 'Diabetes Care Clinic',
    address: '456 Health Center Dr, Springfield, IL 62702',
    phone: '(555) 987-6543',
    nil: '0987654321',
    prescriptionsList: [
      { name: 'Insulin Glargine', status: 'active' },
      { name: 'Glipizide 5mg', status: 'inactive' }
    ]
  },
  'Dr. Martinez': {
      fullName: 'Dr. Martinez, MD',
      specialty: 'Gastroenterology',
      facilityName: 'Digestive Health Institute',
      address: '789 Wellness Way, Suite 100, Springfield, IL 62703',
      phone: '(555) 234-5678',
      nil: '1122334455',
      prescriptionsList: [
        { name: 'Omeprazole 20mg', status: 'active' }
      ]
  }
};

export default function PrescriberProfileDialog({ open, onClose, prescriberName }) {
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const prescriber = prescriberData[prescriberName] || {
    fullName: prescriberName,
    specialty: 'General Practice',
    facilityName: 'Unknown Facility',
    address: 'N/A',
    phone: 'N/A',
    nil: 'N/A',
    prescriptionsList: []
  };

  const filteredPrescriptions = showActiveOnly 
    ? prescriber.prescriptionsList.filter(p => p.status === 'active')
    : prescriber.prescriptionsList;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-6 h-6 text-[#8B1F1F]" />
            Provider Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{prescriber.fullName}</h3>
                <p className="text-gray-600 font-medium">{prescriber.specialty}</p>
              </div>

              <div className="space-y-3">
                 <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-[#8B1F1F] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Facility</p>
                    <p className="text-sm text-gray-600">{prescriber.facilityName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#8B1F1F] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Address</p>
                    <p className="text-sm text-gray-600">{prescriber.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#8B1F1F] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Phone</p>
                    <p className="text-sm text-gray-600">{prescriber.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-[#8B1F1F] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">National Insurance License (NIL)</p>
                    <p className="text-sm text-gray-600">{prescriber.nil}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-[#8B1F1F]" />
                  <h4 className="font-bold text-gray-800">Prescriptions</h4>
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="active-toggle" className="text-xs text-gray-600">
                        {showActiveOnly ? 'Active Only' : 'All'}
                    </Label>
                    <Switch 
                        id="active-toggle"
                        checked={showActiveOnly}
                        onCheckedChange={setShowActiveOnly}
                    />
                </div>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions.map((rx, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <span className="text-sm font-medium text-gray-700">{rx.name}</span>
                      <Badge className={rx.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                        {rx.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-4">No prescriptions found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}