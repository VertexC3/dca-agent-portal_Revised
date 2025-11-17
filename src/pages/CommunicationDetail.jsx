import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { 
  ArrowLeft, Phone, Mail, MessageSquare, User, Clock, 
  Calendar, Sparkles, Send, Loader2, Play, FileText,
  CheckCircle, AlertCircle, ThumbsUp, ThumbsDown, Edit3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ExportShareButtons from '../components/communication/ExportShareButtons';
import PatientInfoPanel from '../components/communication/PatientInfoPanel';
import SharedNotes from '../components/communication/SharedNotes';
import PatientProfileDialog from '../components/communication/PatientProfileDialog';
import ActionWorkflow from '../components/communication/ActionWorkflow';

const channelIcons = {
  phone: Phone,
  email: Mail,
  text: MessageSquare
};

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200'
};

export default function CommunicationDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const commId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [responseText, setResponseText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [isEditingRequestType, setIsEditingRequestType] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    feedback_type: 'positive',
    feedback_notes: '',
    corrected_response: '',
    conversation_quality: 5,
    improvement_area: 'accuracy'
  });

  const { data: communication, isLoading } = useQuery({
    queryKey: ['communication', commId],
    queryFn: async () => {
      const allComms = await base44.entities.PatientCommunication.list();
      const comm = allComms.find(c => c.id === commId);
      
      if (!comm) return null;
      
      // Add dummy patient data if not present
      return {
        ...comm,
        patient_date_of_birth: comm.patient_date_of_birth || getDummyDOB(comm.patient_name),
        patient_address: comm.patient_address || getDummyAddress(comm.patient_name),
        patient_allergies: comm.patient_allergies || getDummyAllergies(comm.patient_name),
        current_medications: comm.current_medications || getDummyMedications(comm.patient_name),
        known_conditions: comm.known_conditions || getDummyConditions(comm.patient_name),
        insurance_provider: comm.insurance_provider || getDummyInsurance(comm.patient_name),
        preferred_contact_method: comm.preferred_contact_method || 'email'
      };
    },
    enabled: !!commId
  });

  // Dummy data generators
  const getDummyDOB = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const year = 1950 + (hash % 50);
    const month = (hash % 12) + 1;
    const day = (hash % 28) + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDummyAddress = (name) => {
    const addresses = [
      '123 Main St, Springfield, IL 62701',
      '456 Oak Ave, Portland, OR 97201',
      '789 Pine Rd, Austin, TX 78701',
      '321 Elm St, Boston, MA 02101',
      '654 Maple Dr, Seattle, WA 98101'
    ];
    return addresses[name.length % addresses.length];
  };

  const getDummyAllergies = (name) => {
    const allergies = [
      'Penicillin, Peanuts',
      'Shellfish, Latex',
      'Sulfa drugs, Bee stings',
      'Aspirin, Tree nuts',
      'Codeine, Dairy'
    ];
    return allergies[name.length % allergies.length];
  };

  const getDummyMedications = (name) => {
    const meds = [
      'Lisinopril 10mg, Metformin 500mg, Atorvastatin 20mg',
      'Levothyroxine 50mcg, Omeprazole 20mg',
      'Amlodipine 5mg, Simvastatin 40mg, Aspirin 81mg',
      'Losartan 50mg, Metoprolol 25mg',
      'Gabapentin 300mg, Sertraline 50mg, Vitamin D3'
    ];
    return meds[name.length % meds.length];
  };

  const getDummyConditions = (name) => {
    const conditions = [
      'Hypertension, Type 2 Diabetes, High Cholesterol',
      'Hypothyroidism, GERD',
      'Hypertension, Hyperlipidemia',
      'Hypertension, Anxiety',
      'Chronic Pain, Depression'
    ];
    return conditions[name.length % conditions.length];
  };

  const getDummyInsurance = (name) => {
    const insurances = [
      'Blue Cross Blue Shield PPO',
      'United Healthcare HMO',
      'Aetna PPO',
      'Cigna POS',
      'Medicare Part D'
    ];
    return insurances[name.length % insurances.length];
  };

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.PatientCommunication.update(commId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['communication', commId]);
      queryClient.invalidateQueries(['communications']);
    }
  });

  const handleGenerateResponse = async () => {
    setIsGenerating(true);
    try {
      const channelInstructions = {
        text: 'Keep the response brief and conversational (2-3 sentences max), suitable for SMS texting. Use simple language and avoid long paragraphs.',
        email: 'Write a professional, detailed email response with proper greeting and closing. Use full sentences and organize information clearly.',
        phone: 'Write in a conversational, friendly tone as if speaking directly to the patient. Keep it natural and warm.',
        ai_agent: 'Generate a clear, helpful response optimized for AI chat interactions. Be direct and concise while remaining friendly.'
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a customer service representative at DCA Pharmacy. A patient has sent the following message via ${communication.channel}:

"${communication.message_content}"

Request Type: ${communication.request_type?.replace(/_/g, ' ')}
Channel: ${communication.channel}

${channelInstructions[communication.channel] || channelInstructions.email}

Generate a professional, empathetic, and helpful response to this patient. Address their concern directly.`,
      });
      
      // Auto-populate the response text
      setResponseText(response);
      
      // Save recommended response
      await updateMutation.mutateAsync({ 
        recommended_response: response,
        status: 'in_progress'
      });
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) return;

    const user = await base44.auth.me();
    
    await updateMutation.mutateAsync({
      response_sent: responseText,
      response_timestamp: new Date().toISOString(),
      handled_by: user.email,
      status: newStatus || 'resolved'
    });

    // Send the actual response via email
    if (communication.patient_email) {
      await base44.integrations.Core.SendEmail({
        to: communication.patient_email,
        subject: `Re: Your ${communication.request_type?.replace(/_/g, ' ')} request`,
        body: responseText
      });
    }

    alert('Response sent successfully!');
  };

  const handleStatusChange = async (status) => {
    setNewStatus(status);
    await updateMutation.mutateAsync({ status });
  };

  const handleRequestTypeChange = async (newRequestType) => {
    await updateMutation.mutateAsync({ request_type: newRequestType });
    setIsEditingRequestType(false);
  };

  const handleSubmitFeedback = async () => {
    if (!communication.recommended_response) return;

    await base44.entities.AITrainingFeedback.create({
      communication_id: communication.id,
      ai_response: communication.recommended_response,
      ...feedbackData
    });

    alert('Feedback submitted successfully! This will help improve the AI.');
    setShowFeedbackForm(false);
    setFeedbackData({
      feedback_type: 'positive',
      feedback_notes: '',
      corrected_response: '',
      conversation_quality: 5,
      improvement_area: 'accuracy'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <Loader2 className="w-12 h-12 text-[#8B1F1F] animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-center">Loading communication...</p>
        </div>
      </div>
    );
  }

  if (!communication) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-700 text-xl">Communication not found</p>
      </div>
    );
  }

  const ChannelIcon = channelIcons[communication.channel];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to={createPageUrl('Dashboard')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Communication Details</h1>
            <p className="text-gray-600">Review and respond to patient communication</p>
          </div>
        </div>
        <ExportShareButtons data={[communication]} filename={`communication-${communication.id}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Info & Message */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[#8B1F1F]/10 border border-[#8B1F1F]/30">
                <User className="w-8 h-8 text-[#8B1F1F]" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{communication.patient_name}</h2>
                <div className="flex flex-wrap gap-3 text-gray-600 text-sm">
                  {communication.patient_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {communication.patient_email}
                    </span>
                  )}
                  {communication.patient_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {communication.patient_phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowPatientProfile(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Patient Profile
                </Button>
                <Badge className={`${statusColors[communication.status]} border text-base px-3 py-1`}>
                  {communication.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1 text-sm">
                  <ChannelIcon className="w-4 h-4" />
                  Channel
                </div>
                <p className="text-gray-800 font-semibold capitalize">{communication.channel}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1 text-sm">
                  <FileText className="w-4 h-4" />
                  Request Type
                </div>
                {isEditingRequestType ? (
                  <Select 
                    value={communication.request_type} 
                    onValueChange={handleRequestTypeChange}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-200 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription_refill">Prescription Refill</SelectItem>
                      <SelectItem value="prescription_renewal">Prescription Renewal</SelectItem>
                      <SelectItem value="medication_inquiry">Medication Inquiry</SelectItem>
                      <SelectItem value="delivery_status">Delivery Status</SelectItem>
                      <SelectItem value="billing_question">Billing Question</SelectItem>
                      <SelectItem value="side_effects">Side Effects</SelectItem>
                      <SelectItem value="address_update">Address Update</SelectItem>
                      <SelectItem value="insurance_question">Insurance Question</SelectItem>
                      <SelectItem value="appointment_scheduling">Appointment Scheduling</SelectItem>
                      <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <button
                    onClick={() => setIsEditingRequestType(true)}
                    className="text-gray-800 font-semibold text-sm hover:text-[#8B1F1F] transition-colors flex items-center gap-1"
                  >
                    {communication.request_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1 text-sm">
                  <Calendar className="w-4 h-4" />
                  Date
                </div>
                <p className="text-gray-800 font-semibold text-sm">
                  {format(new Date(communication.date), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1 text-sm">
                  <Clock className="w-4 h-4" />
                  Time
                </div>
                <p className="text-gray-800 font-semibold text-sm">
                  {format(new Date(communication.timestamp || communication.date), 'h:mm a')}
                </p>
              </div>
            </div>

            {/* Patient Message/Transcript - Only show if no request type is selected or not changed */}
            {!isEditingRequestType && communication.request_type && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {communication.channel === 'phone' ? 'Transcript' : 'Message'}
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {communication.transcript || communication.message_content}
                </p>
              </div>
            )}

            {/* Voice Recording */}
            {communication.channel === 'phone' && communication.voice_recording_url && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Voice Recording
                </h3>
                <audio controls className="w-full">
                  <source src={communication.voice_recording_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>

          {/* Action Workflow */}
          <ActionWorkflow 
            requestType={communication.request_type} 
            patientName={communication.patient_name}
            communication={communication}
          />

          {/* Response Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Send className="w-6 h-6" />
                Send Response
              </h3>
              <Button
                onClick={handleGenerateResponse}
                disabled={isGenerating}
                className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Response
                  </>
                )}
              </Button>
            </div>

            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Type your response here or generate one using AI..."
              className="min-h-[200px] bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 mb-4"
            />

            <div className="flex items-center gap-3">
              <Select value={newStatus || communication.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-48 bg-gray-50 border-gray-200 text-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleSendResponse}
                disabled={!responseText.trim() || updateMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Training Feedback - Only shown if recommended response exists */}
          {communication.recommended_response && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8B1F1F]" />
                AI Response Feedback
              </h3>

              {!showFeedbackForm ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">Rate the AI-generated response quality:</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setFeedbackData({ ...feedbackData, feedback_type: 'positive' });
                        setShowFeedbackForm(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Good
                    </Button>
                    <Button
                      onClick={() => {
                        setFeedbackData({ ...feedbackData, feedback_type: 'negative' });
                        setShowFeedbackForm(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      Needs Work
                    </Button>
                    <Button
                      onClick={() => {
                        setFeedbackData({ ...feedbackData, feedback_type: 'correction' });
                        setShowFeedbackForm(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Correct
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">Provide AI Training Feedback</h4>
                  
                  <div>
                    <Label className="text-xs">Quality Score (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={feedbackData.conversation_quality}
                      onChange={(e) => setFeedbackData({ ...feedbackData, conversation_quality: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Improvement Area</Label>
                    <Select 
                      value={feedbackData.improvement_area} 
                      onValueChange={(value) => setFeedbackData({ ...feedbackData, improvement_area: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accuracy">Accuracy</SelectItem>
                        <SelectItem value="tone">Tone</SelectItem>
                        <SelectItem value="completeness">Completeness</SelectItem>
                        <SelectItem value="empathy">Empathy</SelectItem>
                        <SelectItem value="policy_compliance">Policy Compliance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Feedback Notes</Label>
                    <Textarea
                      value={feedbackData.feedback_notes}
                      onChange={(e) => setFeedbackData({ ...feedbackData, feedback_notes: e.target.value })}
                      placeholder="What could be improved?"
                      className="mt-1 min-h-[60px]"
                    />
                  </div>

                  {feedbackData.feedback_type === 'correction' && (
                    <div>
                      <Label className="text-xs">Corrected Response</Label>
                      <Textarea
                        value={feedbackData.corrected_response}
                        onChange={(e) => setFeedbackData({ ...feedbackData, corrected_response: e.target.value })}
                        placeholder="Provide the corrected response..."
                        className="mt-1 min-h-[80px]"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitFeedback}
                      size="sm"
                      className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
                    >
                      Submit Feedback
                    </Button>
                    <Button
                      onClick={() => setShowFeedbackForm(false)}
                      size="sm"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Right Side (1 column) */}
        <div className="space-y-6">
          {/* Activity History */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Activity History
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Message received</p>
                  <p className="text-gray-500 text-sm">
                    {format(new Date(communication.timestamp || communication.date), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>

              {communication.recommended_response && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#8B1F1F]/10 border border-[#8B1F1F]/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#8B1F1F]" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">AI response generated</p>
                    <p className="text-gray-500 text-sm">Ready to send</p>
                  </div>
                </div>
              )}

              {communication.response_sent && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Response sent</p>
                    <p className="text-gray-500 text-sm">
                      {communication.response_timestamp 
                        ? format(new Date(communication.response_timestamp), 'MMM d, yyyy h:mm a')
                        : 'Recently'
                      }
                    </p>
                    {communication.handled_by && (
                      <p className="text-gray-500 text-xs mt-1">By: {communication.handled_by}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Patient Information Panel */}
          <PatientInfoPanel communication={communication} />

          {/* Shared Notes */}
          <SharedNotes communicationId={communication.id} />
        </div>
      </div>

      {/* Patient Profile Dialog */}
      <PatientProfileDialog 
        open={showPatientProfile} 
        onClose={() => setShowPatientProfile(false)} 
        patient={communication}
      />
    </div>
  );
}