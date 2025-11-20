import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { 
  ArrowLeft, Phone, Mail, MessageSquare, User, Clock, 
  Calendar, Sparkles, Send, Loader2, Play, FileText,
  CheckCircle, AlertCircle, ThumbsUp, ThumbsDown, Edit3,
  MapPin, ChevronDown, Package, CreditCard, Pill, AlertTriangle,
  CalendarClock, HelpCircle, FileQuestion, MessageCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import PatientInfoPanel from '../components/communication/PatientInfoPanel';
import SharedNotes from '../components/communication/SharedNotes';
import PatientProfileDialog from '../components/communication/PatientProfileDialog';
import ActionWorkflow from '../components/communication/ActionWorkflow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedWorkflowType, setSelectedWorkflowType] = useState(null);
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
  const [showAddAddressDialog, setShowAddAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({ address: '', type: 'billing' });
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
      <div className="flex items-center gap-3 mb-4">
        <Link 
          to={createPageUrl('Dashboard')}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Communication Details</h1>
      </div>

      {/* Medical Info - Horizontal across all columns */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Medical Information
        </h3>
        <div className="grid grid-cols-4 gap-4 text-xs">
          {communication.patient_allergies && (
            <div className="flex items-start gap-2 text-gray-700">
              <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-red-700 block">Allergies</span>
                <span>{communication.patient_allergies}</span>
              </div>
            </div>
          )}
          {communication.current_medications && (
            <div className="flex items-start gap-2 text-gray-700">
              <Pill className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium block">Medications</span>
                <span>{communication.current_medications}</span>
              </div>
            </div>
          )}
          {communication.known_conditions && (
            <div className="flex items-start gap-2 text-gray-700">
              <AlertCircle className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium block">Conditions</span>
                <span>{communication.known_conditions}</span>
              </div>
            </div>
          )}
          {communication.insurance_provider && (
            <div className="flex items-start gap-2 text-gray-700">
              <CreditCard className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium block">Insurance</span>
                <span>{communication.insurance_provider}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Patient Info & Message */}
        <div className="space-y-3">
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
              <div className="relative">
                <button
                  onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 w-full text-left"
                >
                  <MapPin className="w-3 h-3 text-gray-500" />
                  <span className="text-xs flex-1">{communication.patient_address || '123 Main St, Springfield, IL 62701'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>
                {showAddressDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                    <div className="space-y-2">
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-700">{communication.patient_address || '123 Main St, Springfield, IL 62701'}</span>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Billing</Badge>
                        </div>
                      </div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-700">456 Oak Ave, Portland, OR 97201</span>
                          <Badge className="bg-green-100 text-green-800 text-xs">Delivery</Badge>
                        </div>
                      </div>
                      <div className="border-t pt-2">
                        <button
                          onClick={() => {
                            setShowAddressDropdown(false);
                            setShowAddAddressDialog(true);
                          }}
                          className="w-full p-2 text-xs text-[#8B1F1F] hover:bg-gray-50 rounded font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add New Address
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
            <div 
              className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setShowTranscriptDialog(true)}
            >
              <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                {communication.transcript || communication.message_content}
              </p>
              <p className="text-xs text-[#8B1F1F] mt-2 font-medium">Click to view full transcript →</p>
            </div>
            {communication.channel === 'phone' && communication.voice_recording_url && (
              <audio controls className="w-full mt-2" style={{height: '32px'}}>
                <source src={communication.voice_recording_url} type="audio/mpeg" />
              </audio>
            )}
          </div>

        </div>

        {/* Column 2: Notes */}
        <div className="space-y-3">
          {/* Shared Notes */}
          <SharedNotes communicationId={communication.id} compact={true} />
        </div>

        {/* Column 3: Request Type Actions */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-800 mb-2">Request Types</h3>
          
          <button
            onClick={() => { setSelectedWorkflowType('prescription_refill'); setShowWorkflowDialog(true); }}
            className="w-full p-2 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 text-left transition-all flex items-center gap-2"
          >
            <Pill className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-gray-800">Prescription Refill</span>
          </button>

          <button
            onClick={() => { setSelectedWorkflowType('medication_inquiry'); setShowWorkflowDialog(true); }}
            className="w-full p-2 bg-white hover:bg-purple-50 rounded-lg border border-gray-200 text-left transition-all flex items-center gap-2"
          >
            <HelpCircle className="w-3 h-3 text-purple-600" />
            <span className="text-xs font-medium text-gray-800">Medication Inquiry</span>
          </button>

          <button
            onClick={() => { setSelectedWorkflowType('delivery_status'); setShowWorkflowDialog(true); }}
            className="w-full p-2 bg-white hover:bg-green-50 rounded-lg border border-gray-200 text-left transition-all flex items-center gap-2"
          >
            <Package className="w-3 h-3 text-green-600" />
            <span className="text-xs font-medium text-gray-800">Delivery Status</span>
          </button>

          <button
            onClick={() => { setSelectedWorkflowType('billing_question'); setShowWorkflowDialog(true); }}
            className="w-full p-2 bg-white hover:bg-yellow-50 rounded-lg border border-gray-200 text-left transition-all flex items-center gap-2"
          >
            <CreditCard className="w-3 h-3 text-yellow-600" />
            <span className="text-xs font-medium text-gray-800">Billing Question</span>
          </button>

          <button
            onClick={() => { setSelectedWorkflowType('side_effects'); setShowWorkflowDialog(true); }}
            className="w-full p-2 bg-white hover:bg-red-50 rounded-lg border border-gray-200 text-left transition-all flex items-center gap-2"
          >
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span className="text-xs font-medium text-gray-800">Side Effects</span>
          </button>

          <button
            onClick={() => { setSelectedWorkflowType('appointment_scheduling'); setShowWorkflowDialog(true); }}
            className="w-full p-2 bg-white hover:bg-indigo-50 rounded-lg border border-gray-200 text-left transition-all flex items-center gap-2"
          >
            <CalendarClock className="w-3 h-3 text-indigo-600" />
            <span className="text-xs font-medium text-gray-800">Appointment</span>
          </button>

          <button
            onClick={() => { setSelectedWorkflowType('insurance_question'); setShowWorkflowDialog(true); }}
            className="w-full p-2 bg-white hover:bg-teal-50 rounded-lg border border-gray-200 text-left transition-all flex items-center gap-2"
          >
            <FileQuestion className="w-3 h-3 text-teal-600" />
            <span className="text-xs font-medium text-gray-800">Insurance Question</span>
          </button>

          <button
            onClick={() => { setSelectedWorkflowType('general_inquiry'); setShowWorkflowDialog(true); }}
            className="w-full p-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 text-left transition-all flex items-center gap-2"
          >
            <MessageCircle className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-800">General Inquiry</span>
          </button>
        </div>
      </div>

      {/* Patient Profile Dialog */}
      <PatientProfileDialog 
        open={showPatientProfile} 
        onClose={() => setShowPatientProfile(false)} 
        patient={communication}
      />

      {/* Workflow Dialog */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              {selectedWorkflowType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Workflow
            </DialogTitle>
          </DialogHeader>
          <ActionWorkflow 
            requestType={selectedWorkflowType} 
            patientName={communication.patient_name}
            communication={communication}
          />
        </DialogContent>
      </Dialog>

      {/* Transcript Dialog */}
      <Dialog open={showTranscriptDialog} onOpenChange={setShowTranscriptDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Full {communication.channel === 'phone' ? 'Transcript' : 'Message'}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {communication.transcript || communication.message_content}
            </p>
          </div>
          {communication.channel === 'phone' && communication.voice_recording_url && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Voice Recording</h4>
              <audio controls className="w-full">
                <source src={communication.voice_recording_url} type="audio/mpeg" />
              </audio>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Address Dialog */}
      <Dialog open={showAddAddressDialog} onOpenChange={setShowAddAddressDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-800">Add New Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Address</Label>
              <Input
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                placeholder="123 Main St, City, State ZIP"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Type</Label>
              <Select value={newAddress.type} onValueChange={(val) => setNewAddress({ ...newAddress, type: val })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddAddressDialog(false);
                  setNewAddress({ address: '', type: 'billing' });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Save address logic here
                  alert(`Address saved: ${newAddress.address} (${newAddress.type})`);
                  setShowAddAddressDialog(false);
                  setNewAddress({ address: '', type: 'billing' });
                }}
                disabled={!newAddress.address.trim()}
                className="flex-1 bg-[#8B1F1F] hover:bg-[#721919] text-white"
              >
                Save Address
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}