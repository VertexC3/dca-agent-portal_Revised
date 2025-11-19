import React from 'react';
import { History, Pill } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const statusColors = {
  active: 'bg-green-100 text-green-800',
  discontinued: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800'
};

export default function PatientPrescriptionHistory({ prescriptions, patientName }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-[#8B1F1F]" />
        Prescription History
      </h3>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {prescriptions.map(prescription => (
          <div
            key={prescription.id}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{prescription.medication_name}</p>
                <p className="text-sm text-gray-600">{prescription.dosage} - {prescription.frequency}</p>
              </div>
              <Badge className={`${statusColors[prescription.status]} text-xs`}>
                {prescription.status}
              </Badge>
            </div>

            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-medium">Prescriber:</span> {prescription.prescriber_name}</p>
              <p><span className="font-medium">Dispensed:</span> {format(new Date(prescription.dispense_date), 'MMM d, yyyy')}</p>
              {prescription.quantity_dispensed && (
                <p><span className="font-medium">Quantity:</span> {prescription.quantity_dispensed}</p>
              )}
              {prescription.refills_remaining !== undefined && (
                <p><span className="font-medium">Refills:</span> {prescription.refills_remaining} remaining</p>
              )}
              {prescription.drug_class && (
                <p><span className="font-medium">Class:</span> {prescription.drug_class}</p>
              )}
            </div>

            {prescription.notes && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">{prescription.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}