import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, User, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MessageThread from '../components/messaging/MessageThread';
import { format } from 'date-fns';

export default function StaffMessaging() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 1000),
    refetchInterval: 3000
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['communications'],
    queryFn: () => base44.entities.PatientCommunication.list('-timestamp', 100)
  });

  // Group messages by patient
  const patientThreads = messages.reduce((acc, msg) => {
    const email = msg.patient_email;
    if (!acc[email]) {
      acc[email] = {
        patient_email: email,
        patient_name: msg.sender_type === 'patient' ? msg.sender_name : 'Patient',
        messages: [],
        unread_count: 0,
        last_message: null
      };
    }
    acc[email].messages.push(msg);
    if (!msg.read && msg.sender_type === 'patient') {
      acc[email].unread_count++;
    }
    if (!acc[email].last_message || new Date(msg.created_date) > new Date(acc[email].last_message.created_date)) {
      acc[email].last_message = msg;
    }
    return acc;
  }, {});

  // Also include patients from communications who haven't messaged yet
  communications.forEach(comm => {
    if (!patientThreads[comm.patient_email]) {
      patientThreads[comm.patient_email] = {
        patient_email: comm.patient_email,
        patient_name: comm.patient_name,
        messages: [],
        unread_count: 0,
        last_message: null
      };
    } else if (!patientThreads[comm.patient_email].patient_name || patientThreads[comm.patient_email].patient_name === 'Patient') {
      patientThreads[comm.patient_email].patient_name = comm.patient_name;
    }
  });

  const threadList = Object.values(patientThreads)
    .sort((a, b) => {
      const dateA = a.last_message ? new Date(a.last_message.created_date) : new Date(0);
      const dateB = b.last_message ? new Date(b.last_message.created_date) : new Date(0);
      return dateB - dateA;
    })
    .filter(thread => 
      thread.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.patient_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#8B1F1F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-[#8B1F1F]" />
          Patient Messages
        </h1>
        <p className="text-gray-600">Manage all patient communications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {threadList.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No patient threads</p>
            ) : (
              threadList.map((thread) => (
                <button
                  key={thread.patient_email}
                  onClick={() => setSelectedPatient(thread.patient_email)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedPatient === thread.patient_email
                      ? 'bg-[#8B1F1F]/10 border-[#8B1F1F]'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <p className="font-semibold text-gray-800 text-sm">{thread.patient_name}</p>
                    </div>
                    {thread.unread_count > 0 && (
                      <Badge className="bg-[#8B1F1F] text-white">{thread.unread_count}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{thread.patient_email}</p>
                  {thread.last_message && (
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {thread.last_message.message_content}
                    </p>
                  )}
                  {thread.last_message && (
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(thread.last_message.created_date), 'MMM d, h:mm a')}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <MessageThread patientEmail={selectedPatient} isStaffView={true} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a patient to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}