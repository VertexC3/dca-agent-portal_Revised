import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Phone, Mail, MessageSquare, User, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ExportShareButtons from '../components/communication/ExportShareButtons';

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

export default function DailyView() {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDate = urlParams.get('date');

  const { data: allCommunications = [], isLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: () => base44.entities.PatientCommunication.list('-timestamp', 1000)
  });

  const dailyCommunications = allCommunications.filter(c => c.date === selectedDate);

  // Group by channel
  const byChannel = {
    phone: dailyCommunications.filter(c => c.channel === 'phone'),
    email: dailyCommunications.filter(c => c.channel === 'email'),
    text: dailyCommunications.filter(c => c.channel === 'text')
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to={createPageUrl('Dashboard')}
            className="p-2 rounded-lg backdrop-blur-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              {selectedDate ? format(new Date(selectedDate), 'MMMM d, yyyy') : 'Daily View'}
            </h1>
            <p className="text-white/70">{dailyCommunications.length} communications on this day</p>
          </div>
        </div>
        <ExportShareButtons data={dailyCommunications} filename={`communications-${selectedDate}`} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-white" />
            <span className="text-white/70">Total</span>
          </div>
          <p className="text-3xl font-bold text-white">{dailyCommunications.length}</p>
        </div>
        
        {Object.entries(byChannel).map(([channel, comms]) => {
          const Icon = channelIcons[channel];
          return (
            <div key={channel} className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-6 h-6 text-white" />
                <span className="text-white/70 capitalize">{channel}</span>
              </div>
              <p className="text-3xl font-bold text-white">{comms.length}</p>
            </div>
          );
        })}
      </div>

      {/* Communications List */}
      <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">All Communications</h2>
        
        {dailyCommunications.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No communications found for this date</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dailyCommunications.map(comm => {
              const ChannelIcon = channelIcons[comm.channel];
              return (
                <Link
                  key={comm.id}
                  to={createPageUrl(`CommunicationDetail?id=${comm.id}`)}
                  className="block group"
                >
                  <div className="backdrop-blur-lg bg-white/10 hover:bg-white/20 rounded-xl p-5 border border-white/20 hover:border-white/40 transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${channelColors[comm.channel]} border backdrop-blur-sm`}>
                        <ChannelIcon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                              <User className="w-5 h-5" />
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
                        
                        <p className="text-white/80 mb-3 line-clamp-2">
                          {comm.message_content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(comm.timestamp || comm.date), 'h:mm a')}
                          </span>
                          {comm.patient_phone && <span>{comm.patient_phone}</span>}
                          {comm.patient_email && <span className="truncate max-w-[250px]">{comm.patient_email}</span>}
                        </div>
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