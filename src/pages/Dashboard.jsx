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
  const [selectedStatus, setSelectedStatus] = useState('all');

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: communications.length, color: 'bg-[#8B1F1F]', channel: 'all' },
          { label: 'Email', value: communications.filter(c => c.channel === 'email').length, color: 'bg-blue-500', channel: 'email' },
          { label: 'Phone', value: communications.filter(c => c.channel === 'phone').length, color: 'bg-green-500', channel: 'phone' },
          { label: 'Text', value: communications.filter(c => c.channel === 'text').length, color: 'bg-purple-500', channel: 'text' },
          { label: 'AI Agent', value: communications.filter(c => c.channel === 'ai_agent').length, color: 'bg-orange-500', channel: 'ai_agent' }
        ].map(stat => (
          <button
            key={stat.label}
            onClick={() => setSelectedChannel(stat.channel)}
            className={`bg-white rounded-2xl p-6 border-2 shadow-lg text-left transition-all hover:shadow-xl hover:scale-105 ${
              selectedChannel === stat.channel 
                ? 'border-[#8B1F1F] ring-2 ring-[#8B1F1F]/20' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            {selectedChannel === stat.channel && (
              <div className="mt-2 text-xs text-[#8B1F1F] font-semibold">● Active Filter</div>
            )}
          </button>
        ))}
      </div>

      {/* Chart - Full Width at Top */}
      <CommunicationChart communications={communications} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Communications - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentCommunicationList 
            communications={communications}
            selectedChannel={selectedChannel}
            selectedStatus={selectedStatus}
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