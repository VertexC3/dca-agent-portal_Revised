import React, { useState } from 'react';
import { Download, FileText, Table, BarChart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

export default function ReportExport({ communications }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateJSON = (data, filename) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportFullReport = (format) => {
    setIsGenerating(true);
    
    const reportData = communications.map(c => ({
      date: c.date,
      patient_name: c.patient_name,
      channel: c.channel,
      request_type: c.request_type,
      status: c.status,
      handled_by: c.handled_by || 'N/A',
      handled_by_type: c.handled_by_type || 'representative',
      escalated: c.escalated_to_human ? 'Yes' : 'No',
      response_time_minutes: c.response_time_minutes || 'N/A',
      satisfaction_score: c.satisfaction_score || 'N/A'
    }));

    if (format === 'csv') {
      generateCSV(reportData, 'full_report');
    } else {
      generateJSON(reportData, 'full_report');
    }

    setTimeout(() => setIsGenerating(false), 1000);
  };

  const exportAgentPerformance = (format) => {
    setIsGenerating(true);
    
    const agentStats = communications
      .filter(c => c.handled_by)
      .reduce((acc, comm) => {
        const agent = comm.handled_by;
        if (!acc[agent]) {
          acc[agent] = {
            agent: agent,
            total_cases: 0,
            resolved: 0,
            pending: 0,
            avg_response_time: 0,
            response_times: []
          };
        }
        
        acc[agent].total_cases++;
        if (comm.status === 'resolved') acc[agent].resolved++;
        if (comm.status === 'pending') acc[agent].pending++;
        
        if (comm.response_time_minutes) {
          acc[agent].response_times.push(comm.response_time_minutes);
        }
        
        return acc;
      }, {});

    const reportData = Object.values(agentStats).map(agent => ({
      agent: agent.agent,
      total_cases: agent.total_cases,
      resolved: agent.resolved,
      pending: agent.pending,
      resolution_rate: `${((agent.resolved / agent.total_cases) * 100).toFixed(1)}%`,
      avg_response_time: agent.response_times.length > 0
        ? `${(agent.response_times.reduce((a, b) => a + b, 0) / agent.response_times.length).toFixed(1)} min`
        : 'N/A'
    }));

    if (format === 'csv') {
      generateCSV(reportData, 'agent_performance');
    } else {
      generateJSON(reportData, 'agent_performance');
    }

    setTimeout(() => setIsGenerating(false), 1000);
  };

  const exportSatisfactionReport = (format) => {
    setIsGenerating(true);
    
    const satisfactionData = communications
      .filter(c => c.satisfaction_score)
      .map(c => ({
        date: c.date,
        patient_name: c.patient_name,
        channel: c.channel,
        request_type: c.request_type,
        satisfaction_score: c.satisfaction_score,
        feedback: c.satisfaction_feedback || 'No feedback',
        handled_by: c.handled_by || 'N/A'
      }));

    if (format === 'csv') {
      generateCSV(satisfactionData, 'satisfaction_report');
    } else {
      generateJSON(satisfactionData, 'satisfaction_report');
    }

    setTimeout(() => setIsGenerating(false), 1000);
  };

  const exportTrendsReport = (format) => {
    setIsGenerating(true);
    
    // Group by date
    const dateGroups = communications.reduce((acc, c) => {
      if (!acc[c.date]) {
        acc[c.date] = {
          date: c.date,
          total: 0,
          phone: 0,
          email: 0,
          text: 0,
          ai_agent: 0,
          resolved: 0
        };
      }
      
      acc[c.date].total++;
      acc[c.date][c.channel]++;
      if (c.status === 'resolved') acc[c.date].resolved++;
      
      return acc;
    }, {});

    const reportData = Object.values(dateGroups).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    if (format === 'csv') {
      generateCSV(reportData, 'trends_report');
    } else {
      generateJSON(reportData, 'trends_report');
    }

    setTimeout(() => setIsGenerating(false), 1000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-green-50 border border-green-200">
          <Download className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Export Reports</h2>
          <p className="text-gray-600 text-sm">Download data in various formats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Report */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#8B1F1F]/10">
              <FileText className="w-5 h-5 text-[#8B1F1F]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Full Communication Report</h3>
              <p className="text-sm text-gray-600">Complete dataset with all communications</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => exportFullReport('csv')}
              disabled={isGenerating}
              size="sm"
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              <Table className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button 
              onClick={() => exportFullReport('json')}
              disabled={isGenerating}
              size="sm"
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              <FileText className="w-4 h-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <BarChart className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Agent Performance Report</h3>
              <p className="text-sm text-gray-600">Individual agent metrics and KPIs</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => exportAgentPerformance('csv')}
              disabled={isGenerating}
              size="sm"
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              <Table className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button 
              onClick={() => exportAgentPerformance('json')}
              disabled={isGenerating}
              size="sm"
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              <FileText className="w-4 h-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>

        {/* Satisfaction Report */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-50">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Satisfaction Report</h3>
              <p className="text-sm text-gray-600">Patient feedback and ratings</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => exportSatisfactionReport('csv')}
              disabled={isGenerating}
              size="sm"
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              <Table className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button 
              onClick={() => exportSatisfactionReport('json')}
              disabled={isGenerating}
              size="sm"
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              <FileText className="w-4 h-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>

        {/* Trends Report */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-50">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Trends Report</h3>
              <p className="text-sm text-gray-600">Daily statistics and patterns</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => exportTrendsReport('csv')}
              disabled={isGenerating}
              size="sm"
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              <Table className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button 
              onClick={() => exportTrendsReport('json')}
              disabled={isGenerating}
              size="sm"
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              <FileText className="w-4 h-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Generating report...
        </div>
      )}
    </div>
  );
}