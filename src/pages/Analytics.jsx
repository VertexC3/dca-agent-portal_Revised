import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, TrendingUp, Users, Clock, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import AgentPerformance from '../components/analytics/AgentPerformance';
import SatisfactionAnalysis from '../components/analytics/SatisfactionAnalysis';
import TrendsAnalysis from '../components/analytics/TrendsAnalysis';
import ReportExport from '../components/analytics/ReportExport';

export default function Analytics() {
  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: () => base44.entities.PatientCommunication.list('-timestamp', 1000)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <Loader2 className="w-12 h-12 text-[#8B1F1F] animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-center">Loading analytics...</p>
        </div>
      </div>
    );
  }

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

      {/* Trends Analysis */}
      <TrendsAnalysis communications={communications} />

      {/* Agent Performance */}
      <AgentPerformance communications={communications} />

      {/* Satisfaction Analysis */}
      <SatisfactionAnalysis communications={communications} />

      {/* Export Reports */}
      <ReportExport communications={communications} />
    </div>
  );
}