import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KnowledgeBaseManager from '../components/training/KnowledgeBaseManager';
import FeedbackManager from '../components/training/FeedbackManager';
import TrainingMetrics from '../components/training/TrainingMetrics';

export default function AITraining() {
  const [activeTab, setActiveTab] = useState('knowledge');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Training Module</h1>
        <p className="text-gray-600">Improve AI accuracy through knowledge base management and feedback</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger 
            value="knowledge"
            className="data-[state=active]:bg-[#8B1F1F] data-[state=active]:text-white"
          >
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger 
            value="feedback"
            className="data-[state=active]:bg-[#8B1F1F] data-[state=active]:text-white"
          >
            Training Feedback
          </TabsTrigger>
          <TabsTrigger 
            value="metrics"
            className="data-[state=active]:bg-[#8B1F1F] data-[state=active]:text-white"
          >
            Metrics & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeBaseManager />
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <FeedbackManager />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <TrainingMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
}