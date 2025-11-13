import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, Plus, Edit, Trash2, Play, Pause, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function WorkflowBuilder() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'keyword_match',
    trigger_keywords: '',
    trigger_request_types: '',
    trigger_channels: '',
    action_type: 'send_email',
    action_parameters: '{}',
    delay_minutes: 0,
    status: 'active',
    priority: 5
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['workflowRules'],
    queryFn: () => base44.entities.WorkflowRule.list('-priority', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkflowRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflowRules']);
      resetForm();
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkflowRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflowRules']);
      resetForm();
      setIsDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkflowRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflowRules']);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_type: 'keyword_match',
      trigger_keywords: '',
      trigger_request_types: '',
      trigger_channels: '',
      action_type: 'send_email',
      action_parameters: '{}',
      delay_minutes: 0,
      status: 'active',
      priority: 5
    });
    setEditingRule(null);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      trigger_type: rule.trigger_type,
      trigger_keywords: rule.trigger_keywords || '',
      trigger_request_types: rule.trigger_request_types || '',
      trigger_channels: rule.trigger_channels || '',
      action_type: rule.action_type,
      action_parameters: rule.action_parameters || '{}',
      delay_minutes: rule.delay_minutes || 0,
      status: rule.status,
      priority: rule.priority || 5
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingRule) {
      await updateMutation.mutateAsync({ id: editingRule.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this workflow rule?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const toggleStatus = async (rule) => {
    const newStatus = rule.status === 'active' ? 'inactive' : 'active';
    await updateMutation.mutateAsync({
      id: rule.id,
      data: { ...rule, status: newStatus }
    });
  };

  const statusColors = {
    active: 'bg-green-50 text-green-700 border-green-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-300',
    testing: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  };

  const actionTypeLabels = {
    send_email: 'Send Email',
    schedule_callback: 'Schedule Callback',
    create_task: 'Create Task',
    send_sms: 'Send SMS',
    escalate_to_human: 'Escalate to Human',
    send_followup: 'Send Follow-up',
    create_prescription_request: 'Create Prescription Request',
    update_status: 'Update Status'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Workflow Automation</h2>
            <p className="text-gray-600 text-sm">Create automated responses and actions</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#8B1F1F] hover:bg-[#721919] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Workflow' : 'Create New Workflow'}</DialogTitle>
              <DialogDescription>
                Define automated actions triggered by specific patient communications
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Workflow Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Auto Prescription Refill"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this workflow does..."
                    className="h-20"
                  />
                </div>

                <div>
                  <Label htmlFor="trigger_type">Trigger Type *</Label>
                  <Select value={formData.trigger_type} onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword_match">Keyword Match</SelectItem>
                      <SelectItem value="request_type">Request Type</SelectItem>
                      <SelectItem value="channel">Channel</SelectItem>
                      <SelectItem value="sentiment">Sentiment</SelectItem>
                      <SelectItem value="time_based">Time Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="action_type">Action Type *</Label>
                  <Select value={formData.action_type} onValueChange={(value) => setFormData({ ...formData, action_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_email">Send Email</SelectItem>
                      <SelectItem value="schedule_callback">Schedule Callback</SelectItem>
                      <SelectItem value="create_task">Create Task</SelectItem>
                      <SelectItem value="send_sms">Send SMS</SelectItem>
                      <SelectItem value="escalate_to_human">Escalate to Human</SelectItem>
                      <SelectItem value="send_followup">Send Follow-up</SelectItem>
                      <SelectItem value="create_prescription_request">Create Prescription Request</SelectItem>
                      <SelectItem value="update_status">Update Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.trigger_type === 'keyword_match' && (
                  <div className="col-span-2">
                    <Label htmlFor="trigger_keywords">Trigger Keywords</Label>
                    <Input
                      id="trigger_keywords"
                      value={formData.trigger_keywords}
                      onChange={(e) => setFormData({ ...formData, trigger_keywords: e.target.value })}
                      placeholder="refill, prescription, medication (comma-separated)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Keywords that will trigger this workflow</p>
                  </div>
                )}

                {formData.trigger_type === 'request_type' && (
                  <div className="col-span-2">
                    <Label htmlFor="trigger_request_types">Request Types</Label>
                    <Input
                      id="trigger_request_types"
                      value={formData.trigger_request_types}
                      onChange={(e) => setFormData({ ...formData, trigger_request_types: e.target.value })}
                      placeholder="prescription_refill, medication_inquiry (comma-separated)"
                    />
                  </div>
                )}

                {formData.trigger_type === 'channel' && (
                  <div className="col-span-2">
                    <Label htmlFor="trigger_channels">Channels</Label>
                    <Input
                      id="trigger_channels"
                      value={formData.trigger_channels}
                      onChange={(e) => setFormData({ ...formData, trigger_channels: e.target.value })}
                      placeholder="email, phone, text (comma-separated)"
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <Label htmlFor="action_parameters">Action Parameters (JSON)</Label>
                  <Textarea
                    id="action_parameters"
                    value={formData.action_parameters}
                    onChange={(e) => setFormData({ ...formData, action_parameters: e.target.value })}
                    placeholder='{"subject": "Prescription Ready", "template": "refill_confirmation"}'
                    className="h-24 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">JSON object with action-specific parameters</p>
                </div>

                <div>
                  <Label htmlFor="delay_minutes">Delay (minutes)</Label>
                  <Input
                    id="delay_minutes"
                    type="number"
                    min="0"
                    value={formData.delay_minutes}
                    onChange={(e) => setFormData({ ...formData, delay_minutes: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Wait time before executing action</p>
                </div>

                <div>
                  <Label htmlFor="priority">Priority (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#8B1F1F] hover:bg-[#721919]">
                  {editingRule ? 'Update' : 'Create'} Workflow
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Active Workflows</p>
          <p className="text-2xl font-bold text-gray-800">
            {rules.filter(r => r.status === 'active').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Total Executions</p>
          <p className="text-2xl font-bold text-gray-800">
            {rules.reduce((sum, r) => sum + (r.execution_count || 0), 0)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Avg Success Rate</p>
          <p className="text-2xl font-bold text-gray-800">
            {rules.length > 0 
              ? (rules.reduce((sum, r) => sum + (r.success_rate || 0), 0) / rules.length).toFixed(0)
              : 0}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Inactive</p>
          <p className="text-2xl font-bold text-gray-800">
            {rules.filter(r => r.status === 'inactive').length}
          </p>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No workflow rules created yet</p>
            <p className="text-sm mt-2">Create your first automated workflow to get started</p>
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-[#8B1F1F] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{rule.name}</h3>
                    <Badge className={`${statusColors[rule.status]} border text-xs`}>
                      {rule.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Priority: {rule.priority}
                    </Badge>
                  </div>
                  
                  {rule.description && (
                    <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>
                      <strong>Trigger:</strong> {rule.trigger_type.replace(/_/g, ' ')}
                      {rule.trigger_keywords && ` (${rule.trigger_keywords})`}
                    </span>
                    <span>
                      <strong>Action:</strong> {actionTypeLabels[rule.action_type]}
                    </span>
                    {rule.delay_minutes > 0 && (
                      <span><strong>Delay:</strong> {rule.delay_minutes}m</span>
                    )}
                    {rule.execution_count > 0 && (
                      <span><strong>Executed:</strong> {rule.execution_count}x</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(rule)}
                    className={rule.status === 'active' ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
                  >
                    {rule.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                    className="text-gray-600 hover:text-[#8B1F1F]"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}