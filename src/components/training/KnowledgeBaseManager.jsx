import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Book, Plus, Edit, Trash2, Eye, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

export default function KnowledgeBaseManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    category: 'general_inquiry',
    content: '',
    keywords: '',
    status: 'draft',
    ai_enabled: true
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['knowledgeBase'],
    queryFn: () => base44.entities.KnowledgeBase.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.KnowledgeBase.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledgeBase']);
      resetForm();
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.KnowledgeBase.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledgeBase']);
      resetForm();
      setIsDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.KnowledgeBase.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledgeBase']);
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'general_inquiry',
      content: '',
      keywords: '',
      status: 'draft',
      ai_enabled: true
    });
    setEditingArticle(null);
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      category: article.category,
      content: article.content,
      keywords: article.keywords || '',
      status: article.status,
      ai_enabled: article.ai_enabled ?? true
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingArticle) {
      await updateMutation.mutateAsync({ id: editingArticle.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this article?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.keywords?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    published: 'bg-green-50 text-green-700 border-green-200',
    archived: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <Book className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Knowledge Base</h2>
            <p className="text-gray-600 text-sm">Manage AI reference articles and FAQs</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#8B1F1F] hover:bg-[#721919] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? 'Edit Article' : 'Create New Article'}</DialogTitle>
              <DialogDescription>
                Add knowledge base articles for the AI to reference when responding to patients.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Article Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., How to refill prescriptions online"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the article content here..."
                  className="min-h-[200px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="refill, prescription, online, portal (comma-separated)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-8">
                  <Switch
                    id="ai_enabled"
                    checked={formData.ai_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, ai_enabled: checked })}
                  />
                  <Label htmlFor="ai_enabled">AI Enabled</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#8B1F1F] hover:bg-[#721919]">
                  {editingArticle ? 'Update' : 'Create'} Article
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="prescription_refill">Prescription Refill</SelectItem>
            <SelectItem value="medication_inquiry">Medication Inquiry</SelectItem>
            <SelectItem value="delivery_status">Delivery Status</SelectItem>
            <SelectItem value="billing_question">Billing Question</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Articles</p>
          <p className="text-2xl font-bold text-gray-800">{articles.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Published</p>
          <p className="text-2xl font-bold text-gray-800">
            {articles.filter(a => a.status === 'published').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">AI Enabled</p>
          <p className="text-2xl font-bold text-gray-800">
            {articles.filter(a => a.ai_enabled).length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Total Usage</p>
          <p className="text-2xl font-bold text-gray-800">
            {articles.reduce((sum, a) => sum + (a.usage_count || 0), 0)}
          </p>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Book className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No articles found</p>
          </div>
        ) : (
          filteredArticles.map(article => (
            <div key={article.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-[#8B1F1F] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{article.title}</h3>
                    <Badge className={`${statusColors[article.status]} border text-xs`}>
                      {article.status}
                    </Badge>
                    {article.ai_enabled ? (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        AI Enabled
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-300 text-xs">
                        <XCircle className="w-3 h-3 mr-1" />
                        AI Disabled
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{article.content}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="capitalize">{article.category?.replace(/_/g, ' ')}</span>
                    {article.usage_count > 0 && (
                      <span>Used {article.usage_count} times</span>
                    )}
                    {article.keywords && (
                      <span>Keywords: {article.keywords}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(article)}
                    className="text-gray-600 hover:text-[#8B1F1F]"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}