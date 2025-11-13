import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TrendsAnalysis({ communications }) {
  const [dateRange, setDateRange] = useState('30');
  const [groupBy, setGroupBy] = useState('channel'); // 'channel' or 'request_type'

  const generateTrendData = () => {
    const days = parseInt(dateRange);
    const startDate = subDays(new Date(), days - 1);
    
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayComms = communications.filter(c => c.date === dateStr);
      
      if (groupBy === 'channel') {
        return {
          date: dateStr,
          displayDate: format(date, 'MMM d'),
          phone: dayComms.filter(c => c.channel === 'phone').length,
          email: dayComms.filter(c => c.channel === 'email').length,
          text: dayComms.filter(c => c.channel === 'text').length,
          ai_agent: dayComms.filter(c => c.channel === 'ai_agent').length,
        };
      } else {
        // Group by request type
        const types = {};
        dayComms.forEach(c => {
          const type = c.request_type || 'other';
          types[type] = (types[type] || 0) + 1;
        });
        return {
          date: dateStr,
          displayDate: format(date, 'MMM d'),
          ...types
        };
      }
    });
  };

  const trendData = generateTrendData();

  // Get top request types for the chart
  const requestTypeCounts = communications.reduce((acc, c) => {
    const type = c.request_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const topRequestTypes = Object.entries(requestTypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([type]) => type);

  const colors = {
    phone: '#3B82F6',
    email: '#8B1F1F',
    text: '#10B981',
    ai_agent: '#A855F7',
    prescription_refill: '#3B82F6',
    medication_inquiry: '#8B1F1F',
    delivery_status: '#10B981',
    billing_question: '#F59E0B',
    side_effects: '#EF4444',
    appointment_scheduling: '#A855F7',
    insurance_question: '#EC4899',
    general_inquiry: '#6366F1',
    complaint: '#F43F5E',
    other: '#6B7280'
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.displayDate}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-sm" style={{ color: entry.color }}>
                  {entry.name.replace(/_/g, ' ')}:
                </span>
                <span className="text-sm font-medium text-gray-800">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Communication Trends</h2>
            <p className="text-gray-600 text-sm">Analyze patterns over time</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              onClick={() => setGroupBy('channel')}
              variant="ghost"
              size="sm"
              className={`text-xs ${
                groupBy === 'channel' 
                  ? 'bg-[#8B1F1F] text-white hover:bg-[#721919] hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              By Channel
            </Button>
            <Button
              onClick={() => setGroupBy('request_type')}
              variant="ghost"
              size="sm"
              className={`text-xs ${
                groupBy === 'request_type' 
                  ? 'bg-[#8B1F1F] text-white hover:bg-[#721919] hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              By Request Type
            </Button>
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['7', '14', '30', '90'].map(days => (
              <Button
                key={days}
                onClick={() => setDateRange(days)}
                variant="ghost"
                size="sm"
                className={`text-xs ${
                  dateRange === days 
                    ? 'bg-[#8B1F1F] text-white hover:bg-[#721919] hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {days}D
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis 
              dataKey="displayDate" 
              stroke="rgba(0,0,0,0.6)"
              tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="rgba(0,0,0,0.6)"
              tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            {groupBy === 'channel' ? (
              <>
                <Bar dataKey="phone" stackId="a" fill={colors.phone} name="Phone" />
                <Bar dataKey="email" stackId="a" fill={colors.email} name="Email" />
                <Bar dataKey="text" stackId="a" fill={colors.text} name="Text" />
                <Bar dataKey="ai_agent" stackId="a" fill={colors.ai_agent} name="AI Agent" />
              </>
            ) : (
              topRequestTypes.map(type => (
                <Bar 
                  key={type}
                  dataKey={type} 
                  stackId="a"
                  fill={colors[type] || '#6B7280'} 
                  name={type.replace(/_/g, ' ')}
                />
              ))
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {groupBy === 'channel' ? (
          ['phone', 'email', 'text', 'ai_agent'].map(channel => {
            const total = trendData.reduce((sum, day) => sum + (day[channel] || 0), 0);
            return (
              <div key={channel} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 capitalize mb-1">
                  {channel === 'ai_agent' ? 'AI Agent' : channel}
                </p>
                <p className="text-2xl font-bold text-gray-800">{total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((total / communications.length) * 100).toFixed(1)}% of total
                </p>
              </div>
            );
          })
        ) : (
          topRequestTypes.slice(0, 4).map(type => {
            const total = trendData.reduce((sum, day) => sum + (day[type] || 0), 0);
            return (
              <div key={type} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <p className="text-2xl font-bold text-gray-800">{total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((total / communications.length) * 100).toFixed(1)}% of total
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}