import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { Phone, Mail, MessageSquare, Clock, User, ChevronRight, ChevronDown, Filter, ArrowUpDown, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

function CommunicationItem({ comm }) {
  const [expanded, setExpanded] = useState(false);
  const ChannelIcon = channelIcons[comm.channel];

  return (
    <div
      className={`bg-gray-50 rounded-xl border transition-all cursor-pointer ${
        expanded ? 'border-[#8B1F1F] shadow-md' : 'border-gray-200 hover:border-[#8B1F1F] hover:shadow-md hover:bg-gray-100'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${channelColors[comm.channel]} border flex-shrink-0`}>
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
                <Badge className={`${statusColors[comm.status]} border`}>
                  {comm.status.replace(/_/g, ' ')}
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
            {/* Left column */}
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

            {/* Right column */}
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

export default function RecentCommunicationList({ 
  communications, 
  selectedChannel, 
  selectedStatus,
  selectedRequestType,
  selectedStaff,
  dateFrom,
  dateTo,
  sortBy,
  onChannelChange,
  onStatusChange,
  onRequestTypeChange,
  onStaffChange,
  onDateFromChange,
  onDateToChange,
  onSortChange
}) {
  const [showFilters, setShowFilters] = useState(false);

  // Get unique staff members
  const staffMembers = [...new Set(communications.map(c => c.handled_by).filter(Boolean))];

  // Calculate urgency score for sorting
  const getUrgencyScore = (comm) => {
    let score = 0;
    if (comm.status === 'pending') score += 10;
    if (comm.status === 'in_progress') score += 5;
    if (comm.request_type === 'side_effects') score += 15;
    if (comm.request_type === 'complaint') score += 10;
    if (comm.escalated_to_human) score += 8;
    
    // Factor in time elapsed
    const hoursElapsed = (new Date() - new Date(comm.timestamp || comm.date)) / (1000 * 60 * 60);
    if (hoursElapsed > 24) score += 5;
    if (hoursElapsed > 48) score += 10;
    
    return score;
  };

  // Filter and sort communications
  let filteredCommunications = communications
    .filter(c => selectedChannel === 'all' || c.channel === selectedChannel)
    .filter(c => selectedStatus === 'all' || c.status === selectedStatus)
    .filter(c => selectedRequestType === 'all' || c.request_type === selectedRequestType)
    .filter(c => {
      if (selectedStaff === 'all') return true;
      if (selectedStaff === 'unassigned') return !c.handled_by;
      return c.handled_by === selectedStaff;
    })
    .filter(c => {
      if (!dateFrom && !dateTo) return true;
      const commDate = new Date(c.date);
      if (dateFrom && dateTo) {
        return isWithinInterval(commDate, {
          start: parseISO(dateFrom),
          end: parseISO(dateTo)
        });
      }
      if (dateFrom) return commDate >= parseISO(dateFrom);
      if (dateTo) return commDate <= parseISO(dateTo);
      return true;
    });

  // Apply sorting
  if (sortBy === 'urgency') {
    filteredCommunications = filteredCommunications.sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a));
  } else if (sortBy === 'oldest') {
    filteredCommunications = filteredCommunications.sort((a, b) => 
      new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date)
    );
  } else {
    // recent (default)
    filteredCommunications = filteredCommunications.sort((a, b) => 
      new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
    );
  }

  filteredCommunications = filteredCommunications.slice(0, 50);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recent Communications</h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              showFilters
                ? 'bg-[#8B1F1F] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters & Sort
          </button>
        </div>
      </div>

      {/* Filters and Sorting Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Channel Filter */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">Channel</Label>
              <Select value={selectedChannel} onValueChange={onChannelChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="ai_agent">AI Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">Status</Label>
              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="bg-white">
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

            {/* Request Type Filter */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">Request Type</Label>
              <Select value={selectedRequestType} onValueChange={onRequestTypeChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="prescription_refill">Prescription Refill</SelectItem>
                  <SelectItem value="medication_inquiry">Medication Inquiry</SelectItem>
                  <SelectItem value="delivery_status">Delivery Status</SelectItem>
                  <SelectItem value="billing_question">Billing Question</SelectItem>
                  <SelectItem value="side_effects">Side Effects</SelectItem>
                  <SelectItem value="appointment_scheduling">Appointment</SelectItem>
                  <SelectItem value="insurance_question">Insurance</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Staff Member Filter */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">Assigned To</Label>
              <Select value={selectedStaff} onValueChange={onStaffChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {staffMembers.map(staff => (
                    <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Date From */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Date To */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Sort By */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                Sort By
              </Label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="urgency">Urgency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredCommunications.length} of {communications.length} communications
      </div>

      <div className="overflow-y-auto max-h-[600px] pr-1 space-y-3">
        {filteredCommunications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No communications found</p>
          </div>
        ) : (
          filteredCommunications.map(comm => (
            <CommunicationItem key={comm.id} comm={comm} />
          ))
        )}
      </div>
    </div>
  );
}