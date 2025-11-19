import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Star, TrendingUp, Smile, Frown, Meh } from 'lucide-react';

export default function SatisfactionAnalysis({ communications }) {
  // Add dummy data if no satisfaction data exists
  const dummySatisfactionData = [
    {
      patient_name: 'Sarah Johnson',
      satisfaction_score: 4,
      satisfaction_feedback: 'AI handled the refill quickly and efficiently.',
      request_type: 'prescription_refill',
      handled_by_type: 'ai_agent',
      channel: 'ai_agent',
      date: '2025-11-15',
      feedback_date: '2025-11-15'
    },
    {
      patient_name: 'Michael Chen',
      satisfaction_score: 5,
      satisfaction_feedback: 'Representative was very helpful and knowledgeable.',
      request_type: 'medication_inquiry',
      handled_by_type: 'representative',
      channel: 'phone',
      date: '2025-11-14',
      feedback_date: '2025-11-14'
    },
    {
      patient_name: 'Emily Rodriguez',
      satisfaction_score: 3,
      satisfaction_feedback: 'AI gave me general information, but couldn\'t pinpoint exact delivery.',
      request_type: 'delivery_status',
      handled_by_type: 'ai_agent',
      channel: 'text',
      date: '2025-11-13',
      feedback_date: '2025-11-13'
    },
    {
      patient_name: 'David Thompson',
      satisfaction_score: 2,
      satisfaction_feedback: 'Had to wait a long time to get a clear answer.',
      request_type: 'billing_question',
      handled_by_type: 'representative',
      channel: 'email',
      date: '2025-11-12',
      feedback_date: '2025-11-12'
    },
    {
      patient_name: 'Lisa Martinez',
      satisfaction_score: 5,
      satisfaction_feedback: 'Smooth refill process with the pharmacist.',
      request_type: 'prescription_refill',
      handled_by_type: 'representative',
      channel: 'phone',
      date: '2025-11-11',
      feedback_date: '2025-11-11'
    },
    {
      patient_name: 'James Wilson',
      satisfaction_score: 4,
      satisfaction_feedback: 'AI answered my simple question effectively.',
      request_type: 'general_inquiry',
      handled_by_type: 'ai_agent',
      channel: 'ai_agent',
      date: '2025-11-10',
      feedback_date: '2025-11-10'
    },
    {
      patient_name: 'Amanda Brown',
      satisfaction_score: 5,
      satisfaction_feedback: 'Spoke to a nurse who was very understanding and gave good advice.',
      request_type: 'side_effects',
      handled_by_type: 'representative',
      channel: 'phone',
      date: '2025-11-09',
      feedback_date: '2025-11-09'
    }
  ];

  const realSatisfactionData = communications.filter(c => c.satisfaction_score);
  const satisfactionData = realSatisfactionData.length > 0 ? realSatisfactionData : dummySatisfactionData;
  
  const avgSatisfaction = satisfactionData.length > 0
    ? (satisfactionData.reduce((sum, c) => sum + c.satisfaction_score, 0) / satisfactionData.length).toFixed(1)
    : 0;

  // Distribution by score
  const scoreDistribution = [1, 2, 3, 4, 5].map(score => ({
    name: `${score} Star${score > 1 ? 's' : ''}`,
    value: satisfactionData.filter(c => c.satisfaction_score === score).length,
    score
  }));

  // Distribution by handler type (AI vs Human)
  const handlerSatisfaction = ['ai_agent', 'representative'].map(handler => {
    const handlerComms = satisfactionData.filter(c => c.handled_by_type === handler);
    const avgScore = handlerComms.length > 0
      ? (handlerComms.reduce((sum, c) => sum + c.satisfaction_score, 0) / handlerComms.length).toFixed(1)
      : 0;
    
    return {
      handler: handler === 'ai_agent' ? 'AI Agent' : 'Human Representative',
      avgScore: parseFloat(avgScore),
      count: handlerComms.length
    };
  }).filter(c => c.count > 0);

  // Distribution by request type
  const requestTypeSatisfaction = [
    'prescription_refill',
    'medication_inquiry',
    'delivery_status',
    'billing_question',
    'side_effects',
    'appointment_scheduling',
    'insurance_question',
    'general_inquiry',
    'complaint',
    'other'
  ].map(type => {
    const typeComms = satisfactionData.filter(c => c.request_type === type);
    const avgScore = typeComms.length > 0
      ? (typeComms.reduce((sum, c) => sum + c.satisfaction_score, 0) / typeComms.length).toFixed(1)
      : 0;
    
    return {
      type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      avgScore: parseFloat(avgScore),
      count: typeComms.length
    };
  }).filter(c => c.count > 0).sort((a, b) => b.avgScore - a.avgScore);

  const COLORS = ['#EF4444', '#F59E0B', '#EAB308', '#84CC16', '#10B981'];

  const getSentimentIcon = (score) => {
    if (score >= 4) return <Smile className="w-6 h-6 text-green-600" />;
    if (score >= 3) return <Meh className="w-6 h-6 text-yellow-600" />;
    return <Frown className="w-6 h-6 text-red-600" />;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">Count: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
          <Star className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patient Satisfaction</h2>
          <p className="text-gray-600 text-sm">Feedback scores and sentiment analysis</p>
        </div>
      </div>

      {satisfactionData.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No satisfaction data available yet</p>
          <p className="text-sm mt-2">Feedback will appear here once patients rate their experience</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600">Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-4xl font-bold text-gray-800">{avgSatisfaction}</p>
                {getSentimentIcon(parseFloat(avgSatisfaction))}
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i <= Math.round(avgSatisfaction) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Total Feedback</span>
              </div>
              <p className="text-4xl font-bold text-gray-800">{satisfactionData.length}</p>
              <p className="text-xs text-gray-500 mt-2">
                {((satisfactionData.length / communications.length) * 100).toFixed(1)}% response rate
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Smile className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Satisfied Patients</span>
              </div>
              <p className="text-4xl font-bold text-gray-800">
                {((satisfactionData.filter(c => c.satisfaction_score >= 4).length / satisfactionData.length) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Rated 4-5 stars
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Distribution */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={scoreDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* AI vs Human Performance */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">AI vs Human</h3>
              <div className="space-y-4">
                {handlerSatisfaction.map((handler, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{handler.handler}</span>
                      <span className="text-sm font-bold text-gray-800">{handler.avgScore} / 5.0</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          handler.handler.includes('AI') 
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                            : 'bg-gradient-to-r from-[#8B1F1F] to-[#A52A2A]'
                        }`}
                        style={{ width: `${(handler.avgScore / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{handler.count} feedback responses</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Type Performance */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">By Request Type</h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {requestTypeSatisfaction.slice(0, 5).map((type, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">{type.type}</span>
                      <span className="text-xs font-bold text-gray-800">{type.avgScore}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        style={{ width: `${(type.avgScore / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">{type.count} responses</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Feedback</h3>
            <div className="space-y-3">
              {satisfactionData
                .filter(c => c.satisfaction_feedback)
                .slice(0, 5)
                .map((comm, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{comm.patient_name}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i <= comm.satisfaction_score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comm.feedback_date || comm.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{comm.satisfaction_feedback}"</p>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}