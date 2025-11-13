import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Plus, AlertCircle, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function SharedNotes({ communicationId }) {
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [showForm, setShowForm] = useState(false);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['communicationNotes', communicationId],
    queryFn: async () => {
      const allNotes = await base44.entities.CommunicationNote.list('-created_date', 100);
      return allNotes.filter(n => n.communication_id === communicationId);
    },
    enabled: !!communicationId
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.CommunicationNote.create({
        ...data,
        created_by_name: user.full_name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communicationNotes', communicationId]);
      setNoteContent('');
      setNoteType('general');
      setShowForm(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    createNoteMutation.mutate({
      communication_id: communicationId,
      note_content: noteContent,
      note_type: noteType,
      is_internal: true
    });
  };

  const noteTypeColors = {
    general: 'bg-gray-100 text-gray-700 border-gray-300',
    action_item: 'bg-blue-50 text-blue-700 border-blue-200',
    follow_up: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    alert: 'bg-red-50 text-red-700 border-red-200'
  };

  const noteTypeIcons = {
    general: <MessageSquare className="w-4 h-4" />,
    action_item: <AlertCircle className="w-4 h-4" />,
    follow_up: <AlertCircle className="w-4 h-4" />,
    alert: <Flag className="w-4 h-4" />
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Shared Notes</h3>
            <p className="text-sm text-gray-600">Visible to all agents handling this case</p>
          </div>
        </div>

        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            size="sm"
            className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Note
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-purple-50 rounded-xl p-4 border border-purple-200 mb-4">
          <div className="space-y-3">
            <div>
              <Select value={noteType} onValueChange={setNoteType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Note</SelectItem>
                  <SelectItem value="action_item">Action Item</SelectItem>
                  <SelectItem value="follow_up">Follow-up Required</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a note for other agents..."
              className="min-h-[80px]"
              required
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={createNoteMutation.isPending}
                className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
              >
                Save Note
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setNoteContent('');
                  setNoteType('general');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes yet</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={`${noteTypeColors[note.note_type]} border text-xs flex items-center gap-1`}>
                    {noteTypeIcons[note.note_type]}
                    {note.note_type.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(note.created_date), 'MMM d, h:mm a')}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">{note.note_content}</p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium">{note.created_by_name || note.created_by}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}