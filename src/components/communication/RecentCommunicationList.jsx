import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { format } from 'date-fns';
import { Phone, Mail, MessageSquare, Clock, User, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const channelIcons = {
  phone: Phone,
  email: Mail,
  text: MessageSquare
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

export default function RecentCommunicationList({ communications, selectedChannel, selectedStatus, onChannelChange }) {
  const channels = ['all', 'email', 'phone', 'text', 'ai_agent'];

  const filteredCommunications = communications
    .filter(c => selectedChannel === 'all' || c.channel === selectedChannel)
    .filter(c => selectedStatus === 'all' || c.status === selectedStatus)
    .slice(0, 10);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recent Communications</h2>
        
        <div className="flex gap-2">
          {channels.map(channel => {
            const Icon = channelIcons[channel];
            return (
              <button
                key={channel}
                onClick={() => onChannelChange(channel)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedChannel === channel
                    ? 'bg-[#8B1F1F] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {channel === 'ai_agent' ? 'AI Agent' : channel.charAt(0).toUpperCase() + channel.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {filteredCommunications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No communications found</p>
          </div>
        ) : (
          filteredCommunications.map(comm => {
            const ChannelIcon = channelIcons[comm.channel];
            return (
              <Link
                key={comm.id}
                to={createPageUrl(`CommunicationDetail?id=${comm.id}`)}
                className="block group"
              >
                <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 border border-gray-200 hover:border-[#8B1F1F] transition-all hover:shadow-md cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${channelColors[comm.channel]} border`}>
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
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`${statusColors[comm.status]} border`}>
                            {comm.status.replace(/_/g, ' ')}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#8B1F1F] group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                        {comm.message_content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(comm.timestamp || comm.date), 'MMM d, yyyy h:mm a')}
                        </span>
                        {comm.patient_phone && (
                          <span>{comm.patient_phone}</span>
                        )}
                        {comm.patient_email && (
                          <span className="truncate max-w-[200px]">{comm.patient_email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}