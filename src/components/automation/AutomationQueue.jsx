import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AutomationQueue() {
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ['automatedActions'],
    queryFn: () => base44.entities.AutomatedAction.list('-created_date', 200)
  });

  const filteredActions = statusFilter === 'all' 
    ? actions 
    : actions.filter(a => a.status === statusFilter);

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200'
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    scheduled: <Calendar className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    failed: <XCircle className="w-4 h-4" />
  };

  const actionTypeLabels = {
    send_email: 'Email Sent',
    schedule_callback: 'Callback Scheduled',
    create_task: 'Task Created',
    send_sms: 'SMS Sent',
    escalate_to_human: 'Escalated',
    send_followup: 'Follow-up Sent',
    create_prescription_request: 'Rx Request Created',
    update_status: 'Status Updated'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Automation Queue</h2>
            <p className="text-gray-600 text-sm">Track automated actions and workflows</p>
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {actions.filter(a => a.status === 'pending').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-gray-600">Scheduled</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {actions.filter(a => a.status === 'scheduled').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {actions.filter(a => a.status === 'completed').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-gray-600">Failed</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {actions.filter(a => a.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No automated actions found</p>
          </div>
        ) : (
          filteredActions.map(action => (
            <div key={action.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={`${statusColors[action.status]} border text-xs flex items-center gap-1`}>
                    {statusIcons[action.status]}
                    {action.status}
                  </Badge>
                  <span className="font-medium text-gray-800">
                    {actionTypeLabels[action.action_type] || action.action_type}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(action.created_date), 'MMM d, h:mm a')}
                </span>
              </div>

              {action.patient_name && (
                <p className="text-sm text-gray-600 mb-2">
                  Patient: <span className="font-medium">{action.patient_name}</span>
                </p>
              )}

              {action.action_details && (
                <p className="text-sm text-gray-700 mb-2">{action.action_details}</p>
              )}

              {action.scheduled_for && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>Scheduled for: {format(new Date(action.scheduled_for), 'MMM d, yyyy h:mm a')}</span>
                </div>
              )}

              {action.executed_at && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Executed: {format(new Date(action.executed_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
              )}

              {action.result && (
                <div className="bg-green-50 rounded-lg p-2 mt-2 border border-green-200">
                  <p className="text-xs text-green-700">{action.result}</p>
                </div>
              )}

              {action.error_message && (
                <div className="bg-red-50 rounded-lg p-2 mt-2 border border-red-200">
                  <p className="text-xs text-red-700">{action.error_message}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}