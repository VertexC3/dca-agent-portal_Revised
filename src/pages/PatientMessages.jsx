import React from 'react';
import { MessageSquare } from 'lucide-react';
import MessageThread from '../components/messaging/MessageThread';

const mockUser = {
  email: "john.doe@example.com",
  full_name: "John Doe"
};

export default function PatientMessages() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-[#8B1F1F]" />
          Communication
        </h1>
        <p className="text-gray-600">Chat with your pharmacy team</p>
      </div>

      <MessageThread patientEmail={mockUser.email} isStaffView={false} />
    </div>
  );
}