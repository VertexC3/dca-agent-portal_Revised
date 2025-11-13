import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkflowBuilder from '../components/automation/WorkflowBuilder';
import AutomationQueue from '../components/automation/AutomationQueue';
import PrescriptionQueue from '../components/automation/PrescriptionQueue';

export default function Automation() {
  const [activeTab, setActiveTab] = useState('workflows');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Automation Hub</h1>
        <p className="text-gray-600">Create and manage automated workflows and actions</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger 
            value="workflows"
            className="data-[state=active]:bg-[#8B1F1F] data-[state=active]:text-white"
          >
            Workflow Rules
          </TabsTrigger>
          <TabsTrigger 
            value="queue"
            className="data-[state=active]:bg-[#8B1F1F] data-[state=active]:text-white"
          >
            Automation Queue
          </TabsTrigger>
          <TabsTrigger 
            value="prescriptions"
            className="data-[state=active]:bg-[#8B1F1F] data-[state=active]:text-white"
          >
            Prescription Queue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="mt-6">
          <WorkflowBuilder />
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          <AutomationQueue />
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          <PrescriptionQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
}