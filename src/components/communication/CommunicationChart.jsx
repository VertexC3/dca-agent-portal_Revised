import React, { useState } from 'react';
import { Link } from '@/lib/router';
import { createPageUrl } from '../../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CommunicationChart({ communications }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [timePeriod, setTimePeriod] = useState('30'); // '7', '14', '30', '180'

  const generateChartData = () => {
    const days = timePeriod === '180' ? 180 : parseInt(timePeriod);
    
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayComms = communications.filter(c => c.date === dateStr);
      
      const channelCounts = {
        date: dateStr,
        displayDate: days <= 30 ? format(date, 'MMM d') : format(date, 'M/d'),
        phone: dayComms.filter(c => c.channel === 'phone').length,
        email: dayComms.filter(c => c.channel === 'email').length,
        text: dayComms.filter(c => c.channel === 'text').length,
        ai_agent: dayComms.filter(c => c.channel === 'ai_agent').length,
        escalated: dayComms.filter(c => c.escalated_to_human).length,
      };
      
      return channelCounts;
    });
  };

  const chartData = generateChartData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = (data.phone || 0) + (data.email || 0) + (data.text || 0) + (data.ai_agent || 0);
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl min-w-[200px]">
          <p className="text-gray-800 font-semibold mb-2">{data.displayDate}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-600">Phone:</span>
              <span className="font-medium">{data.phone || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B1F1F]">Email:</span>
              <span className="font-medium">{data.email || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Text:</span>
              <span className="font-medium">{data.text || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-600">AI Agent:</span>
              <span className="font-medium">{data.ai_agent || 0}</span>
            </div>
            {data.escalated > 0 && (
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className="text-orange-600">Escalated:</span>
                <span className="font-medium">{data.escalated}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1 mt-1 font-semibold">
              <span className="text-gray-800">Total:</span>
              <span>{total}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data) => {
    if (data && data.date) {
      window.location.href = createPageUrl(`DailyView?date=${data.date}`);
    }
  };

  const timePeriods = [
    { value: '7', label: 'Last 7 Days' },
    { value: '14', label: 'Last 14 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '180', label: 'Last 6 Months' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#8B1F1F]/10 border border-[#8B1F1F]/30">
            <Calendar className="w-6 h-6 text-[#8B1F1F]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Communication Trends</h2>
            <p className="text-gray-600 text-sm">Click on any bar to view details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {timePeriods.map(period => (
              <Button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                variant="ghost"
                size="sm"
                className={`text-xs ${
                  timePeriod === period.value 
                    ? 'bg-[#8B1F1F] text-white hover:bg-[#721919] hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </Button>
            ))}
          </div>
          
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="text-gray-600"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
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
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar 
                  dataKey="phone" 
                  stackId="a"
                  fill="#3B82F6"
                  name="Phone"
                  onClick={handleBarClick}
                  cursor="pointer"
                />
                <Bar 
                  dataKey="email" 
                  stackId="a"
                  fill="#8B1F1F"
                  name="Email"
                  onClick={handleBarClick}
                  cursor="pointer"
                />
                <Bar 
                  dataKey="text" 
                  stackId="a"
                  fill="#10B981"
                  name="Text"
                  onClick={handleBarClick}
                  cursor="pointer"
                />
                <Bar 
                  dataKey="ai_agent" 
                  stackId="a"
                  fill="#A855F7"
                  name="AI Agent"
                  onClick={handleBarClick}
                  cursor="pointer"
                />
                <Bar 
                  dataKey="escalated" 
                  stackId="a"
                  fill="#F59E0B"
                  name="Escalated"
                  onClick={handleBarClick}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-gray-600 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Click on any bar to view all communications for that day</span>
          </div>
        </>
      )}
    </div>
  );
}