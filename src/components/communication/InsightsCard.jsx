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
    <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400/30 to-orange-500/30 border border-white/30 backdrop-blur-sm">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Insights</h2>
          <p className="text-white/70 text-sm">Top 10 Patient Requests</p>
        </div>
      </div>

      <div className="space-y-3">
        {topRequests.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No data available yet</p>
          </div>
        ) : (
          topRequests.map((request, index) => {
            const percentage = ((request.count / totalRequests) * 100).toFixed(1);
            return (
              <div key={request.type} className="backdrop-blur-lg bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/20 to-white/10 border border-white/30 flex items-center justify-center font-bold text-white text-sm backdrop-blur-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-white">{request.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white text-lg">{request.count}</span>
                    <span className="text-white/60 text-sm ml-2">({percentage}%)</span>
                  </div>
                </div>
                
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center justify-between text-white">
          <span className="font-medium">Total Requests</span>
          <span className="text-2xl font-bold">{totalRequests}</span>
        </div>
      </div>
    </div>
  );
}