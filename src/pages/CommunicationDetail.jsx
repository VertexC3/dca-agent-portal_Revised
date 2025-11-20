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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Patient Info & Message */}
        <div className="space-y-4">
          {/* Patient Info Card */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#8B1F1F]/10 border border-[#8B1F1F]/30">
                  <User className="w-5 h-5 text-[#8B1F1F]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{communication.patient_name}</h2>
                  <Badge className={`${statusColors[communication.status]} border text-xs px-2 py-0.5 mt-1`}>
                    {communication.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => setShowPatientProfile(true)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </div>

            <div className="space-y-2 text-sm">
              {communication.patient_email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-3 h-3 text-gray-500" />
                  <span className="text-xs">{communication.patient_email}</span>
                </div>
              )}
              {communication.patient_phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-3 h-3 text-gray-500" />
                  <span className="text-xs">{communication.patient_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Communication Details Card */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Communication Details</h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-1">
                  <ChannelIcon className="w-3 h-3" />
                  Channel
                </span>
                <span className="text-gray-800 font-semibold capitalize">{communication.channel}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Request Type
                </span>
                {isEditingRequestType ? (
                  <Select 
                    value={communication.request_type} 
                    onValueChange={handleRequestTypeChange}
                  >
                    <SelectTrigger className="h-6 text-xs w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription_refill">Prescription Refill</SelectItem>
                      <SelectItem value="medication_inquiry">Medication Inquiry</SelectItem>
                      <SelectItem value="delivery_status">Delivery Status</SelectItem>
                      <SelectItem value="billing_question">Billing Question</SelectItem>
                      <SelectItem value="side_effects">Side Effects</SelectItem>
                      <SelectItem value="appointment_scheduling">Appointment</SelectItem>
                      <SelectItem value="insurance_question">Insurance</SelectItem>
                      <SelectItem value="general_inquiry">General</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <button
                    onClick={() => setIsEditingRequestType(true)}
                    className="text-gray-800 font-semibold hover:text-[#8B1F1F] flex items-center gap-1"
                  >
                    {communication.request_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <Edit3 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date
                </span>
                <span className="text-gray-800 font-semibold">
                  {format(new Date(communication.date), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Time
                </span>
                <span className="text-gray-800 font-semibold">
                  {format(new Date(communication.timestamp || communication.date), 'h:mm a')}
                </span>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {communication.channel === 'phone' ? 'Transcript' : 'Message'}
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                {communication.transcript || communication.message_content}
              </p>
            </div>
            {communication.channel === 'phone' && communication.voice_recording_url && (
              <audio controls className="w-full mt-2" style={{height: '32px'}}>
                <source src={communication.voice_recording_url} type="audio/mpeg" />
              </audio>
            )}
          </div>

          {/* Patient Information */}
          <PatientInfoPanel communication={communication} />

          {/* Shared Notes */}
          <SharedNotes communicationId={communication.id} />

        </div>

        {/* Column 2: Response & Actions */}
        <div className="space-y-4">
          {/* Response Section */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Response
              </h3>
              <Button
                onClick={handleGenerateResponse}
                disabled={isGenerating}
                size="sm"
                className="bg-[#8B1F1F] hover:bg-[#721919] text-white text-xs h-7"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI
                  </>
                )}
              </Button>
            </div>

            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Type response or use AI..."
              className="min-h-[120px] text-xs bg-gray-50 border-gray-200 mb-3 resize-none"
            />

            <div className="flex items-center gap-2">
              <Select value={newStatus || communication.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="flex-1 h-8 text-xs bg-gray-50 border-gray-200">
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
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-8"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 mr-1" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Feedback */}
          {communication.recommended_response && !showFeedbackForm && (
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold text-gray-800 mb-2">AI Response Quality</h3>
              <div className="flex gap-1">
                <Button
                  onClick={() => {
                    setFeedbackData({ ...feedbackData, feedback_type: 'positive' });
                    setShowFeedbackForm(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-7"
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  onClick={() => {
                    setFeedbackData({ ...feedbackData, feedback_type: 'negative' });
                    setShowFeedbackForm(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-7"
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Activity History */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Activity
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 pb-2 border-b border-gray-100">
                <MessageSquare className="w-3 h-3 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-gray-800 font-medium">Received</p>
                  <p className="text-gray-500">
                    {format(new Date(communication.timestamp || communication.date), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>

              {communication.recommended_response && (
                <div className="flex items-start gap-2 pb-2 border-b border-gray-100">
                  <Sparkles className="w-3 h-3 text-[#8B1F1F] mt-0.5" />
                  <div>
                    <p className="text-gray-800 font-medium">AI Generated</p>
                    <p className="text-gray-500">Ready</p>
                  </div>
                </div>
              )}

              {communication.response_sent && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-gray-800 font-medium">Sent</p>
                    <p className="text-gray-500">
                      {communication.response_timestamp 
                        ? format(new Date(communication.response_timestamp), 'MMM d, h:mm a')
                        : 'Recently'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Request-Specific Actions */}
        <div className="space-y-4">
          <ActionWorkflow 
            requestType={communication.request_type} 
            patientName={communication.patient_name}
            communication={communication}
          />
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