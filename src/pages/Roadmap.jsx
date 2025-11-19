import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin, Plus, Edit2, Trash2, Loader2, Calendar, Target, Zap, CheckCircle2, X, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const complexityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const statusColors = {
  planned: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function Roadmap() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categorizingAI, setCategorizingAI] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeline: "Q1'26",
    category: '',
    complexity: 'medium',
    status: 'planned'
  });

  const queryClient = useQueryClient();

  const { data: roadmapItems = [], isLoading } = useQuery({
    queryKey: ['roadmapItems'],
    queryFn: () => base44.entities.RoadmapItem.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RoadmapItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roadmapItems']);
      resetForm();
      setShowDialog(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RoadmapItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roadmapItems']);
      resetForm();
      setShowDialog(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RoadmapItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['roadmapItems']);
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      timeline: "Q1'26",
      category: '',
      complexity: 'medium',
      status: 'planned'
    });
    setEditingItem(null);
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        timeline: item.timeline,
        category: item.category || '',
        complexity: item.complexity,
        status: item.status
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleCategorizeWithAI = async () => {
    if (!formData.description) {
      alert('Please add a description first');
      return;
    }

    setCategorizingAI(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this roadmap item description, suggest a single concise category (2-3 words max) that best describes it. Only return the category name, nothing else.

Description: ${formData.description}

Examples of good categories: "Patient Experience", "AI Features", "Data Analytics", "Infrastructure", "Security", "Integrations", "Mobile App", "Reporting"`,
        response_json_schema: {
          type: "object",
          properties: {
            category: { type: "string" }
          }
        }
      });

      setFormData({ ...formData, category: result.category });
    } catch (error) {
      console.error('AI categorization failed:', error);
      alert('Failed to categorize with AI');
    } finally {
      setCategorizingAI(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this roadmap item?')) {
      deleteMutation.mutate(id);
    }
  };

  // Group by timeline
  const groupedItems = roadmapItems.reduce((acc, item) => {
    if (!acc[item.timeline]) {
      acc[item.timeline] = [];
    }
    acc[item.timeline].push(item);
    return acc;
  }, {});

  const timelines = ["Q1'26", "Q2'26", "Q3'26", "Q4'26"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#8B1F1F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Product Roadmap</h1>
            <p className="text-gray-600">Plan and track feature development</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 rounded-md transition-all ${
                  viewMode === 'kanban' ? 'bg-white text-[#8B1F1F] shadow' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-white text-[#8B1F1F] shadow' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timelines.map(timeline => (
          <div key={timeline} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-lg">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <Calendar className="w-5 h-5 text-[#8B1F1F]" />
              <h3 className="text-lg font-bold text-gray-800">{timeline}</h3>
              <Badge className="ml-auto">{groupedItems[timeline]?.length || 0}</Badge>
            </div>

            <div className="space-y-3">
              {groupedItems[timeline]?.map(item => (
                <div
                key={item.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 transition-all group"
                >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 text-sm flex-1 pr-2">{item.title}</h4>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenDialog(item)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit2 className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>

                <div className="flex items-center gap-2 mb-2">
                  <Select 
                    value={item.timeline} 
                    onValueChange={(value) => updateMutation.mutate({ id: item.id, data: { ...item, timeline: value } })}
                  >
                    <SelectTrigger className="h-7 text-xs w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1'26">Q1'26</SelectItem>
                      <SelectItem value="Q2'26">Q2'26</SelectItem>
                      <SelectItem value="Q3'26">Q3'26</SelectItem>
                      <SelectItem value="Q4'26">Q4'26</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={item.status} 
                    onValueChange={(value) => updateMutation.mutate({ id: item.id, data: { ...item, status: value } })}
                  >
                    <SelectTrigger className="h-7 text-xs flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      <Target className="w-3 h-3 mr-1" />
                      {item.category}
                    </Badge>
                  )}
                  <Badge className={`text-xs ${complexityColors[item.complexity]}`}>
                    <Zap className="w-3 h-3 mr-1" />
                    {item.complexity}
                  </Badge>
                </div>
                </div>
              ))}

              {(!groupedItems[timeline] || groupedItems[timeline].length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No items planned</p>
                </div>
              )}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Complexity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {roadmapItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">No roadmap items yet</p>
                    </td>
                  </tr>
                ) : (
                  roadmapItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{item.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">{item.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Select 
                          value={item.timeline} 
                          onValueChange={(value) => updateMutation.mutate({ id: item.id, data: { ...item, timeline: value } })}
                        >
                          <SelectTrigger className="h-8 text-xs w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Q1'26">Q1'26</SelectItem>
                            <SelectItem value="Q2'26">Q2'26</SelectItem>
                            <SelectItem value="Q3'26">Q3'26</SelectItem>
                            <SelectItem value="Q4'26">Q4'26</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        {item.category ? (
                          <Badge variant="outline" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            {item.category}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`text-xs ${complexityColors[item.complexity]}`}>
                          <Zap className="w-3 h-3 mr-1" />
                          {item.complexity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Select 
                          value={item.status} 
                          onValueChange={(value) => updateMutation.mutate({ id: item.id, data: { ...item, status: value } })}
                        >
                          <SelectTrigger className="h-8 text-xs w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDialog(item)}
                            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Roadmap Item' : 'Add Roadmap Item'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., AI-powered prescription recommendations"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the feature or improvement..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Timeline *</Label>
                <Select value={formData.timeline} onValueChange={(value) => setFormData({ ...formData, timeline: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1'26">Q1'26</SelectItem>
                    <SelectItem value="Q2'26">Q2'26</SelectItem>
                    <SelectItem value="Q3'26">Q3'26</SelectItem>
                    <SelectItem value="Q4'26">Q4'26</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Complexity *</Label>
                <Select value={formData.complexity} onValueChange={(value) => setFormData({ ...formData, complexity: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Patient Experience"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleCategorizeWithAI}
                  disabled={categorizingAI || !formData.description}
                >
                  {categorizingAI ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      AI Categorize
                    </>
                  )}
                </Button>
              </div>
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
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingItem ? 'Update' : 'Add Item'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}