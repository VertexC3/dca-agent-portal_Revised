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
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-center">Loading communications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export/Share */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">Monitor and manage patient communications</p>
        </div>
        <ExportShareButtons data={communications} filename="communications" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Communications', value: communications.length, color: 'from-blue-500/30 to-cyan-500/30' },
          { label: 'Pending', value: communications.filter(c => c.status === 'pending').length, color: 'from-yellow-500/30 to-orange-500/30' },
          { label: 'In Progress', value: communications.filter(c => c.status === 'in_progress').length, color: 'from-purple-500/30 to-pink-500/30' },
          { label: 'Resolved', value: communications.filter(c => c.status === 'resolved').length, color: 'from-green-500/30 to-emerald-500/30' }
        ].map(stat => (
          <div key={stat.label} className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} border border-white/30 flex items-center justify-center mb-4 backdrop-blur-sm`}>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-white/70 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

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

      {/* Chart - Full Width */}
      <CommunicationChart communications={communications} />
    </div>
  );
}