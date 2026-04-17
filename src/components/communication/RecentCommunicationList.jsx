import React, { useState } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import { MessageSquare, Filter, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CommunicationItem from './CommunicationItem';

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

  const staffMembers = [...new Set(communications.map(c => c.handled_by).filter(Boolean))];

  const getUrgencyScore = (comm) => {
    let score = 0;
    if (comm.status === 'pending') score += 10;
    if (comm.status === 'in_progress') score += 5;
    if (comm.request_type === 'side_effects') score += 15;
    if (comm.request_type === 'complaint') score += 10;
    if (comm.escalated_to_human) score += 8;
    const hoursElapsed = (new Date() - new Date(comm.timestamp || comm.date)) / (1000 * 60 * 60);
    if (hoursElapsed > 24) score += 5;
    if (hoursElapsed > 48) score += 10;
    return score;
  };

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
        return isWithinInterval(commDate, { start: parseISO(dateFrom), end: parseISO(dateTo) });
      }
      if (dateFrom) return commDate >= parseISO(dateFrom);
      if (dateTo) return commDate <= parseISO(dateTo);
      return true;
    });

  if (sortBy === 'urgency') {
    filteredCommunications = filteredCommunications.sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a));
  } else if (sortBy === 'oldest') {
    filteredCommunications = filteredCommunications.sort((a, b) =>
      new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date)
    );
  } else {
    filteredCommunications = filteredCommunications.sort((a, b) =>
      new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
    );
  }

  filteredCommunications = filteredCommunications.slice(0, 50);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recent Communications</h2>
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

      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">Channel</Label>
              <Select value={selectedChannel} onValueChange={onChannelChange}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="ai_agent">AI Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">Status</Label>
              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">Request Type</Label>
              <Select value={selectedRequestType} onValueChange={onRequestTypeChange}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
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
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">Assigned To</Label>
              <Select value={selectedStaff} onValueChange={onStaffChange}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
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
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1">To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />Sort By
              </Label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
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