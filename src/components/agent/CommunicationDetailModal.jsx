import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  X, Phone, Mail, Send, Bot, Clock, User, Pill, Package,
  MessageSquare, ChevronRight, AlertTriangle, Mic, FileText, RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const CHANNEL_CONFIG = {
  phone:    { label: 'Phone Call',  icon: Phone,        bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-500' },
  email:    { label: 'Email',       icon: Mail,         bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  text:     { label: 'SMS / Text',  icon: Send,         bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-800',  dot: 'bg-green-500' },
  ai_agent: { label: 'AI Agent',    icon: Bot,          bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
};

// Medication images mapped by name keyword
const MED_IMAGES = {
  semaglutide: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
  metformin:   'https://images.unsplash.com/photo-1550572017-9e5d4d6bde24?w=200&h=200&fit=crop',
  tirzepatide: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
  ozempic:     'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
  victoza:     'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
  default:     'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop',
};

function getMedImage(name) {
  if (!name) return MED_IMAGES.default;
  const lower = name.toLowerCase();
  for (const key of Object.keys(MED_IMAGES)) {
    if (lower.includes(key)) return MED_IMAGES[key];
  }
  return MED_IMAGES.default;
}

// Build a simulated conversation thread from the communication record
function buildThread(comm, patient) {
  const threads = {
    phone: [
      { from: 'patient', text: `"Hi, I'm calling about my ${comm.subject.toLowerCase()}."`, time: '0:00' },
      { from: 'agent',   text: `"Hello ${patient.name.split(' ')[0]}, I can help with that. Can you confirm your date of birth?"`, time: '0:18' },
      { from: 'patient', text: `"Sure, it's ${patient.dob}."`, time: '0:24' },
      { from: 'agent',   text: `"Thank you. I can see your account. ${comm.summary}"`, time: '0:45' },
      { from: 'patient', text: '"Great, thank you so much!"', time: comm.duration ? comm.duration.replace('m', ':').replace('s', '') : '2:30' },
    ],
    email: [
      { from: 'patient', text: `Subject: ${comm.subject}\n\nHi,\n\nI wanted to reach out regarding my recent order. ${comm.summary}\n\nThank you,\n${patient.name}`, time: format(new Date(comm.date), 'h:mm a') },
      { from: 'agent',   text: `Hi ${patient.name.split(' ')[0]},\n\nThank you for reaching out. ${comm.summary} Please don't hesitate to contact us if you have any further questions.\n\nBest regards,\n${comm.agent}\nDCA Pharmacy`, time: format(new Date(new Date(comm.date).getTime() + 2 * 3600000), 'h:mm a') },
    ],
    text: [
      { from: 'patient', text: comm.subject, time: format(new Date(comm.date), 'h:mm a') },
      { from: 'agent',   text: comm.summary, time: format(new Date(new Date(comm.date).getTime() + 300000), 'h:mm a') },
      { from: 'patient', text: 'Thank you!', time: format(new Date(new Date(comm.date).getTime() + 600000), 'h:mm a') },
    ],
    ai_agent: [
      { from: 'patient', text: comm.subject, time: format(new Date(comm.date), 'h:mm a') },
      { from: 'agent',   text: `AI Agent: I can help with that. ${comm.summary}`, time: format(new Date(new Date(comm.date).getTime() + 30000), 'h:mm a'), isAI: true },
      { from: 'patient', text: 'OK sounds good.', time: format(new Date(new Date(comm.date).getTime() + 90000), 'h:mm a') },
      { from: 'agent',   text: 'Is there anything else I can assist you with today?', time: format(new Date(new Date(comm.date).getTime() + 120000), 'h:mm a'), isAI: true },
    ],
  };
  return threads[comm.type] || threads.text;
}

export default function CommunicationDetailModal({ comm, patient, onClose }) {
  const [replyText, setReplyText] = useState('');
  const cfg = CHANNEL_CONFIG[comm.type] || CHANNEL_CONFIG.phone;
  const Icon = cfg.icon;

  // Find linked order and prescription
  const linkedOrder = patient.orders.find(o => o.id === comm.order_id);
  const linkedRx = linkedOrder
    ? patient.prescriptions.find(rx => linkedOrder.medication.toLowerCase().includes(rx.name.split(' ')[0].toLowerCase()))
    : null;

  const thread = buildThread(comm, patient);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 ${cfg.bg} border-b ${cfg.border} flex items-start justify-between`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.badge} flex-shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-gray-900 text-base">{comm.subject}</h2>
                <Badge className={`text-xs ${cfg.badge}`}>{cfg.label}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{patient.name}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(comm.date), 'MMMM d, yyyy')}</span>
                {comm.duration && <span className="flex items-center gap-1"><Mic className="w-3 h-3" />{comm.duration}</span>}
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />Handled by <strong className="text-gray-700 ml-0.5">{comm.agent}</strong></span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors ml-2 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Context cards row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Patient snapshot */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Patient Context</p>
                <div className="flex items-center gap-3 mb-2">
                  {patient.profile_picture ? (
                    <img src={patient.profile_picture} alt={patient.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#8B1F1F] flex items-center justify-center text-white font-bold text-sm">{patient.name.charAt(0)}</div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-500">{patient.email}</p>
                  </div>
                </div>
                <div className="space-y-0.5 text-xs">
                  <p><span className="text-gray-500">Phone:</span> <span className="font-semibold text-gray-800">{patient.phone}</span></p>
                  <p><span className="text-gray-500">Insurance:</span> <span className="font-semibold text-gray-800">{patient.insurance}</span></p>
                  {patient.allergies && patient.allergies !== 'None known' && (
                    <p className="flex items-center gap-1 text-red-700">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="font-semibold">Allergies: {patient.allergies}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Linked order / medication */}
              {linkedOrder ? (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Linked Order</p>
                  <div className="flex items-start gap-3">
                    <img
                      src={getMedImage(linkedOrder.medication)}
                      alt={linkedOrder.medication}
                      className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                      <p className="font-bold text-gray-900 truncate">{linkedOrder.medication}</p>
                      <p><span className="text-gray-500">Order:</span> <span className="font-semibold text-[#8B1F1F]">#{linkedOrder.receipt}</span></p>
                      <p><span className="text-gray-500">Date:</span> <span className="font-semibold">{format(new Date(linkedOrder.date), 'MM/dd/yyyy')}</span></p>
                      <Badge className={`text-xs mt-1 ${
                        linkedOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        linkedOrder.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                        linkedOrder.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{linkedOrder.status}</Badge>
                    </div>
                  </div>
                  {linkedRx && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs flex items-center gap-2">
                      <Pill className="w-3.5 h-3.5 text-[#8B1F1F] flex-shrink-0" />
                      <span className="text-gray-600">Rx #{linkedRx.rx_number} · {linkedRx.dosage} · <span className="font-semibold">{linkedRx.refills} refills left</span></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                  <p className="text-xs text-gray-400">No linked order</p>
                </div>
              )}
            </div>

            {/* Conversation thread */}
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Conversation Thread
              </p>
              <div className="space-y-3">
                {thread.map((msg, i) => {
                  const isPatient = msg.from === 'patient';
                  return (
                    <div key={i} className={`flex gap-3 ${isPatient ? '' : 'flex-row-reverse'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        isPatient ? 'bg-gray-400' : msg.isAI ? 'bg-orange-500' : 'bg-[#8B1F1F]'
                      }`}>
                        {isPatient ? patient.name.charAt(0) : msg.isAI ? <Bot className="w-4 h-4" /> : comm.agent.charAt(0)}
                      </div>
                      <div className={`max-w-[75%] rounded-xl px-3 py-2 text-xs whitespace-pre-line ${
                        isPatient
                          ? 'bg-gray-100 text-gray-800 rounded-tl-none'
                          : msg.isAI
                          ? 'bg-orange-50 border border-orange-200 text-gray-800 rounded-tr-none'
                          : 'bg-[#8B1F1F]/10 border border-[#8B1F1F]/20 text-gray-800 rounded-tr-none'
                      }`}>
                        <p className={`text-xs font-bold mb-0.5 ${isPatient ? 'text-gray-600' : msg.isAI ? 'text-orange-700' : 'text-[#8B1F1F]'}`}>
                          {isPatient ? patient.name.split(' ')[0] : msg.isAI ? 'AI Agent' : comm.agent}
                        </p>
                        {msg.text}
                        <p className="text-gray-400 text-xs mt-1 text-right">{msg.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resolution summary */}
            <div className={`p-3 rounded-xl border ${cfg.border} ${cfg.bg}`}>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Resolution Summary</p>
              <p className="text-xs text-gray-700">{comm.summary}</p>
            </div>

          </div>
        </div>

        {/* Footer: reply bar */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <Textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Add a follow-up note or reply..."
              className="text-xs h-10 resize-none bg-white flex-1 min-h-0 py-2"
            />
            <div className="flex flex-col gap-1">
              <Button size="sm" className="h-5 text-xs bg-[#8B1F1F] hover:bg-[#721919] px-3 whitespace-nowrap">
                <Send className="w-3 h-3 mr-1" />Reply
              </Button>
              <Button size="sm" variant="outline" className="h-5 text-xs px-3 whitespace-nowrap">
                <RefreshCw className="w-3 h-3 mr-1" />Refill
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}