import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin, Plus, Edit2, Trash2, Loader2, CheckCircle, Clock, Calendar, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
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

export default function PatientRoadmap() {
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('tile'); // 'tile' or 'list'
  const [sortConfig, setSortConfig] = useState({ key: 'phase', direction: 'asc' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    phase: 'Phase 1',
    phase_date: '',
    status: 'planned',
    order: 0
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: roadmapItems = [], isLoading } = useQuery({
    queryKey: ['patient-roadmap'],
    queryFn: () => base44.entities.PatientRoadmapItem.list('order', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PatientRoadmapItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['patient-roadmap']);
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PatientRoadmapItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['patient-roadmap']);
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PatientRoadmapItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['patient-roadmap']);
    }
  });

  const handleCloseDialog = () => {
    setShowAdminDialog(false);
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      phase: 'Phase 1',
      phase_date: '',
      status: 'planned',
      order: 0
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      phase: item.phase,
      phase_date: item.phase_date || '',
      status: item.status,
      order: item.order || 0
    });
    setShowAdminDialog(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

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

  const isAdmin = user?.role === 'admin';

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#8B1F1F] animate-spin" />
      </div>
    );
  }

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
          
          {isAdmin && (
            <Button
              onClick={() => setShowAdminDialog(true)}
              className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          )}
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
                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Edit2 className="w-3 h-3 text-gray-600" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this roadmap item?')) {
                                    deleteMutation.mutate(item.id);
                                  }
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          )}
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
                  {isAdmin && (
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedItems.map(item => {
                  const StatusIcon = statusIcons[item.status].icon;
                  const statusColor = statusIcons[item.status].color;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <Select 
                            value={item.phase} 
                            onValueChange={(value) => {
                              updateMutation.mutate({ 
                                id: item.id, 
                                data: { ...item, phase: value }
                              });
                            }}
                          >
                            <SelectTrigger className={`w-32 ${phaseColors[item.phase]} border font-medium`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {phases.map(phase => (
                                <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${phaseColors[item.phase]} border text-gray-800 font-medium`}>
                            {item.phase}
                          </Badge>
                        )}
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
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this roadmap item?')) {
                                  deleteMutation.mutate(item.id);
                                }
                              }}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Dialog */}
      {isAdmin && (
        <Dialog open={showAdminDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Roadmap Item' : 'Add Roadmap Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Feature name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the feature"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label>Phase</Label>
                <Select value={formData.phase} onValueChange={(value) => setFormData({ ...formData, phase: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map(phase => (
                      <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phase Date/Timeframe</Label>
                <Input
                  value={formData.phase_date}
                  onChange={(e) => setFormData({ ...formData, phase_date: e.target.value })}
                  placeholder="e.g., Q1 2026, January 2026"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.title || createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}