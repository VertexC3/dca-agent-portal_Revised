import React, { useState } from 'react';
import { Link } from '@/lib/router';
import { createPageUrl } from '../../utils';
import { format } from 'date-fns';
import { Phone, Mail, MessageSquare, Clock, User, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const channelIcons = {
  phone: Phone,
  email: Mail,
  text: MessageSquare,
  ai_agent: MessageSquare
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

export default function CommunicationItem({ comm }) {
  const [expanded, setExpanded] = useState(false);
  const ChannelIcon = channelIcons[comm.channel] || MessageSquare;

  return (
    <div
      className={`bg-gray-50 rounded-xl border transition-all cursor-pointer ${
        expanded ? 'border-[#8B1F1F] shadow-md' : 'border-gray-200 hover:border-[#8B1F1F] hover:shadow-md hover:bg-gray-100'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${channelColors[comm.channel] || 'bg-gray-50 text-gray-700 border-gray-200'} border flex-shrink-0`}>
            <ChannelIcon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {comm.patient_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {comm.request_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General Inquiry'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={`${statusColors[comm.status] || 'bg-gray-50 text-gray-700 border-gray-200'} border`}>
                  {comm.status?.replace(/_/g, ' ')}
                </Badge>
                {expanded ? (
                  <ChevronDown className="w-5 h-5 text-[#8B1F1F]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            <p className={`text-gray-700 text-sm mb-3 ${expanded ? '' : 'line-clamp-2'}`}>
              {comm.message_content}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(comm.timestamp || comm.date), 'MMM d, yyyy h:mm a')}
              </span>
              {comm.patient_phone && <span>{comm.patient_phone}</span>}
              {comm.patient_email && <span className="truncate max-w-[200px]">{comm.patient_email}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-200 mt-1">
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="space-y-2 text-sm">
              {comm.channel && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Channel</span>
                  <p className="text-gray-800 capitalize">{comm.channel.replace(/_/g, ' ')}</p>
                </div>
              )}
              {comm.handled_by && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Handled By</span>
                  <p className="text-gray-800">{comm.handled_by}</p>
                </div>
              )}
              {comm.handled_by_type && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Handler Type</span>
                  <p className="text-gray-800 capitalize">{comm.handled_by_type.replace(/_/g, ' ')}</p>
                </div>
              )}
              {comm.response_time_minutes != null && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Response Time</span>
                  <p className="text-gray-800">{comm.response_time_minutes} min</p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {comm.patient_date_of_birth && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date of Birth</span>
                  <p className="text-gray-800">{format(new Date(comm.patient_date_of_birth), 'MMM d, yyyy')}</p>
                </div>
              )}
              {comm.patient_address && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</span>
                  <p className="text-gray-800">{comm.patient_address}</p>
                </div>
              )}
              {comm.insurance_provider && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Insurance</span>
                  <p className="text-gray-800">{comm.insurance_provider}</p>
                </div>
              )}
              {comm.escalated_to_human && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Escalated</span>
                  <p className="text-orange-600 font-medium">Escalated to Human</p>
                </div>
              )}
            </div>
          </div>

          {comm.recommended_response && (
            <div className="mt-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recommended Response</span>
              <p className="text-sm text-gray-700 mt-1 bg-blue-50 rounded-lg p-2 border border-blue-100">{comm.recommended_response}</p>
            </div>
          )}

          {comm.response_sent && (
            <div className="mt-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Response Sent</span>
              <p className="text-sm text-gray-700 mt-1 bg-green-50 rounded-lg p-2 border border-green-100">{comm.response_sent}</p>
            </div>
          )}

          <div className="mt-3 flex justify-end">
            <Link
              to={createPageUrl(`CommunicationDetail?id=${comm.id}`)}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-semibold text-[#8B1F1F] hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Full Detail
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}