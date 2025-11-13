import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Pill, CheckCircle, Clock, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PrescriptionQueue() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['prescriptionRequests'],
    queryFn: () => base44.entities.PrescriptionRequest.list('-created_date', 100)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PrescriptionRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['prescriptionRequests']);
    }
  });

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === statusFilter);

  const handleStatusChange = async (request, newStatus) => {
    const user = await base44.auth.me();
    await updateMutation.mutateAsync({
      id: request.id,
      data: {
        status: newStatus,
        ...(newStatus === 'ready' && { ready_for_pickup: true }),
        ...(newStatus !== 'pending' && { 
          processed_by: user.email,
          processed_date: new Date().toISOString()
        })
      }
    });
  };

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    ready: 'bg-green-50 text-green-700 border-green-200',
    completed: 'bg-gray-100 text-gray-700 border-gray-300',
    cancelled: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-green-50 border border-green-200">
            <Pill className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Prescription Queue</h2>
            <p className="text-gray-600 text-sm">Manage automated prescription refill requests</p>
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {['pending', 'processing', 'ready', 'completed', 'cancelled'].map(status => (
          <div key={status} className={`rounded-xl p-4 border ${statusColors[status]}`}>
            <p className="text-sm mb-1 capitalize">{status}</p>
            <p className="text-2xl font-bold">
              {requests.filter(r => r.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No prescription requests found</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div key={request.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{request.patient_name}</h3>
                    <Badge className={`${statusColors[request.status]} border text-xs`}>
                      {request.status}
                    </Badge>
                    {request.requested_via && (
                      <Badge variant="outline" className="text-xs">
                        {request.requested_via}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-700 mb-3">
                    <p><strong>Medication:</strong> {request.medication_name}</p>
                    {request.prescription_number && (
                      <p><strong>Rx #:</strong> {request.prescription_number}</p>
                    )}
                    {request.patient_phone && (
                      <p><strong>Phone:</strong> {request.patient_phone}</p>
                    )}
                    {request.patient_email && (
                      <p><strong>Email:</strong> {request.patient_email}</p>
                    )}
                  </div>

                  {request.notes && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                      <p className="text-xs text-gray-600 mb-1">Notes:</p>
                      <p className="text-sm text-gray-700">{request.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {format(new Date(request.created_date), 'MMM d, h:mm a')}</span>
                    {request.processed_by && (
                      <span>Processed by: {request.processed_by}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {request.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(request, 'processing')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Process
                    </Button>
                  )}
                  
                  {request.status === 'processing' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(request, 'ready')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Mark Ready
                    </Button>
                  )}
                  
                  {request.status === 'ready' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(request, 'completed')}
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}