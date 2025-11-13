import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Lightbulb, Plus } from 'lucide-react';

const WORKFLOW_TEMPLATES = [
  {
    name: 'Auto Prescription Refill',
    description: 'Automatically create prescription refill requests when patients mention "refill" and "prescription"',
    trigger_type: 'keyword_match',
    trigger_keywords: 'refill, prescription, medication, rx',
    action_type: 'create_prescription_request',
    action_parameters: JSON.stringify({
      auto_notify: true,
      priority: 'high'
    }),
    priority: 8,
    status: 'active'
  },
  {
    name: 'Schedule Follow-up Callback',
    description: 'Schedule a callback 24 hours after complex inquiries',
    trigger_type: 'request_type',
    trigger_request_types: 'side_effects, complaint',
    action_type: 'schedule_callback',
    action_parameters: JSON.stringify({
      callback_window: '24_hours',
      priority: 'high'
    }),
    delay_minutes: 1440,
    priority: 7,
    status: 'active'
  },
  {
    name: 'Escalate Urgent Issues',
    description: 'Immediately escalate messages containing urgent keywords to human representatives',
    trigger_type: 'keyword_match',
    trigger_keywords: 'urgent, emergency, severe, allergic reaction, hospital',
    action_type: 'escalate_to_human',
    action_parameters: JSON.stringify({
      notify_team: true,
      priority: 'critical'
    }),
    priority: 10,
    status: 'active'
  },
  {
    name: 'Send Delivery Status Updates',
    description: 'Auto-respond to delivery inquiries with tracking information',
    trigger_type: 'request_type',
    trigger_request_types: 'delivery_status',
    action_type: 'send_email',
    action_parameters: JSON.stringify({
      template: 'delivery_update',
      include_tracking: true
    }),
    priority: 6,
    status: 'active'
  },
  {
    name: 'Insurance Verification Follow-up',
    description: 'Send follow-up email 2 hours after insurance questions',
    trigger_type: 'request_type',
    trigger_request_types: 'insurance_question',
    action_type: 'send_followup',
    action_parameters: JSON.stringify({
      template: 'insurance_followup',
      include_faq: true
    }),
    delay_minutes: 120,
    priority: 5,
    status: 'active'
  },
  {
    name: 'Billing Inquiry Task Creation',
    description: 'Create task for billing team when billing questions arrive',
    trigger_type: 'request_type',
    trigger_request_types: 'billing_question',
    action_type: 'create_task',
    action_parameters: JSON.stringify({
      assign_to: 'billing_team',
      due_in_hours: 24
    }),
    priority: 6,
    status: 'active'
  }
];

export default function WorkflowTemplates({ onTemplateApplied }) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkflowRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflowRules']);
      if (onTemplateApplied) onTemplateApplied();
    }
  });

  const handleApplyTemplate = async (template) => {
    await createMutation.mutateAsync(template);
    alert(`Template "${template.name}" has been applied!`);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-purple-500">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Quick Start Templates</h3>
          <p className="text-sm text-gray-600">Apply pre-built workflow templates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WORKFLOW_TEMPLATES.map((template, index) => (
          <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition-all">
            <h4 className="font-semibold text-gray-800 mb-2">{template.name}</h4>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
            
            <Button
              onClick={() => handleApplyTemplate(template)}
              size="sm"
              disabled={createMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Apply Template
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}