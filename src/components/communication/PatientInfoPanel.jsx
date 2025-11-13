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
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Patient Information</h3>
            <p className="text-sm text-gray-600">Additional patient details</p>
          </div>
        </div>
        <div className="text-center py-6 text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No additional patient information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Patient Information</h3>
          <p className="text-sm text-gray-600">Medical history and demographics</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Demographics */}
        {(communication.patient_date_of_birth || communication.patient_address) && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Demographics</h4>
            <div className="space-y-2">
              {communication.patient_date_of_birth && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      {format(new Date(communication.patient_date_of_birth), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">
                      Age: {calculateAge(communication.patient_date_of_birth)} years old
                    </p>
                  </div>
                </div>
              )}
              {communication.patient_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <p className="text-sm text-gray-700">{communication.patient_address}</p>
                </div>
              )}
              {communication.preferred_contact_method && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Prefers: <span className="capitalize">{communication.preferred_contact_method}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Allergies */}
        {communication.patient_allergies && (
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <h4 className="text-sm font-semibold text-red-800">Allergies</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {communication.patient_allergies.split(',').map((allergy, idx) => (
                <Badge key={idx} className="bg-red-100 text-red-700 border-red-300">
                  {allergy.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Current Medications */}
        {communication.current_medications && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-blue-800">Current Medications</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {communication.current_medications.split(',').map((med, idx) => (
                <Badge key={idx} className="bg-blue-100 text-blue-700 border-blue-300">
                  {med.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Known Conditions */}
        {communication.known_conditions && (
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-purple-800">Known Conditions</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {communication.known_conditions.split(',').map((condition, idx) => (
                <Badge key={idx} className="bg-purple-100 text-purple-700 border-purple-300">
                  {condition.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Insurance */}
        {communication.insurance_provider && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-semibold text-green-800">Insurance Provider</h4>
            </div>
            <p className="text-sm text-gray-700 mt-2 ml-6">{communication.insurance_provider}</p>
          </div>
        )}
      </div>
    </div>
  );
}