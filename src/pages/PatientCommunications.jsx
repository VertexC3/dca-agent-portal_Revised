import React from 'react';
import { MessageSquare, Phone, Mail, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const channelIcons = {
  phone: Phone,
  email: Mail,
  text: MessageSquare,
  ai_agent: Bot
};

const channelColors = {
  phone: 'bg-blue-50 text-blue-700 border-blue-200',
  email: 'bg-[#8B1F1F]/10 text-[#8B1F1F] border-[#8B1F1F]/30',
  text: 'bg-green-50 text-green-700 border-green-200',
  ai_agent: 'bg-purple-50 text-purple-700 border-purple-200'
};

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200'
};

// Mock communications data
const mockCommunications = [
  {
    id: '1',
    request_type: 'prescription_refill',
    channel: 'email',
    message_content: 'I would like to request a refill for my Lisinopril prescription.',
    timestamp: '2025-11-15T10:30:00Z',
    status: 'resolved',
    response_sent: 'Your refill has been processed and is ready for pickup.'
  },
  {
    id: '2',
    request_type: 'delivery_status',
    channel: 'phone',
    message_content: 'Could you please check the status of my recent order?',
    timestamp: '2025-11-12T14:20:00Z',
    status: 'resolved',
    response_sent: 'Your order is currently out for delivery and should arrive today.'
  },
  {
    id: '3',
    request_type: 'billing_question',
    channel: 'text',
    message_content: 'I have a question about my recent invoice.',
    timestamp: '2025-11-10T09:15:00Z',
    status: 'in_progress'
  },
  {
    id: '4',
    request_type: 'medication_inquiry',
    channel: 'ai_agent',
    message_content: 'What are the side effects of Metformin?',
    timestamp: '2025-11-08T16:45:00Z',
    status: 'resolved',
    response_sent: 'Common side effects include nausea, diarrhea, and stomach upset. Please consult your doctor if symptoms persist.'
  }
];

export default function PatientCommunications() {
  const communications = mockCommunications;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">My Communications</h1>
        <p className="text-gray-600">View all your communications with DCA Pharmacy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-2xl font-bold text-gray-800">{communications.length}</p>
          <p className="text-sm text-gray-600">Total Communications</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-2xl font-bold text-yellow-600">
            {communications.filter(c => c.status === 'pending').length}
          </p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">
            {communications.filter(c => c.status === 'in_progress').length}
          </p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-2xl font-bold text-green-600">
            {communications.filter(c => c.status === 'resolved').length}
          </p>
          <p className="text-sm text-gray-600">Resolved</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Communication History</h2>
        {communications.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No communications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {communications.map(comm => {
              const ChannelIcon = channelIcons[comm.channel];
              return (
                <Link
                  key={comm.id}
                  to={createPageUrl(`PatientCommunicationDetail?id=${comm.id}`)}
                  className="block"
                >
                  <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 border border-gray-200 hover:border-[#8B1F1F] transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${channelColors[comm.channel]} border`}>
                        <ChannelIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {comm.request_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {format(new Date(comm.timestamp || comm.date), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <Badge className={`${statusColors[comm.status]} border`}>
                            {comm.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-2">
                          {comm.message_content}
                        </p>
                        {comm.response_sent && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs text-green-800 font-semibold">✓ Response received</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}