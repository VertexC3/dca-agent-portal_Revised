import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Pill, TrendingUp, Loader2, Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PatientPrescriptionHistory from '../components/prescription/PatientPrescriptionHistory';
import PrescriptionCharts from '../components/prescription/PrescriptionCharts';
import AdherenceMonitor from '../components/prescription/AdherenceMonitor';
import DrugInteractionAlerts from '../components/prescription/DrugInteractionAlerts';
import PrescriptionReporter from '../components/prescription/PrescriptionReporter';

export default function PrescriptionTrends() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data: communications = [], isLoading: commsLoading } = useQuery({
    queryKey: ['patient-communications'],
    queryFn: () => base44.entities.PatientCommunication.list('-created_date', 1000)
  });

  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['prescriptions', selectedPatient?.patient_email],
    queryFn: () => base44.entities.Prescription.filter(
      { patient_email: selectedPatient.patient_email },
      '-dispense_date',
      1000
    ),
    enabled: !!selectedPatient
  });

  // Get unique patients from communications
  const patients = React.useMemo(() => {
    const uniquePatients = new Map();
    communications.forEach(comm => {
      if (comm.patient_email && comm.patient_name) {
        uniquePatients.set(comm.patient_email, {
          patient_email: comm.patient_email,
          patient_name: comm.patient_name,
          patient_phone: comm.patient_phone,
          patient_id: comm.patient_id
        });
      }
    });
    return Array.from(uniquePatients.values());
  }, [communications]);

  const filteredPatients = React.useMemo(() => {
    if (!searchTerm) return patients.slice(0, 10);
    const term = searchTerm.toLowerCase();
    return patients.filter(p =>
      p.patient_name?.toLowerCase().includes(term) ||
      p.patient_email?.toLowerCase().includes(term) ||
      p.patient_phone?.includes(term) ||
      p.patient_id?.toLowerCase().includes(term)
    ).slice(0, 10);
  }, [patients, searchTerm]);

  const activePrescriptions = prescriptions.filter(p => p.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Pill className="w-10 h-10 text-[#8B1F1F]" />
          Prescription History & Trends
        </h1>
        <p className="text-gray-600">Analyze prescription patterns, adherence, and drug interactions</p>
      </div>

      {/* Patient Search */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Select Patient</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name, email, phone, or patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchTerm && (
          <div className="mt-4 space-y-2">
            {commsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <button
                  key={patient.patient_email}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setSearchTerm('');
                  }}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all"
                >
                  <p className="font-semibold text-gray-800">{patient.patient_name}</p>
                  <p className="text-sm text-gray-600">{patient.patient_email}</p>
                  {patient.patient_phone && (
                    <p className="text-xs text-gray-500">{patient.patient_phone}</p>
                  )}
                </button>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">No patients found</p>
            )}
          </div>
        )}

        {selectedPatient && !searchTerm && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{selectedPatient.patient_name}</p>
                <p className="text-sm text-gray-600">{selectedPatient.patient_email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPatient(null)}
              >
                Change Patient
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedPatient && (
        <>
          {prescriptionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-[#8B1F1F] animate-spin" />
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-lg text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No prescription data available for this patient</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Charts and Insights */}
              <div className="lg:col-span-2 space-y-6">
                {/* Drug Interaction Alerts */}
                <DrugInteractionAlerts prescriptions={activePrescriptions} />

                {/* Adherence Monitor */}
                <AdherenceMonitor prescriptions={prescriptions} />

                {/* Prescription Charts */}
                <PrescriptionCharts prescriptions={prescriptions} />
              </div>

              {/* Right Column - History and Reports */}
              <div className="space-y-6">
                {/* Prescription History */}
                <PatientPrescriptionHistory 
                  prescriptions={prescriptions}
                  patientName={selectedPatient.patient_name}
                />

                {/* Report Generator */}
                <PrescriptionReporter 
                  prescriptions={prescriptions}
                  patientName={selectedPatient.patient_name}
                />
              </div>
            </div>
          )}
        </>
      )}

      {!selectedPatient && (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-lg text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">Select a patient to view their prescription history and trends</p>
        </div>
      )}
    </div>
  );
}