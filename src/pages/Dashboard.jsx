import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RecentCommunicationList from '../components/communication/RecentCommunicationList';
import InsightsCard from '../components/communication/InsightsCard';
import CommunicationChart from '../components/communication/CommunicationChart';
import ExportShareButtons from '../components/communication/ExportShareButtons';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [selectedChannel, setSelectedChannel] = useState('all');

  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: async () => {
      const comms = await base44.entities.PatientCommunication.list('-timestamp', 100);
      
      // Add dummy patient data if not present
      return comms.map(comm => ({
        ...comm,
        patient_date_of_birth: comm.patient_date_of_birth || getDummyDOB(comm.patient_name),
        patient_address: comm.patient_address || getDummyAddress(comm.patient_name),
        patient_allergies: comm.patient_allergies || getDummyAllergies(comm.patient_name),
        current_medications: comm.current_medications || getDummyMedications(comm.patient_name),
        known_conditions: comm.known_conditions || getDummyConditions(comm.patient_name),
        insurance_provider: comm.insurance_provider || getDummyInsurance(comm.patient_name),
        preferred_contact_method: comm.preferred_contact_method || 'email'
      }));
    }
  });

  // Dummy data generators based on patient name for consistency
  const getDummyDOB = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const year = 1950 + (hash % 50);
    const month = (hash % 12) + 1;
    const day = (hash % 28) + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDummyAddress = (name) => {
    const addresses = [
      '123 Main St, Springfield, IL 62701',
      '456 Oak Ave, Portland, OR 97201',
      '789 Pine Rd, Austin, TX 78701',
      '321 Elm St, Boston, MA 02101',
      '654 Maple Dr, Seattle, WA 98101'
    ];
    return addresses[name.length % addresses.length];
  };

  const getDummyAllergies = (name) => {
    const allergies = [
      'Penicillin, Peanuts',
      'Shellfish, Latex',
      'Sulfa drugs, Bee stings',
      'Aspirin, Tree nuts',
      'Codeine, Dairy'
    ];
    return allergies[name.length % allergies.length];
  };

  const getDummyMedications = (name) => {
    const meds = [
      'Lisinopril 10mg, Metformin 500mg, Atorvastatin 20mg',
      'Levothyroxine 50mcg, Omeprazole 20mg',
      'Amlodipine 5mg, Simvastatin 40mg, Aspirin 81mg',
      'Losartan 50mg, Metoprolol 25mg',
      'Gabapentin 300mg, Sertraline 50mg, Vitamin D3'
    ];
    return meds[name.length % meds.length];
  };

  const getDummyConditions = (name) => {
    const conditions = [
      'Hypertension, Type 2 Diabetes, High Cholesterol',
      'Hypothyroidism, GERD',
      'Hypertension, Hyperlipidemia',
      'Hypertension, Anxiety',
      'Chronic Pain, Depression'
    ];
    return conditions[name.length % conditions.length];
  };

  const getDummyInsurance = (name) => {
    const insurances = [
      'Blue Cross Blue Shield PPO',
      'United Healthcare HMO',
      'Aetna PPO',
      'Cigna POS',
      'Medicare Part D'
    ];
    return insurances[name.length % insurances.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <Loader2 className="w-12 h-12 text-[#8B1F1F] animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-center">Loading communications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export/Share */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Monitor and manage patient communications</p>
        </div>
        <ExportShareButtons data={communications} filename="communications" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Communications', value: communications.length, color: 'bg-[#8B1F1F]' },
          { label: 'Pending', value: communications.filter(c => c.status === 'pending').length, color: 'bg-yellow-500' },
          { label: 'In Progress', value: communications.filter(c => c.status === 'in_progress').length, color: 'bg-blue-500' },
          { label: 'Resolved', value: communications.filter(c => c.status === 'resolved').length, color: 'bg-green-500' }
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart - Full Width at Top */}
      <CommunicationChart communications={communications} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Communications - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentCommunicationList 
            communications={communications.slice(0, 10)}
            selectedChannel={selectedChannel}
            onChannelChange={setSelectedChannel}
          />
        </div>

        {/* Insights - Takes 1 column */}
        <div>
          <InsightsCard communications={communications} />
        </div>
      </div>
    </div>
  );
}