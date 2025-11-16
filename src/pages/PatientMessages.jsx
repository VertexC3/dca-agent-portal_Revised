import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Loader2 } from 'lucide-react';
import MessageThread from '../components/messaging/MessageThread';

export default function PatientMessages() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#8B1F1F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-[#8B1F1F]" />
          Communication
        </h1>
        <p className="text-gray-600">Chat with your pharmacy team</p>
      </div>

      <MessageThread patientEmail={user?.email} isStaffView={false} />
    </div>
  );
}