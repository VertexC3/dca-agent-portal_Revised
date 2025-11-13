import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { Calendar } from 'lucide-react';

export default function CommunicationChart({ communications }) {
  // Generate last 30 days data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = communications.filter(c => c.date === dateStr).length;
    
    return {
      date: dateStr,
      displayDate: format(date, 'MMM d'),
      count
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
          <p className="text-gray-800 font-semibold">{payload[0].payload.displayDate}</p>
          <p className="text-gray-600 text-sm">{payload[0].value} communications</p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data) => {
    window.location.href = createPageUrl(`DailyView?date=${data.date}`);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-[#8B1F1F]/10 border border-[#8B1F1F]/30">
          <Calendar className="w-6 h-6 text-[#8B1F1F]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Communication Trends</h2>
          <p className="text-gray-600 text-sm">Last 30 Days - Click on any bar to view details</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={last30Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis 
              dataKey="displayDate" 
              stroke="rgba(0,0,0,0.6)"
              tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="rgba(0,0,0,0.6)"
              tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 31, 31, 0.1)' }} />
            <Bar 
              dataKey="count" 
              fill="url(#colorGradient)"
              radius={[8, 8, 0, 0]}
              onClick={handleBarClick}
              cursor="pointer"
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B1F1F" />
                <stop offset="100%" stopColor="#A52A2A" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-gray-600 text-sm">
        <Calendar className="w-4 h-4" />
        <span>Click on any bar to view all communications for that day</span>
      </div>
    </div>
  );
}