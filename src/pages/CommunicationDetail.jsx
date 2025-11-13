import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { 
  ArrowLeft, Phone, Mail, MessageSquare, User, Clock, 
  Calendar, Sparkles, Send, Loader2, Play, FileText,
  CheckCircle, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ExportShareButtons from '../components/communication/ExportShareButtons';

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

  const { data: communication, isLoading } = useQuery({
    queryKey: ['communication', commId],
    queryFn: async () => {
      const allComms = await base44.entities.PatientCommunication.list();
      return allComms.find(c => c.id === commId);
    },
    enabled: !!commId
  });

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
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a customer service representative at DCA Pharmacy. A patient has sent the following message:

"${communication.message_content}"

Request Type: ${communication.request_type?.replace(/_/g, ' ')}
Channel: ${communication.channel}

Generate a professional, empathetic, and helpful response to this patient. Be concise, friendly, and address their concern directly.`,
      });
      
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
                <p className="text-gray-800 font-semibold text-sm">
                  {communication.request_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
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

            {/* Patient Message/Transcript */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {communication.channel === 'phone' ? 'Transcript' : 'Message'}
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {communication.transcript || communication.message_content}
              </p>
            </div>

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
        </div>

        {/* Sidebar - Right Side (1 column) */}
        <div className="space-y-6">
          {/* AI Recommended Response */}
          {communication.recommended_response && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8B1F1F]" />
                AI Recommended Response
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {communication.recommended_response}
                </p>
              </div>
              <Button
                onClick={() => setResponseText(communication.recommended_response)}
                className="w-full mt-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700"
              >
                Use This Response
              </Button>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
}