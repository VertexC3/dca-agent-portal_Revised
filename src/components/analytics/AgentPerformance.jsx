import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export default function AgentPerformance({ communications }) {
  // Group by agent
  const agentStats = communications
    .filter(c => c.handled_by)
    .reduce((acc, comm) => {
      const agent = comm.handled_by;
      if (!acc[agent]) {
        acc[agent] = {
          name: agent.split('@')[0],
          total: 0,
          resolved: 0,
          avgResponseTime: [],
          totalResponseTime: 0
        };
      }
      
      acc[agent].total++;
      if (comm.status === 'resolved') {
        acc[agent].resolved++;
      }
      
      if (comm.response_time_minutes) {
        acc[agent].avgResponseTime.push(comm.response_time_minutes);
        acc[agent].totalResponseTime += comm.response_time_minutes;
      }
      
      return acc;
    }, {});

  const agentData = Object.entries(agentStats).map(([email, stats]) => ({
    agent: stats.name,
    total: stats.total,
    resolved: stats.resolved,
    resolutionRate: ((stats.resolved / stats.total) * 100).toFixed(1),
    avgResponseTime: stats.avgResponseTime.length > 0
      ? (stats.totalResponseTime / stats.avgResponseTime.length).toFixed(1)
      : 0
  })).sort((a, b) => b.total - a.total);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-gray-800 mb-2">{data.agent}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">Total: {data.total}</p>
            <p className="text-gray-600">Resolved: {data.resolved}</p>
            <p className="text-gray-600">Resolution Rate: {data.resolutionRate}%</p>
            <p className="text-gray-600">Avg Response: {data.avgResponseTime} min</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-[#8B1F1F]/10 border border-[#8B1F1F]/30">
          <Users className="w-6 h-6 text-[#8B1F1F]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Agent Performance</h2>
          <p className="text-gray-600 text-sm">Individual agent metrics and statistics</p>
        </div>
      </div>

      {agentData.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No agent data available</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#8B1F1F]" />
                <span className="text-sm text-gray-600">Active Agents</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{agentData.length}</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Avg Response Time</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {agentData.reduce((sum, a) => sum + parseFloat(a.avgResponseTime), 0) / agentData.length || 0}
                <span className="text-lg text-gray-600 ml-1">min</span>
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Avg Resolution Rate</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {(agentData.reduce((sum, a) => sum + parseFloat(a.resolutionRate), 0) / agentData.length || 0).toFixed(1)}
                <span className="text-lg text-gray-600 ml-1">%</span>
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  dataKey="agent" 
                  stroke="rgba(0,0,0,0.6)"
                  tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 12 }}
                />
                <YAxis 
                  stroke="rgba(0,0,0,0.6)"
                  tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="total" fill="#8B1F1F" name="Total Cases" />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Agent</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Resolved</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Resolution Rate</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg Response</th>
                </tr>
              </thead>
              <tbody>
                {agentData.map((agent, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800 font-medium">{agent.agent}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 text-center">{agent.total}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 text-center">{agent.resolved}</td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        parseFloat(agent.resolutionRate) >= 80 
                          ? 'bg-green-50 text-green-700' 
                          : parseFloat(agent.resolutionRate) >= 60 
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {agent.resolutionRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 text-center">{agent.avgResponseTime} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}