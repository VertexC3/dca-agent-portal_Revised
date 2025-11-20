import React from 'react';
import { User, Calendar, MapPin, AlertCircle, Pill, Heart, Shield, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function PatientInfoPanel({ communication }) {
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const hasPatientData = communication.patient_date_of_birth || 
                         communication.patient_address || 
                         communication.patient_allergies || 
                         communication.current_medications || 
                         communication.known_conditions ||
                         communication.insurance_provider;

  if (!hasPatientData) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Patient Info
        </h3>
        <div className="text-center py-4 text-gray-400">
          <AlertCircle className="w-6 h-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <User className="w-4 h-4 text-blue-600" />
        Medical Info
      </h3>

      <div className="space-y-2 text-xs">
        {communication.patient_date_of_birth && (
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-3 h-3 text-gray-500" />
            <span>{format(new Date(communication.patient_date_of_birth), 'MMM d, yyyy')} ({calculateAge(communication.patient_date_of_birth)} yrs)</span>
          </div>
        )}
        {communication.patient_address && (
          <div className="flex items-start gap-2 text-gray-700">
            <MapPin className="w-3 h-3 text-gray-500 mt-0.5" />
            <span className="flex-1">{communication.patient_address}</span>
          </div>
        )}
        {communication.preferred_contact_method && (
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="w-3 h-3 text-gray-500" />
            <span>Prefers: <span className="capitalize font-medium">{communication.preferred_contact_method}</span></span>
          </div>
        )}
        {communication.insurance_provider && (
          <div className="flex items-start gap-2 text-gray-700">
            <Shield className="w-3 h-3 text-gray-500 mt-0.5" />
            <span className="flex-1">{communication.insurance_provider}</span>
          </div>
        )}
        {communication.patient_allergies && (
          <div className="flex items-start gap-2 text-gray-700 pt-2 border-t border-gray-100">
            <AlertCircle className="w-3 h-3 text-red-500 mt-0.5" />
            <span className="flex-1"><span className="font-medium text-red-700">Allergies:</span> {communication.patient_allergies}</span>
          </div>
        )}
        {communication.current_medications && (
          <div className="flex items-start gap-2 text-gray-700 pt-2 border-t border-gray-100">
            <Pill className="w-3 h-3 text-blue-500 mt-0.5" />
            <span className="flex-1"><span className="font-medium">Meds:</span> {communication.current_medications}</span>
          </div>
        )}
        {communication.known_conditions && (
          <div className="flex items-start gap-2 text-gray-700 pt-2 border-t border-gray-100">
            <Heart className="w-3 h-3 text-purple-500 mt-0.5" />
            <span className="flex-1"><span className="font-medium">Conditions:</span> {communication.known_conditions}</span>
          </div>
        )}
      </div>
    </div>
  );
}