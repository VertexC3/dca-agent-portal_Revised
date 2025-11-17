import React, { useState } from 'react';
import { Filter, X, Calendar, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function AdvancedFilters({ filters, onFiltersChange, onClearFilters, patients = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = Object.values(filters).filter(val => {
    if (typeof val === 'string') return val && val !== 'all';
    return val;
  }).length;

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClear = () => {
    onClearFilters();
  };

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative border-gray-300"
      >
        <Filter className="w-4 h-4 mr-2" />
        Advanced Filters
        {activeFilterCount > 0 && (
          <Badge className="ml-2 bg-[#8B1F1F] text-white px-2 py-0 text-xs">
            {activeFilterCount}
          </Badge>
        )}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 ml-2" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-2" />
        )}
      </Button>

      {isExpanded && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Filter Communications</h3>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-[#8B1F1F] hover:text-[#721919]"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Search by Patient */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Patient</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Name, email, phone, or ID..."
                  value={filters.patientSearch || ''}
                  onChange={(e) => handleFilterChange('patientSearch', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Rx Number */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Rx Number</Label>
              <Input
                placeholder="Prescription number..."
                value={filters.rxNumber || ''}
                onChange={(e) => handleFilterChange('rxNumber', e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Status Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="mt-1">
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

            {/* Channel Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Channel</Label>
              <Select 
                value={filters.channel || 'all'} 
                onValueChange={(value) => handleFilterChange('channel', value)}
              >
                <SelectTrigger className="mt-1">
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

            {/* Request Type Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Request Type</Label>
              <Select 
                value={filters.requestType || 'all'} 
                onValueChange={(value) => handleFilterChange('requestType', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="prescription_refill">Prescription Refill</SelectItem>
                  <SelectItem value="medication_inquiry">Medication Inquiry</SelectItem>
                  <SelectItem value="delivery_status">Delivery Status</SelectItem>
                  <SelectItem value="billing_question">Billing Question</SelectItem>
                  <SelectItem value="side_effects">Side Effects</SelectItem>
                  <SelectItem value="appointment_scheduling">Appointment Scheduling</SelectItem>
                  <SelectItem value="insurance_question">Insurance Question</SelectItem>
                  <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Handled By Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Handled By</Label>
              <Select 
                value={filters.handledBy || 'all'} 
                onValueChange={(value) => handleFilterChange('handledBy', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="ai_agent">AI Agent</SelectItem>
                  <SelectItem value="representative">Representative</SelectItem>
                  <SelectItem value="escalated">Escalated to Human</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Patient List Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Select Patient</Label>
              <Select 
                value={filters.patientName || 'all'} 
                onValueChange={(value) => handleFilterChange('patientName', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Patients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  {patients.map(patient => (
                    <SelectItem key={patient} value={patient}>{patient}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium text-gray-700">From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">To Date</Label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Apply Button */}
          <Button
            onClick={() => setIsExpanded(false)}
            className="w-full mt-4 bg-[#8B1F1F] hover:bg-[#721919] text-white"
          >
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
}