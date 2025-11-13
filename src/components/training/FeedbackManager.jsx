import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, ThumbsUp, ThumbsDown, Edit3, Tag, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FeedbackManager() {
  const queryClient = useQueryClient();
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['aiTrainingFeedback'],
    queryFn: () => base44.entities.AITrainingFeedback.list('-created_date', 100)
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['communications'],
    queryFn: () => base44.entities.PatientCommunication.list('-timestamp', 1000)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AITrainingFeedback.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['aiTrainingFeedback']);
      setReviewDialogOpen(false);
      setSelectedFeedback(null);
    }
  });

  const handleReview = (feedback) => {
    setSelectedFeedback(feedback);
    setReviewDialogOpen(true);
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedFeedback) return;
    
    const user = await base44.auth.me();
    await updateMutation.mutateAsync({
      id: selectedFeedback.id,
      data: {
        training_status: status,
        reviewed_by: user.email,
        reviewed_date: new Date().toISOString()
      }
    });
  };

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
    applied: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200'
  };

  const feedbackTypeIcons = {
    positive: <ThumbsUp className="w-4 h-4 text-green-600" />,
    negative: <ThumbsDown className="w-4 h-4 text-red-600" />,
    correction: <Edit3 className="w-4 h-4 text-orange-600" />
  };

  const getCommDetail = (commId) => {
    return communications.find(c => c.id === commId);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
          <MessageSquare className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Training Feedback</h2>
          <p className="text-gray-600 text-sm">Review and apply feedback to improve AI responses</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-gray-600">Pending Review</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {feedbacks.filter(f => f.training_status === 'pending').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-gray-600">Reviewed</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {feedbacks.filter(f => f.training_status === 'reviewed').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-600">Applied</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {feedbacks.filter(f => f.training_status === 'applied').length}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp className="w-4 h-4 text-gray-600" />
            <p className="text-sm text-gray-600">Positive Feedback</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {feedbacks.filter(f => f.feedback_type === 'positive').length}
          </p>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {feedbacks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No feedback available yet</p>
          </div>
        ) : (
          feedbacks.map(feedback => {
            const comm = getCommDetail(feedback.communication_id);
            return (
              <div key={feedback.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {feedbackTypeIcons[feedback.feedback_type]}
                    <span className="font-medium text-gray-800 capitalize">{feedback.feedback_type} Feedback</span>
                    <Badge className={`${statusColors[feedback.training_status]} border text-xs`}>
                      {feedback.training_status}
                    </Badge>
                    {feedback.conversation_quality && (
                      <Badge variant="outline" className="text-xs">
                        Quality: {feedback.conversation_quality}/5
                      </Badge>
                    )}
                  </div>
                  
                  {feedback.training_status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleReview(feedback)}
                      className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
                    >
                      Review
                    </Button>
                  )}
                </div>

                {comm && (
                  <p className="text-sm text-gray-600 mb-2">
                    Patient: <span className="font-medium">{comm.patient_name}</span> | 
                    Type: <span className="font-medium">{comm.request_type?.replace(/_/g, ' ')}</span>
                  </p>
                )}

                {feedback.ai_response && (
                  <div className="bg-white rounded-lg p-3 mb-2 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">AI Response:</p>
                    <p className="text-sm text-gray-700">{feedback.ai_response}</p>
                  </div>
                )}

                {feedback.feedback_notes && (
                  <div className="bg-yellow-50 rounded-lg p-3 mb-2 border border-yellow-200">
                    <p className="text-xs text-gray-600 mb-1">Feedback Notes:</p>
                    <p className="text-sm text-gray-700">{feedback.feedback_notes}</p>
                  </div>
                )}

                {feedback.corrected_response && (
                  <div className="bg-green-50 rounded-lg p-3 mb-2 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Corrected Response:</p>
                    <p className="text-sm text-gray-700">{feedback.corrected_response}</p>
                  </div>
                )}

                {feedback.improvement_area && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Tag className="w-3 h-3" />
                    <span>Improvement Area: {feedback.improvement_area.replace(/_/g, ' ')}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Training Feedback</DialogTitle>
            <DialogDescription>
              Review and apply this feedback to improve the AI model.
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Original AI Response:</p>
                <p className="text-sm text-gray-600">{selectedFeedback.ai_response}</p>
              </div>

              {selectedFeedback.feedback_notes && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Feedback:</p>
                  <p className="text-sm text-gray-600">{selectedFeedback.feedback_notes}</p>
                </div>
              )}

              {selectedFeedback.corrected_response && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Suggested Correction:</p>
                  <p className="text-sm text-gray-600">{selectedFeedback.corrected_response}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleStatusUpdate('applied')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Apply to Training
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('rejected')}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}