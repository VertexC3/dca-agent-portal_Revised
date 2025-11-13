import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, TrendingUp, Users, Clock, Bot, User as UserIcon } from 'lucide-react';
import CommunicationChart from '../components/communication/CommunicationChart';
import InsightsCard from '../components/communication/InsightsCard';

export default function Analytics() {
  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: () => base44.entities.PatientCommunication.list('-timestamp', 1000)
  });

  const stats = {
    total: communications.length,
    aiHandled: communications.filter(c => c.handled_by_type === 'ai_agent').length,
    humanHandled: communications.filter(c => c.handled_by_type === 'representative').length,
    escalated: communications.filter(c => c.escalated_to_human).length,
    avgResponseTime: '2.5 hours',
    resolutionRate: communications.length > 0 
      ? ((communications.filter(c => c.status === 'resolved').length / communications.length) * 100).toFixed(1)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Analytics</h1>
        <p className="text-gray-600">Insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Handled</p>
              <p className="text-2xl font-bold text-gray-800">{stats.aiHandled}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {stats.total > 0 ? ((stats.aiHandled / stats.total) * 100).toFixed(1) : 0}% of total
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-[#8B1F1F]/10 border border-[#8B1F1F]/30">
              <UserIcon className="w-6 h-6 text-[#8B1F1F]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Human Handled</p>
              <p className="text-2xl font-bold text-gray-800">{stats.humanHandled}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {stats.total > 0 ? ((stats.humanHandled / stats.total) * 100).toFixed(1) : 0}% of total
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Escalations</p>
              <p className="text-2xl font-bold text-gray-800">{stats.escalated}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {stats.aiHandled > 0 ? ((stats.escalated / stats.aiHandled) * 100).toFixed(1) : 0}% of AI interactions
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <p className="text-sm text-gray-600">Avg Response Time</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.avgResponseTime}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-gray-600" />
            <p className="text-sm text-gray-600">Total Patients</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {new Set(communications.map(c => c.patient_id)).size}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <p className="text-sm text-gray-600">Resolution Rate</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.resolutionRate}%</p>
        </div>
      </div>

      {/* Communication Trends */}
      <CommunicationChart communications={communications} />

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsCard communications={communications} />
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Channel Distribution</h3>
          <div className="space-y-3">
            {['phone', 'email', 'text', 'ai_agent'].map(channel => {
              const count = communications.filter(c => c.channel === channel).length;
              const percentage = communications.length > 0 ? ((count / communications.length) * 100).toFixed(1) : 0;
              return (
                <div key={channel} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800 capitalize">
                      {channel === 'ai_agent' ? 'AI Agent' : channel}
                    </span>
                    <span className="font-bold text-gray-800">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#8B1F1F] to-[#A52A2A] rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}