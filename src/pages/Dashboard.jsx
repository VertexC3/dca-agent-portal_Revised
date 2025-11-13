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
    queryFn: () => base44.entities.PatientCommunication.list('-timestamp', 100)
  });

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