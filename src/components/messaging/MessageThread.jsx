import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Send, Paperclip, Loader2, CheckCheck, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

export default function MessageThread({ patientEmail, isStaffView = false }) {
  const [messageText, setMessageText] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', patientEmail],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.list('-created_date', 500);
      return allMessages.filter(m => m.patient_email === patientEmail);
    },
    refetchInterval: 3000, // Poll every 3 seconds for real-time feel
    enabled: !!patientEmail
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setMessageText('');
      setAttachment(null);
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Message.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
    }
  });

  useEffect(() => {
    // Mark unread messages as read
    if (messages && user) {
      messages.forEach(msg => {
        if (!msg.read && msg.sender_email !== user.email) {
          markAsReadMutation.mutate({
            id: msg.id,
            data: { read: true, read_at: new Date().toISOString() }
          });
        }
      });
    }
  }, [messages, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setAttachment({ url: result.file_url, name: file.name });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && !attachment) return;

    const messageData = {
      sender_email: user.email,
      sender_name: user.full_name,
      sender_type: isStaffView ? 'staff' : 'patient',
      recipient_email: isStaffView ? patientEmail : 'pharmacy',
      patient_email: patientEmail,
      message_content: messageText,
      attachment_url: attachment?.url || '',
      attachment_name: attachment?.name || ''
    };

    await sendMessageMutation.mutateAsync(messageData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_email === user?.email;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-[#8B1F1F] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs font-semibold mb-1">{msg.sender_name}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.message_content}</p>
                    {msg.attachment_url && (
                      <a
                        href={msg.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 mt-2 text-xs underline"
                      >
                        <Paperclip className="w-3 h-3" />
                        {msg.attachment_name || 'Attachment'}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <span>{format(new Date(msg.created_date), 'h:mm a')}</span>
                    {isOwnMessage && (
                      msg.read ? (
                        <CheckCheck className="w-3 h-3 text-blue-500" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        {attachment && (
          <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Paperclip className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700">{attachment.name}</span>
            </div>
            <button onClick={() => setAttachment(null)} className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="message-attachment"
            disabled={uploadingFile}
          />
          <label htmlFor="message-attachment">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={uploadingFile}
              className="cursor-pointer"
              onClick={() => document.getElementById('message-attachment').click()}
            >
              {uploadingFile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </Button>
          </label>
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={(!messageText.trim() && !attachment) || sendMessageMutation.isPending}
            className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}