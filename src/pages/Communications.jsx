import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import { Phone, Mail, MessageSquare, User, Clock, ChevronRight, Search, Filter, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ExportShareButtons from '../components/communication/ExportShareButtons';

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

export default function Communications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [handledByFilter, setHandledByFilter] = useState('all');

  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: async () => {
      const comms = await base44.entities.PatientCommunication.list('-timestamp', 1000);
      
      const getDummyDOB = (name) => {
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const year = 1950 + (hash % 50);
        const month = (hash % 12) + 1;
        const day = (hash % 28) + 1;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      };
      const getDummyAddress = (name) => {
        const addresses = ['123 Main St, Springfield, IL 62701', '456 Oak Ave, Portland, OR 97201', '789 Pine Rd, Austin, TX 78701'];
        return addresses[name.length % addresses.length];
      };
      const getDummyAllergies = (name) => {
        const allergies = ['Penicillin, Peanuts', 'Shellfish, Latex', 'Sulfa drugs, Bee stings'];
        return allergies[name.length % allergies.length];
      };
      const getDummyMedications = (name) => {
        const meds = ['Lisinopril 10mg, Metformin 500mg', 'Levothyroxine 50mcg, Omeprazole 20mg', 'Amlodipine 5mg, Simvastatin 40mg'];
        return meds[name.length % meds.length];
      };
      const getDummyConditions = (name) => {
        const conditions = ['Hypertension, Type 2 Diabetes', 'Hypothyroidism, GERD', 'Hypertension, Anxiety'];
        return conditions[name.length % conditions.length];
      };
      const getDummyInsurance = (name) => {
        const insurances = ['Blue Cross Blue Shield PPO', 'United Healthcare HMO', 'Aetna PPO'];
        return insurances[name.length % insurances.length];
      };
      
      return comms.map(comm => ({
        ...comm,
        patient_date_of_birth: comm.patient_date_of_birth || getDummyDOB(comm.patient_name),
        patient_address: comm.patient_address || getDummyAddress(comm.patient_name),
        patient_allergies: comm.patient_allergies || getDummyAllergies(comm.patient_name),
        current_medications: comm.current_medications || getDummyMedications(comm.patient_name),
        known_conditions: comm.known_conditions || getDummyConditions(comm.patient_name),
        insurance_provider: comm.insurance_provider || getDummyInsurance(comm.patient_name),
        preferred_contact_method: comm.preferred_contact_method || 'email'
      }));
    }
  });

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.message_content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = channelFilter === 'all' || comm.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
    const matchesHandledBy = handledByFilter === 'all' || comm.handled_by_type === handledByFilter;
    
    return matchesSearch && matchesChannel && matchesStatus && matchesHandledBy;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">All Communications</h1>
          <p className="text-gray-600">View and manage all patient communications</p>
        </div>
        <ExportShareButtons data={filteredCommunications} filename="all-communications" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Channel</label>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="ai_agent">AI Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Handled By</label>
            <Select value={handledByFilter} onValueChange={setHandledByFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ai_agent">AI Agent</SelectItem>
                <SelectItem value="representative">Representative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Communications List */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {filteredCommunications.length} Communications
          </h3>
        </div>

        <div className="space-y-3">
          {filteredCommunications.map(comm => {
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
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-600">
                              {comm.request_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General Inquiry'}
                            </p>
                            {comm.handled_by_type && (
                              <Badge variant="outline" className="text-xs">
                                {comm.handled_by_type === 'ai_agent' ? '🤖 AI' : '👤 Human'}
                              </Badge>
                            )}
                            {comm.escalated_to_human && (
                              <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                Escalated
                              </Badge>
                            )}
                          </div>
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
          })}
        </div>
      </div>
    </div>
  );
}