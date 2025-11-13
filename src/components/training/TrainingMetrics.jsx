import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Award, Target, Brain } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function TrainingMetrics() {
  const { data: feedbacks = [] } = useQuery({
    queryKey: ['aiTrainingFeedback'],
    queryFn: () => base44.entities.AITrainingFeedback.list('-created_date', 1000)
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['communications'],
    queryFn: () => base44.entities.PatientCommunication.list('-timestamp', 1000)
  });

  const { data: knowledgeBase = [] } = useQuery({
    queryKey: ['knowledgeBase'],
    queryFn: () => base44.entities.KnowledgeBase.list('-created_date', 100)
  });

  // AI Performance over time
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayFeedbacks = feedbacks.filter(f => f.created_date?.startsWith(dateStr));
    
    return {
      date: format(date, 'MMM d'),
      positive: dayFeedbacks.filter(f => f.feedback_type === 'positive').length,
      negative: dayFeedbacks.filter(f => f.feedback_type === 'negative').length,
      corrections: dayFeedbacks.filter(f => f.feedback_type === 'correction').length
    };
  });

  // Quality scores over time
  const qualityData = feedbacks
    .filter(f => f.conversation_quality)
    .slice(-30)
    .map((f, index) => ({
      index: index + 1,
      quality: f.conversation_quality,
      avgQuality: feedbacks
        .slice(0, feedbacks.indexOf(f) + 1)
        .filter(fb => fb.conversation_quality)
        .reduce((sum, fb) => sum + fb.conversation_quality, 0) / 
        feedbacks.slice(0, feedbacks.indexOf(f) + 1).filter(fb => fb.conversation_quality).length
    }));

  // Improvement areas
  const improvementAreas = feedbacks
    .filter(f => f.improvement_area)
    .reduce((acc, f) => {
      acc[f.improvement_area] = (acc[f.improvement_area] || 0) + 1;
      return acc;
    }, {});

  const improvementData = Object.entries(improvementAreas).map(([area, count]) => ({
    area: area.replace(/_/g, ' '),
    count
  }));

  const aiCommunications = communications.filter(c => c.handled_by_type === 'ai_agent');
  const aiWithFeedback = aiCommunications.filter(c => 
    feedbacks.some(f => f.communication_id === c.id)
  );

  const avgQuality = feedbacks
    .filter(f => f.conversation_quality)
    .reduce((sum, f) => sum + f.conversation_quality, 0) / 
    feedbacks.filter(f => f.conversation_quality).length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-50">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">AI Conversations</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{aiCommunications.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {aiWithFeedback.length} with feedback
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-yellow-50">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Avg Quality Score</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{avgQuality.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">Out of 5.0</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-50">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Training Applied</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {feedbacks.filter(f => f.training_status === 'applied').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Improvements made</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-50">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Knowledge Articles</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {knowledgeBase.filter(k => k.ai_enabled).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">AI enabled articles</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Trends */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={last30Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} name="Positive" />
              <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} name="Negative" />
              <Line type="monotone" dataKey="corrections" stroke="#F59E0B" strokeWidth={2} name="Corrections" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Improvement */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quality Score Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={qualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="index" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="quality" stroke="#8B1F1F" strokeWidth={2} name="Score" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="avgQuality" stroke="#3B82F6" strokeWidth={2} name="Avg Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Improvement Areas */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Areas for Improvement</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={improvementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="area" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B1F1F" name="Feedback Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}