import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function InsightsCard({ communications }) {
  // Calculate top 10 request types
  const requestCounts = communications.reduce((acc, comm) => {
    const type = comm.request_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const topRequests = Object.entries(requestCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([type, count]) => ({
      type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count
    }));

  const totalRequests = communications.length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-[#8B1F1F]/10 border border-[#8B1F1F]/30">
          <TrendingUp className="w-6 h-6 text-[#8B1F1F]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Insights</h2>
          <p className="text-gray-600 text-sm">Top 10 Patient Requests</p>
        </div>
      </div>

      <div className="space-y-3">
        {topRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No data available yet</p>
          </div>
        ) : (
          topRequests.map((request, index) => {
            const percentage = totalRequests > 0 ? ((request.count / totalRequests) * 100).toFixed(1) : 0;
            return (
              <div key={request.type} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8B1F1F] flex items-center justify-center font-bold text-white text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{request.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-800 text-lg">{request.count}</span>
                    <span className="text-gray-500 text-sm ml-2">({percentage}%)</span>
                  </div>
                </div>
                
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#8B1F1F] to-[#A52A2A] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-gray-800">
          <span className="font-medium">Total Requests</span>
          <span className="text-2xl font-bold">{totalRequests}</span>
        </div>
      </div>
    </div>
  );
}