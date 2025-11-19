import React, { useState } from 'react';
import { X, Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function SatisfactionSurveyAlert({ user, onDismiss }) {
  const [showSurvey, setShowSurvey] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({
    overall_rating: 0,
    ease_of_use: 0,
    response_accuracy: 0,
    speed_of_service: 0,
    likelihood_to_recommend: 0,
    additional_feedback: ''
  });

  const queryClient = useQueryClient();

  const submitSurveyMutation = useMutation({
    mutationFn: async (data) => {
      // Save to user profile
      await base44.auth.updateMe({ survey_completed: true, last_survey_date: new Date().toISOString() });
      // Could also create a survey response entity if needed
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setShowSurvey(false);
      onDismiss();
      alert('Thank you for your feedback!');
    }
  });

  const questions = [
    {
      id: 'overall_rating',
      question: 'How would you rate your overall experience with the DCA AI Agent?',
      type: 'rating'
    },
    {
      id: 'ease_of_use',
      question: 'How easy was it to communicate with the AI Agent?',
      type: 'rating'
    },
    {
      id: 'response_accuracy',
      question: 'How accurate and helpful were the AI Agent\'s responses?',
      type: 'rating'
    },
    {
      id: 'speed_of_service',
      question: 'How satisfied are you with the speed of service?',
      type: 'rating'
    },
    {
      id: 'likelihood_to_recommend',
      question: 'How likely are you to recommend the DCA AI Agent to others?',
      type: 'rating'
    }
  ];

  const handleRatingChange = (questionId, rating) => {
    setResponses({ ...responses, [questionId]: rating });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentQuestion(questions.length); // Show feedback page
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    submitSurveyMutation.mutate(responses);
  };

  const currentQuestionData = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFeedbackPage = currentQuestion === questions.length;

  return (
    <>
      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <h3 className="text-xl font-bold text-gray-800">Share Your Experience</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Help us improve! Take a quick 5-question survey about your recent experience with the DCA AI Agent.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowSurvey(true)}
                className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
              >
                Take Survey (2 min)
              </Button>
              <Button
                variant="outline"
                onClick={onDismiss}
                className="text-gray-600"
              >
                Maybe Later
              </Button>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Survey Dialog */}
      <Dialog open={showSurvey} onOpenChange={setShowSurvey}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">DCA AI Agent Satisfaction Survey</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Question {Math.min(currentQuestion + 1, questions.length)} of {questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8B1F1F] to-purple-600 transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question or Feedback Page */}
            {!isFeedbackPage ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  {currentQuestionData.question}
                </h3>

                {/* Star Rating */}
                <div className="flex items-center gap-3 justify-center py-6">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(currentQuestionData.id, rating)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-12 h-12 transition-colors ${
                          rating <= responses[currentQuestionData.id]
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="text-center text-sm text-gray-500">
                  {responses[currentQuestionData.id] > 0 && (
                    <span>You rated: {responses[currentQuestionData.id]} out of 5</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Any additional feedback or suggestions?
                </h3>
                <Textarea
                  value={responses.additional_feedback}
                  onChange={(e) => setResponses({ ...responses, additional_feedback: e.target.value })}
                  placeholder="Share your thoughts, suggestions, or any issues you experienced..."
                  rows={6}
                  className="resize-none"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1"
              >
                Previous
              </Button>

              {!isFeedbackPage ? (
                <Button
                  onClick={handleNext}
                  disabled={responses[currentQuestionData?.id] === 0}
                  className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
                >
                  {isLastQuestion ? 'Continue to Feedback' : 'Next'}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitSurveyMutation.isPending}
                  className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
                >
                  {submitSurveyMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Survey
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}