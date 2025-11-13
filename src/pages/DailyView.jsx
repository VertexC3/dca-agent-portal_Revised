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
  phone: 'bg-blue-50 text-blue-700 border-blue-200',
  email: 'bg-[#8B1F1F]/10 text-[#8B1F1F] border-[#8B1F1F]/30',
  text: 'bg-green-50 text-green-700 border-green-200'
};

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200'
};

export default function DailyView() {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDate = urlParams.get('date');
  const [selectedChannel, setSelectedChannel] = React.useState('all');

  const { data: allCommunications = [], isLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: () => base44.entities.PatientCommunication.list('-timestamp', 1000)
  });

  const dailyCommunications = allCommunications.filter(c => c.date === selectedDate);
  
  const filteredCommunications = selectedChannel === 'all'
    ? dailyCommunications
    : dailyCommunications.filter(c => c.channel === selectedChannel);

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
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              {selectedDate ? format(new Date(selectedDate), 'MMMM d, yyyy') : 'Daily View'}
            </h1>
            <p className="text-gray-600">{dailyCommunications.length} communications on this day</p>
          </div>
        </div>
        <ExportShareButtons data={dailyCommunications} filename={`communications-${selectedDate}`} />
      </div>

      {/* Stats Cards - Now Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedChannel('all')}
          className={`bg-white rounded-2xl p-6 border shadow-lg transition-all hover:shadow-xl text-left ${
            selectedChannel === 'all' 
              ? 'border-[#8B1F1F] ring-2 ring-[#8B1F1F] ring-opacity-50' 
              : 'border-gray-200 hover:border-[#8B1F1F]'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className={`w-6 h-6 ${selectedChannel === 'all' ? 'text-[#8B1F1F]' : 'text-gray-600'}`} />
            <span className={`${selectedChannel === 'all' ? 'text-[#8B1F1F] font-semibold' : 'text-gray-600'}`}>Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{dailyCommunications.length}</p>
        </button>
        
        {Object.entries(byChannel).map(([channel, comms]) => {
          const Icon = channelIcons[channel];
          return (
            <button
              key={channel}
              onClick={() => setSelectedChannel(channel)}
              className={`bg-white rounded-2xl p-6 border shadow-lg transition-all hover:shadow-xl text-left ${
                selectedChannel === channel 
                  ? 'border-[#8B1F1F] ring-2 ring-[#8B1F1F] ring-opacity-50' 
                  : 'border-gray-200 hover:border-[#8B1F1F]'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-6 h-6 ${selectedChannel === channel ? 'text-[#8B1F1F]' : 'text-gray-600'}`} />
                <span className={`capitalize ${selectedChannel === channel ? 'text-[#8B1F1F] font-semibold' : 'text-gray-600'}`}>{channel}</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{comms.length}</p>
            </button>
          );
        })}
      </div>

      {/* Communications List */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedChannel === 'all' ? 'All Communications' : `${selectedChannel.charAt(0).toUpperCase() + selectedChannel.slice(1)} Communications`}
          </h2>
          <div className="text-sm text-gray-600">
            Showing {filteredCommunications.length} of {dailyCommunications.length} communications
          </div>
        </div>
        
        {filteredCommunications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No communications found for this filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCommunications.map(comm => {
              const ChannelIcon = channelIcons[comm.channel];
              return (
                <Link
                  key={comm.id}
                  to={createPageUrl(`CommunicationDetail?id=${comm.id}`)}
                  className="block group"
                >
                  <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-5 border border-gray-200 hover:border-[#8B1F1F] transition-all hover:shadow-md cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${channelColors[comm.channel]} border`}>
                        <ChannelIcon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                              <User className="w-5 h-5" />
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
                        
                        <p className="text-gray-700 mb-3 line-clamp-2">
                          {comm.message_content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
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