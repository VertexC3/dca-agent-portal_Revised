import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Zap, Search, BookOpen,
  Phone, Mail, Send, RefreshCw, UserPlus, FileText,
  ChevronDown, ChevronUp, Clock, ArrowUpCircle, ExternalLink, Bot, MessageSquare, X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FloatingWidget from './FloatingWidget';
import CommunicationDetailModal from './CommunicationDetailModal';

const kbArticles = [
  { id: 1, title: 'How to use Semaglutide injections', category: 'medication_inquiry' },
  { id: 2, title: 'Tirzepatide side effects & what to expect', category: 'side_effects' },
  { id: 3, title: 'Prescription refill process', category: 'prescription_refill' },
  { id: 4, title: 'Delivery & shipping FAQs', category: 'delivery_status' },
  { id: 5, title: 'Billing & payment questions', category: 'billing_question' },
  { id: 6, title: 'Insurance coverage questions', category: 'insurance_question' },
  { id: 7, title: 'Injection site instructions', category: 'medication_inquiry' },
  { id: 8, title: 'Storage & handling medications', category: 'medication_inquiry' },
];

function SectionHeader({ icon: Icon, title, color = 'bg-[#8B1F1F]', badge, extra, onPopOut }) {
  return (
    <div className={`px-3 py-2 ${color} text-white flex items-center justify-between`}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        <h3 className="font-bold text-xs uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex items-center gap-1.5">
        {badge}
        {extra}
        <button
          onClick={onPopOut}
          className="p-0.5 rounded hover:bg-white/20 transition-colors"
          title="Pop out"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

const ActionModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const CHANNEL_ICON = { phone: Phone, email: Mail, text: Send, ai_agent: Bot };
const CHANNEL_LABEL = { phone: 'Phone', email: 'Email', text: 'SMS', ai_agent: 'AI Agent' };
const CHANNEL_COLOR = {
  phone:    'text-blue-700 bg-blue-50',
  email:    'text-purple-700 bg-purple-50',
  text:     'text-green-700 bg-green-50',
  ai_agent: 'text-orange-700 bg-orange-50',
};

const MEDS = ['Semaglutide 2.4mg', 'Metformin 500mg', 'Ozempic 0.5mg'];

// Pad messages to at least 10 for demo
function padMessages(msgs, patient) {
  const extras = [
    { id: 'X-1', date: '2026-03-01', type: 'email',    subject: 'Refill confirmation',       summary: 'Confirmed refill for Semaglutide 2.4mg. Ready for pickup.',          agent: 'AI Agent',  order_id: null, medication: 'Semaglutide 2.4mg' },
    { id: 'X-2', date: '2026-02-20', type: 'text',     subject: 'Delivery on the way',        summary: 'Shipment is out for delivery. Expected by 5 PM.',                    agent: 'Sarah K.',  order_id: null, medication: 'Metformin 500mg' },
    { id: 'X-3', date: '2026-02-10', type: 'phone',    subject: 'Side effects question',      summary: 'Patient asked about nausea. Advised to take with food.',              agent: 'Mike T.',   order_id: null, medication: 'Ozempic 0.5mg' },
    { id: 'X-4', date: '2026-01-28', type: 'email',    subject: 'Insurance pre-auth update',  summary: 'Insurance pre-authorization approved for next 3 months.',             agent: 'Sarah K.',  order_id: null, medication: 'Semaglutide 2.4mg' },
    { id: 'X-5', date: '2026-01-22', type: 'ai_agent', subject: 'Post-delivery follow-up',    summary: 'AI followed up on last delivery. Patient confirmed no issues.',       agent: 'AI Agent',  order_id: null, medication: 'Metformin 500mg' },
    { id: 'X-6', date: '2025-12-30', type: 'text',     subject: 'Holiday schedule notice',    summary: 'Informed patient pharmacy closes Dec 31. Order placed in advance.',   agent: 'Mike T.',   order_id: null, medication: 'Ozempic 0.5mg' },
    { id: 'X-7', date: '2025-12-15', type: 'phone',    subject: 'Dosage adjustment query',    summary: 'Doctor changed dosage to 2.4mg. Patient informed and acknowledged.', agent: 'Sarah K.',  order_id: null, medication: 'Semaglutide 2.4mg' },
  ];
  const combined = [...(msgs || [])];
  for (const e of extras) {
    if (combined.length >= 10) break;
    combined.push(e);
  }
  return combined;
}

export default function AgentRightPanel({ patient, onOpenMessage, onStartWorkflow, topSlot }) {
  const [kbSearch, setKbSearch] = useState('');
  const [kbExpanded, setKbExpanded] = useState(false);
  const [expandedMsgId, setExpandedMsgId] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showQuickActionsPanel, setShowQuickActionsPanel] = useState(false);
  
  // Modal states
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

  // Pop-out state
  const [floats, setFloats] = useState({ priority: false, kb: false });
  const popOut = (key) => setFloats(f => ({ ...f, [key]: true }));
  const popIn = (key) => setFloats(f => ({ ...f, [key]: false }));

  const filteredKb = kbArticles.filter(a =>
    !kbSearch || a.title.toLowerCase().includes(kbSearch.toLowerCase())
  );

  const allMessages = padMessages(patient?.communications, patient);

  const sortedMessages = [...allMessages].sort((a, b) => {
    if (sortBy === 'latest') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'channel') return (a.type || '').localeCompare(b.type || '');
    if (MEDS.includes(sortBy)) {
      const aMatch = (a.medication || '') === sortBy ? -1 : 1;
      const bMatch = (b.medication || '') === sortBy ? -1 : 1;
      return aMatch - bMatch;
    }
    return 0;
  });

  const SORT_OPTIONS = [
    { key: 'latest',   label: 'Latest' },
    { key: 'channel',  label: 'By Channel' },
    ...MEDS.map(m => ({ key: m, label: m })),
  ];

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortBy)?.label || 'Latest';

  // ---- Reusable section content ----
  const PriorityContent = () => (
    <div className="divide-y divide-gray-100 max-h-[32rem] overflow-y-auto">
      {!patient ? (
        <div className="p-4 text-center text-xs text-gray-500">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-gray-300" />
          Select a patient to view messages
        </div>
      ) : sortedMessages.length === 0 ? (
        <div className="p-4 text-center text-xs text-gray-500">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-400" />
          No messages
        </div>
      ) : (
        sortedMessages.map(msg => {
          const Icon = CHANNEL_ICON[msg.type] || MessageSquare;
          const isExpanded = expandedMsgId === msg.id;
          return (
            <div key={msg.id} className="border-b border-gray-100 last:border-0">
              <button
                onClick={() => setExpandedMsgId(isExpanded ? null : msg.id)}
                className="w-full text-left flex items-start gap-2 p-2.5 hover:bg-red-50/50 transition-colors group"
              >
                <span className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full ${CHANNEL_COLOR[msg.type] || 'bg-gray-100 text-gray-500'}`}>
                  <Icon className="w-3 h-3" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-[#8B1F1F] transition-colors truncate">{msg.subject}</p>
                  <p className="text-xs text-gray-500 leading-snug mt-0.5 truncate">{msg.summary}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                    <span className="font-medium">{CHANNEL_LABEL[msg.type] || msg.type}</span>
                    <span>·</span>
                    <span>{msg.agent}</span>
                    <span className="flex items-center gap-0.5 ml-auto">
                      <Clock className="w-2.5 h-2.5" />{msg.date}
                    </span>
                    <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 px-3 py-3 text-xs text-gray-700 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${CHANNEL_COLOR[msg.type] || 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-3 h-3" />{CHANNEL_LABEL[msg.type] || msg.type}
                    </span>
                    {msg.medication && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{msg.medication}</span>
                    )}
                  </div>
                  <p className="text-gray-800 leading-relaxed">{msg.summary}</p>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Handled by: <strong className="text-gray-600">{msg.agent}</strong></span>
                    <span>{msg.date}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  const QuickContent = () => (
    <div className="p-2 grid grid-cols-2 gap-2.5">
      <Button size="sm" variant="outline" onClick={() => onStartWorkflow?.('refill', { selectedRx: [] })}
        className="h-12 text-xs flex-col justify-center gap-1 border-gray-200 hover:bg-blue-50 hover:border-blue-300">
        <RefreshCw className="w-4 h-4 text-blue-600" />
        Refill Rx
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowCallModal(true)}
        className="h-12 text-xs flex-col justify-center gap-1 border-gray-200 hover:bg-green-50 hover:border-green-300">
        <Phone className="w-4 h-4 text-green-600" />
        Log Call
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowEmailModal(true)}
        className="h-12 text-xs flex-col justify-center gap-1 border-gray-200 hover:bg-purple-50 hover:border-purple-300">
        <Mail className="w-4 h-4 text-purple-600" />
        Send Email
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowTextModal(true)}
        className="h-12 text-xs flex-col justify-center gap-1 border-gray-200 hover:bg-orange-50 hover:border-orange-300">
        <Send className="w-4 h-4 text-orange-600" />
        Send Text
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowEscalateModal(true)}
        className="h-12 text-xs flex-col justify-center gap-1 border-gray-200 hover:bg-red-50 hover:border-red-300">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        Escalate
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowNoteModal(true)}
        className="h-12 text-xs flex-col justify-center gap-1 border-gray-200 hover:bg-yellow-50 hover:border-yellow-300">
        <FileText className="w-4 h-4 text-yellow-600" />
        Add Note
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowNewPatientModal(true)}
        className="h-12 text-xs flex-col justify-center gap-1 border-gray-200 hover:bg-teal-50 hover:border-teal-300 col-span-2">
        <UserPlus className="w-4 h-4 text-teal-600" />
        New Patient Record
      </Button>
    </div>
  );

  const AlertsContent = () => (
    <div className="p-2 space-y-1.5">
      {!patient ? (
        <p className="text-xs text-gray-400 text-center py-2">No patient selected</p>
      ) : patient.prescriptions.filter(p => p.refills <= 1).length === 0 &&
         patient.invoices.filter(i => i.status !== 'paid').length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">No alerts</p>
      ) : (
        <>
          {patient.prescriptions.filter(p => p.refills <= 1).map(rx => (
            <div key={rx.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span className="text-yellow-800"><strong>{rx.name}:</strong> {rx.refills === 0 ? 'No refills' : `${rx.refills} left`}</span>
            </div>
          ))}
          {patient.invoices.filter(i => i.status !== 'paid').map(inv => (
            <div key={inv.id} className="p-2 bg-red-50 border border-red-200 rounded text-xs flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-800"><strong>{inv.number}:</strong> ${inv.amount.toFixed(2)} unpaid</span>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const KbContent = () => (
    <>
      <div className="p-2 border-b border-gray-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
          <Input className="pl-8 h-7 text-xs border-gray-200" placeholder="Search articles..."
            value={kbSearch} onChange={e => setKbSearch(e.target.value)} />
        </div>
      </div>
      <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
        {filteredKb.map(a => (
          <button key={a.id}
            className="w-full text-left p-2.5 hover:bg-red-50 transition-colors text-xs text-gray-700 hover:text-[#8B1F1F] flex items-center justify-between group">
            <span>{a.title}</span>
            <FileText className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0" />
          </button>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* ⚡ Quick Actions FAB — fixed to bottom-right */}
      <button
        onClick={() => setShowQuickActionsPanel(v => !v)}
        title="Quick Actions"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-0 overflow-hidden rounded-full shadow-2xl transition-all duration-300 hover:pr-4"
        style={{ background: 'linear-gradient(135deg, #8B1F1F 0%, #c0392b 100%)' }}
      >
        <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
          <Zap className="w-6 h-6 text-white drop-shadow" fill="white" />
        </div>
        <span className="max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap text-white font-bold text-sm uppercase tracking-wide transition-all duration-300 opacity-0 group-hover:opacity-100">
          Quick Actions
        </span>
      </button>

      <div className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 p-3">
        {topSlot ? <div className="border-b border-gray-200">{topSlot}</div> : null}

        {/* Patient Messages */}
        {!floats.priority && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Custom header with sort dropdown */}
            <div className="px-3 py-2 bg-[#8B1F1F] text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ArrowUpCircle className="w-3.5 h-3.5" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Patient Messages</h3>
                {patient && <Badge className="bg-white text-[#8B1F1F] text-xs px-1.5 font-bold ml-1">{allMessages.length}</Badge>}
              </div>
              <div className="flex items-center gap-1.5">
                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(v => !v)}
                    className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-2 py-0.5 rounded transition-colors"
                  >
                    {currentSortLabel} <ChevronDown className="w-3 h-3" />
                  </button>
                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                      <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-44 overflow-hidden">
                        {SORT_OPTIONS.map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => { setSortBy(opt.key); setShowSortMenu(false); }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-red-50 transition-colors ${sortBy === opt.key ? 'text-[#8B1F1F] font-bold bg-red-50' : 'text-gray-700'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => popOut('priority')}
                  className="p-0.5 rounded hover:bg-white/20 transition-colors"
                  title="Pop out"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
            <PriorityContent />
          </div>
        )}
        {floats.priority && (
          <>
            <div className="bg-white border border-dashed border-gray-300 rounded-lg p-3 text-center text-xs text-gray-400">
              Patient Messages — popped out
            </div>
            <FloatingWidget title="Patient Messages" onClose={() => popIn('priority')} defaultPos={{ x: 80, y: 120 }}>
              <PriorityContent />
            </FloatingWidget>
          </>
        )}

        {/* Quick Actions Slide-out Panel — triggered by FAB below */}
        {showQuickActionsPanel && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowQuickActionsPanel(false)} />
            <div
              className="fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
              style={{ animation: 'slideInRight 0.22s cubic-bezier(0.4,0,0.2,1)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#8B1F1F] to-[#a52828] text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm uppercase tracking-wide block leading-tight">Quick Actions</span>
                    <span className="text-xs text-white/70">{patient?.name || 'No patient selected'}</span>
                  </div>
                </div>
                <button onClick={() => setShowQuickActionsPanel(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <QuickContent />
              </div>
            </div>
          </>
        )}
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Knowledge Base */}
        {!floats.kb && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-3 py-2 bg-[#8B1F1F] text-white flex items-center justify-between">
              <button
                className="flex items-center gap-1.5 flex-1"
                onClick={() => setKbExpanded(!kbExpanded)}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Knowledge Base</h3>
                {kbExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
              </button>
              <button onClick={() => popOut('kb')} className="ml-2 p-0.5 rounded hover:bg-white/20" title="Pop out">
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            {kbExpanded ? <KbContent /> : (
              <button className="w-full text-center p-2 text-xs text-[#8B1F1F] hover:bg-red-50 transition-colors font-semibold"
                onClick={() => setKbExpanded(true)}>
                Browse {kbArticles.length} articles →
              </button>
            )}
          </div>
        )}
        {floats.kb && (
          <>
            <div className="bg-white border border-dashed border-gray-300 rounded-lg p-3 text-center text-xs text-gray-400">
              Knowledge Base — popped out
            </div>
            <FloatingWidget title="Knowledge Base" onClose={() => popIn('kb')} defaultPos={{ x: 200, y: 160 }}>
              <KbContent />
            </FloatingWidget>
          </>
        )}

      </div>

      {/* Action Modals */}
      <ActionModal isOpen={showRefillModal} onClose={() => setShowRefillModal(false)} title="Request Prescription Refill">
        <div className="space-y-3 text-sm">
          <p className="text-gray-600">Refill prescriptions for {patient?.name || 'patient'}:</p>
          {patient?.prescriptions.map(rx => (
            <label key={rx.id} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span>{rx.name} ({rx.dosage})</span>
            </label>
          ))}
          <div className="flex gap-2 justify-end pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setShowRefillModal(false)}>Cancel</Button>
            <Button className="bg-[#8B1F1F] hover:bg-[#721919]" size="sm" onClick={() => { setShowRefillModal(false); alert('Refill request submitted'); }}>Submit</Button>
          </div>
        </div>
      </ActionModal>

      <ActionModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} title="Log Call">
        <div className="space-y-3 text-sm">
          <textarea placeholder="Call notes..." className="w-full border border-gray-200 rounded p-2 text-xs h-20 resize-none" />
          <div className="flex gap-2 justify-end pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setShowCallModal(false)}>Cancel</Button>
            <Button className="bg-[#8B1F1F] hover:bg-[#721919]" size="sm" onClick={() => { setShowCallModal(false); alert('Call logged'); }}>Save</Button>
          </div>
        </div>
      </ActionModal>

      <ActionModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} title="Send Email">
        <div className="space-y-3 text-sm">
          <input placeholder="Subject..." className="w-full border border-gray-200 rounded p-2 text-xs" />
          <textarea placeholder="Message..." className="w-full border border-gray-200 rounded p-2 text-xs h-24 resize-none" />
          <div className="flex gap-2 justify-end pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setShowEmailModal(false)}>Cancel</Button>
            <Button className="bg-[#8B1F1F] hover:bg-[#721919]" size="sm" onClick={() => { setShowEmailModal(false); alert('Email sent'); }}>Send</Button>
          </div>
        </div>
      </ActionModal>

      <ActionModal isOpen={showTextModal} onClose={() => setShowTextModal(false)} title="Send Text Message">
        <div className="space-y-3 text-sm">
          <textarea placeholder="Message..." className="w-full border border-gray-200 rounded p-2 text-xs h-20 resize-none" />
          <div className="flex gap-2 justify-end pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setShowTextModal(false)}>Cancel</Button>
            <Button className="bg-[#8B1F1F] hover:bg-[#721919]" size="sm" onClick={() => { setShowTextModal(false); alert('Text sent'); }}>Send</Button>
          </div>
        </div>
      </ActionModal>

      <ActionModal isOpen={showEscalateModal} onClose={() => setShowEscalateModal(false)} title="Escalate to Manager">
        <div className="space-y-3 text-sm">
          <textarea placeholder="Reason for escalation..." className="w-full border border-gray-200 rounded p-2 text-xs h-20 resize-none" />
          <div className="flex gap-2 justify-end pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setShowEscalateModal(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" size="sm" onClick={() => { setShowEscalateModal(false); alert('Case escalated'); }}>Escalate</Button>
          </div>
        </div>
      </ActionModal>

      <ActionModal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Internal Note">
        <div className="space-y-3 text-sm">
          <textarea placeholder="Note content..." className="w-full border border-gray-200 rounded p-2 text-xs h-20 resize-none" />
          <div className="flex gap-2 justify-end pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setShowNoteModal(false)}>Cancel</Button>
            <Button className="bg-[#8B1F1F] hover:bg-[#721919]" size="sm" onClick={() => { setShowNoteModal(false); alert('Note added'); }}>Save</Button>
          </div>
        </div>
      </ActionModal>

      <ActionModal isOpen={showNewPatientModal} onClose={() => setShowNewPatientModal(false)} title="Create New Patient Record">
        <div className="space-y-3 text-sm">
          <input placeholder="Patient name..." className="w-full border border-gray-200 rounded p-2 text-xs" />
          <input placeholder="Email..." className="w-full border border-gray-200 rounded p-2 text-xs" />
          <input placeholder="Phone..." className="w-full border border-gray-200 rounded p-2 text-xs" />
          <div className="flex gap-2 justify-end pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setShowNewPatientModal(false)}>Cancel</Button>
            <Button className="bg-teal-600 hover:bg-teal-700" size="sm" onClick={() => { setShowNewPatientModal(false); alert('Patient record created'); }}>Create</Button>
          </div>
        </div>
      </ActionModal>
    </>
  );
}