import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ExportShareButtons from '../components/communication/ExportShareButtons';
import AdvancedFilters from '../components/search/AdvancedFilters';
import CommunicationItem from '../components/communication/CommunicationItem';

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
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [handledByFilter, setHandledByFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState({
    patientSearch: '',
    rxNumber: '',
    status: 'all',
    channel: 'all',
    requestType: 'all',
    handledBy: 'all',
    patientName: 'all',
    dateFrom: '',
    dateTo: ''
  });

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

  // Get unique patient names for filter
  const uniquePatients = [...new Set(communications.map(c => c.patient_name))].sort();

  const filteredCommunications = communications.filter(comm => {
    // Basic search
    const matchesSearch = searchTerm === '' || 
      comm.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.message_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.patient_phone?.includes(searchTerm);
    
    // Advanced filters
    const matchesPatientSearch = !advancedFilters.patientSearch || 
      comm.patient_name?.toLowerCase().includes(advancedFilters.patientSearch.toLowerCase()) ||
      comm.patient_email?.toLowerCase().includes(advancedFilters.patientSearch.toLowerCase()) ||
      comm.patient_phone?.includes(advancedFilters.patientSearch) ||
      comm.patient_id?.toLowerCase().includes(advancedFilters.patientSearch.toLowerCase());

    const matchesRxNumber = !advancedFilters.rxNumber || 
      comm.prescription_number?.toLowerCase().includes(advancedFilters.rxNumber.toLowerCase());

    const matchesAdvStatus = advancedFilters.status === 'all' || comm.status === advancedFilters.status;
    const matchesAdvChannel = advancedFilters.channel === 'all' || comm.channel === advancedFilters.channel;
    const matchesRequestType = advancedFilters.requestType === 'all' || comm.request_type === advancedFilters.requestType;
    
    const matchesAdvHandledBy = advancedFilters.handledBy === 'all' || 
      (advancedFilters.handledBy === 'ai_agent' && comm.handled_by_type === 'ai_agent') ||
      (advancedFilters.handledBy === 'representative' && comm.handled_by_type === 'representative') ||
      (advancedFilters.handledBy === 'escalated' && comm.escalated_to_human) ||
      (advancedFilters.handledBy === 'unassigned' && !comm.handled_by);

    const matchesPatientName = advancedFilters.patientName === 'all' || comm.patient_name === advancedFilters.patientName;

    // Date range filter
    const commDate = new Date(comm.date);
    const matchesDateFrom = !advancedFilters.dateFrom || commDate >= new Date(advancedFilters.dateFrom);
    const matchesDateTo = !advancedFilters.dateTo || commDate <= new Date(advancedFilters.dateTo);

    // Legacy filters
    const matchesChannel = channelFilter === 'all' || comm.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
    const matchesHandledBy = handledByFilter === 'all' || comm.handled_by_type === handledByFilter;
    
    return matchesSearch && matchesPatientSearch && matchesRxNumber && matchesAdvStatus && matchesAdvChannel && 
           matchesRequestType && matchesAdvHandledBy && matchesPatientName && matchesDateFrom && matchesDateTo &&
           matchesChannel && matchesStatus && matchesHandledBy;
  });

  const activeFilterCount = Object.values(advancedFilters).filter(val => {
    if (typeof val === 'string') return val && val !== 'all';
    return val;
  }).length;

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setAdvancedFilters({
      patientSearch: '',
      rxNumber: '',
      status: 'all',
      channel: 'all',
      requestType: 'all',
      handledBy: 'all',
      patientName: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setChannelFilter('all');
    setStatusFilter('all');
    setHandledByFilter('all');
  };

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

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Quick search by patient name, email, phone, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <AdvancedFilters
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            onClearFilters={() => setAdvancedFilters({
              patientSearch: '',
              rxNumber: '',
              status: 'all',
              channel: 'all',
              requestType: 'all',
              handledBy: 'all',
              patientName: 'all',
              dateFrom: '',
              dateTo: ''
            })}
            patients={uniquePatients}
          />
        </div>

        {/* Active Filters Display */}
        {(activeFilterCount > 0 || searchTerm) && (
          <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            {searchTerm && (
              <Badge variant="outline" className="bg-[#8B1F1F]/10 text-[#8B1F1F] border-[#8B1F1F]/30">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {advancedFilters.patientSearch && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Patient: "{advancedFilters.patientSearch}"
                <button onClick={() => setAdvancedFilters({...advancedFilters, patientSearch: ''})} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {advancedFilters.rxNumber && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Rx #: "{advancedFilters.rxNumber}"
                <button onClick={() => setAdvancedFilters({...advancedFilters, rxNumber: ''})} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {advancedFilters.status !== 'all' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Status: {advancedFilters.status.replace(/_/g, ' ')}
                <button onClick={() => setAdvancedFilters({...advancedFilters, status: 'all'})} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {advancedFilters.channel !== 'all' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Channel: {advancedFilters.channel}
                <button onClick={() => setAdvancedFilters({...advancedFilters, channel: 'all'})} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {advancedFilters.requestType !== 'all' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Type: {advancedFilters.requestType.replace(/_/g, ' ')}
                <button onClick={() => setAdvancedFilters({...advancedFilters, requestType: 'all'})} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {advancedFilters.handledBy !== 'all' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Handled: {advancedFilters.handledBy.replace(/_/g, ' ')}
                <button onClick={() => setAdvancedFilters({...advancedFilters, handledBy: 'all'})} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {advancedFilters.patientName !== 'all' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Patient: {advancedFilters.patientName}
                <button onClick={() => setAdvancedFilters({...advancedFilters, patientName: 'all'})} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {(advancedFilters.dateFrom || advancedFilters.dateTo) && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Date: {advancedFilters.dateFrom || 'Start'} - {advancedFilters.dateTo || 'End'}
                <button onClick={() => setAdvancedFilters({...advancedFilters, dateFrom: '', dateTo: ''})} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-[#8B1F1F] hover:text-[#721919] ml-auto"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Communications List */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {filteredCommunications.length} Communication{filteredCommunications.length !== 1 ? 's' : ''}
            </h3>
            {filteredCommunications.length !== communications.length && (
              <p className="text-sm text-gray-500 mt-1">
                Filtered from {communications.length} total communication{communications.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {filteredCommunications.length !== communications.length && (
            <span className="text-sm text-[#8B1F1F] font-medium">
              {activeFilterCount + (searchTerm ? 1 : 0)} filter{(activeFilterCount + (searchTerm ? 1 : 0)) !== 1 ? 's' : ''} applied
            </span>
          )}
        </div>

        <div className="space-y-3">
          {filteredCommunications.map(comm => (
            <CommunicationItem key={comm.id} comm={comm} />
          ))}
        </div>
      </div>
    </div>
  );
}