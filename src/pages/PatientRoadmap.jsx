import React, { useState } from 'react';
import { MapPin, CheckCircle, Clock, Calendar, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const phaseColors = {
  'Phase 1': 'bg-blue-100 border-blue-300',
  'Phase 2': 'bg-purple-100 border-purple-300',
  'Phase 3': 'bg-pink-100 border-pink-300',
  'Phase 4': 'bg-orange-100 border-orange-300',
  'Phase 5': 'bg-green-100 border-green-300',
  'Future': 'bg-gray-100 border-gray-300'
};

const statusIcons = {
  completed: { icon: CheckCircle, color: 'text-green-600' },
  in_progress: { icon: Clock, color: 'text-blue-600' },
  planned: { icon: MapPin, color: 'text-gray-400' }
};

// Mock roadmap data
const mockRoadmapItems = [
  {
    id: '1',
    title: 'Messaging Center',
    description: 'Enable direct messages between patients and DCA customer service.',
    phase: 'Phase 1',
    phase_date: 'Q1 2026',
    status: 'planned',
    order: 0
  },
  {
    id: '2',
    title: 'Appointment Booking System',
    description: 'Book appointments with healthcare providers directly through the portal.',
    phase: 'Phase 3',
    phase_date: 'Q2 2026',
    status: 'planned',
    order: 1
  },
  {
    id: '3',
    title: 'Medication Adherence Tracker',
    description: 'Log medication intake, set smart reminders, and view comprehensive adherence reports.',
    phase: 'Phase 3',
    phase_date: 'Q3 2026',
    status: 'planned',
    order: 2
  },
  {
    id: '4',
    title: 'Secure Medical Document Hub',
    description: 'Upload, store, and securely access all your personal medical records.',
    phase: 'Phase 3',
    phase_date: 'Q3 2026',
    status: 'planned',
    order: 3
  },
  {
    id: '5',
    title: 'Virtual Consultation Integration',
    description: 'Book and conduct secure video consultations with healthcare providers.',
    phase: 'Phase 3',
    phase_date: 'Q3 2026',
    status: 'planned',
    order: 4
  },
  {
    id: '6',
    title: 'Family Health Management',
    description: "Manage multiple family members' health from a single account.",
    phase: 'Phase 3',
    phase_date: 'Q3 2026',
    status: 'planned',
    order: 5
  }
];

export default function PatientRoadmap() {
  const [viewMode, setViewMode] = useState('tile');
  const [sortConfig, setSortConfig] = useState({ key: 'phase', direction: 'asc' });
  const roadmapItems = mockRoadmapItems;



  // Group items by phase
  const phases = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Future'];
  const groupedItems = phases.reduce((acc, phase) => {
    acc[phase] = roadmapItems.filter(item => item.phase === phase);
    return acc;
  }, {});

  // Get unique phase date for each phase
  const phaseDates = phases.reduce((acc, phase) => {
    const items = groupedItems[phase];
    acc[phase] = items.length > 0 ? items[0].phase_date || 'TBD' : 'TBD';
    return acc;
  }, {});

  // Sort function for list view
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const sortedItems = [...roadmapItems].sort((a, b) => {
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    if (sortConfig.key === 'order') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-gray-50 pb-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Product Roadmap</h1>
          <p className="text-gray-600">See what we're building for you</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Status Legend */}
          <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Planned</span>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('tile')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'tile' ? 'bg-[#8B1F1F] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Tile View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-[#8B1F1F] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Tile View */}
      {viewMode === 'tile' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 overflow-x-auto">
          <div className="flex gap-8 min-w-max pb-4">
            {phases.map((phase, index) => (
              <div key={phase} className="flex-shrink-0 w-72">
                {/* Phase Header */}
                <div className={`${phaseColors[phase]} border-2 rounded-t-xl p-4 text-center`}>
                  <h3 className="font-bold text-lg text-gray-800">{phase}</h3>
                  <div className="flex items-center justify-center gap-1 mt-1 text-sm text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>{phaseDates[phase]}</span>
                  </div>
                </div>

                {/* Phase Items */}
                <div className={`border-2 border-t-0 ${phaseColors[phase]} rounded-b-xl p-4 min-h-[300px] space-y-3`}>
                  {groupedItems[phase].map(item => {
                    const StatusIcon = statusIcons[item.status].icon;
                    const statusColor = statusIcons[item.status].color;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${statusColor} flex-shrink-0`} />
                            <h4 className="font-semibold text-sm text-gray-800">{item.title}</h4>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-600 line-clamp-3">{item.description}</p>
                        )}
                        <Badge 
                          className={`mt-2 text-xs ${
                            item.status === 'completed' ? 'bg-green-100 text-green-800' :
                            item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    );
                  })}

                  {groupedItems[phase].length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No items yet
                    </div>
                  )}
                </div>

                {/* Connector Line */}
                {index < phases.length - 1 && (
                  <div className="absolute top-1/2 -right-8 w-8 border-t-2 border-dashed border-gray-300 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] relative">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('phase')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase hover:text-[#8B1F1F]"
                    >
                      Phase
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('phase_date')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase hover:text-[#8B1F1F]"
                    >
                      Date
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase hover:text-[#8B1F1F]"
                    >
                      Title
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('description')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase hover:text-[#8B1F1F]"
                    >
                      Overview
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase hover:text-[#8B1F1F]"
                    >
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>

                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedItems.map(item => {
                  const StatusIcon = statusIcons[item.status].icon;
                  const statusColor = statusIcons[item.status].color;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Badge className={`${phaseColors[item.phase]} border text-gray-800 font-medium`}>
                          {item.phase}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.phase_date || 'TBD'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${statusColor} flex-shrink-0`} />
                          <span className="font-semibold text-gray-800">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                        {item.description || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={`text-xs ${
                            item.status === 'completed' ? 'bg-green-100 text-green-800' :
                            item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}