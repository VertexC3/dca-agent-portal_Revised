import React, { useState } from 'react';
import { Search, User, Phone, Mail, Calendar, MapPin, ShieldCheck, Stethoscope } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AgentPatientSearch({ patients, selectedPatient, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = patients.filter(p =>
    !searchTerm ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  return (
    <div className="w-72 flex-shrink-0 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-2.5 bg-[#8B1F1F] text-white">
        <h2 className="font-bold text-xs uppercase tracking-wider">Patient Lookup</h2>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
          <Input
            className="pl-8 h-8 text-xs border-gray-200"
            placeholder="Name, phone, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No patients found</p>
        )}
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            className={`flex items-center gap-2.5 p-2.5 cursor-pointer border-b border-gray-100 hover:bg-red-50 transition-colors ${
              selectedPatient?.id === p.id ? 'bg-red-50 border-l-4 border-l-[#8B1F1F]' : 'border-l-4 border-l-transparent'
            }`}
          >
            {p.profile_picture ? (
              <img src={p.profile_picture} alt={p.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-500" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-xs text-gray-900 truncate">{p.name}</p>
              <p className="text-xs text-gray-500 truncate">{p.phone}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs text-gray-400">{p.prescriptions.length} Rx</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Patient Summary Card */}
      {selectedPatient && (
        <div className="border-t-2 border-[#8B1F1F] bg-gray-50 p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            {selectedPatient.profile_picture ? (
              <img
                src={selectedPatient.profile_picture}
                alt={selectedPatient.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-[#8B1F1F]"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white font-bold">
                {selectedPatient.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 truncate">{selectedPatient.name}</p>
              <p className="text-xs text-gray-500">
                Patient since {format(new Date(selectedPatient.patient_since), 'MMM yyyy')}
              </p>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-gray-700">
              <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
              {selectedPatient.phone}
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="truncate">{selectedPatient.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
              DOB: {format(new Date(selectedPatient.dob), 'MM/dd/yyyy')}
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="truncate">{selectedPatient.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <ShieldCheck className="w-3 h-3 text-gray-400 flex-shrink-0" />
              {selectedPatient.insurance}
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <Stethoscope className="w-3 h-3 text-gray-400 flex-shrink-0" />
              {selectedPatient.physician}
            </div>
          </div>

          {selectedPatient.allergies !== 'None known' && (
            <div className="p-2 bg-red-50 rounded border border-red-200">
              <p className="text-xs text-red-700 font-semibold">⚠ Allergies: {selectedPatient.allergies}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}