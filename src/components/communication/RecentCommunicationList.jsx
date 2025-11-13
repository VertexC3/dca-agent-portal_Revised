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
  phone: 'bg-blue-500/20 text-blue-200 border-blue-300/30',
  email: 'bg-purple-500/20 text-purple-200 border-purple-300/30',
  text: 'bg-green-500/20 text-green-200 border-green-300/30'
};

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-300/30',
  in_progress: 'bg-blue-500/20 text-blue-200 border-blue-300/30',
  resolved: 'bg-green-500/20 text-green-200 border-green-300/30'
};

export default function RecentCommunicationList({ communications, selectedChannel, onChannelChange }) {
  const channels = ['all', 'email', 'phone', 'text'];

  const filteredCommunications = selectedChannel === 'all'
    ? communications
    : communications.filter(c => c.channel === selectedChannel);

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Recent Communications</h2>
        
        <div className="flex gap-2">
          {channels.map(channel => {
            const Icon = channelIcons[channel];
            return (
              <button
                key={channel}
                onClick={() => onChannelChange(channel)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedChannel === channel
                    ? 'bg-white/30 text-white backdrop-blur-sm border border-white/40 shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {channel.charAt(0).toUpperCase() + channel.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {filteredCommunications.length === 0 ? (
          <div className="text-center py-12 text-white/60">
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
                <div className="backdrop-blur-lg bg-white/10 hover:bg-white/20 rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${channelColors[comm.channel]} border backdrop-blur-sm`}>
                      <ChannelIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {comm.patient_name}
                          </h3>
                          <p className="text-sm text-white/70 mt-1">
                            {comm.request_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General Inquiry'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`${statusColors[comm.status]} border backdrop-blur-sm`}>
                            {comm.status.replace(/_/g, ' ')}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                      
                      <p className="text-white/80 text-sm line-clamp-2 mb-3">
                        {comm.message_content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-white/60">
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