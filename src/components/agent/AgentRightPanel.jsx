import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Zap, Search, BookOpen,
  Phone, Mail, Send, RefreshCw, UserPlus, FileText,
  ChevronDown, ChevronUp, Clock, ArrowUpCircle, ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FloatingWidget from './FloatingWidget';



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

const urgencyClasses = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

const quickActionsList = [
  { label: 'Refill Rx', icon: RefreshCw, color: 'text-blue-600', hover: 'hover:bg-blue-50' },
  { label: 'Log Call', icon: Phone, color: 'text-green-600', hover: 'hover:bg-green-50' },
  { label: 'Send Email', icon: Mail, color: 'text-purple-600', hover: 'hover:bg-purple-50' },
  { label: 'Send Text', icon: Send, color: 'text-orange-600', hover: 'hover:bg-orange-50' },
  { label: 'Escalate', icon: AlertTriangle, color: 'text-red-600', hover: 'hover:bg-red-50' },
  { label: 'Add Note', icon: FileText, color: 'text-yellow-600', hover: 'hover:bg-yellow-50' },
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

export default function AgentRightPanel({ patient }) {
  const [kbSearch, setKbSearch] = useState('');
  const [viewedMessages, setViewedMessages] = useState([]);
  const [kbExpanded, setKbExpanded] = useState(false);

  // Pop-out state
  const [floats, setFloats] = useState({ priority: false, quick: false, alerts: false, kb: false });
  const popOut = (key) => setFloats(f => ({ ...f, [key]: true }));
  const popIn  = (key) => setFloats(f => ({ ...f, [key]: false }));

  const filteredKb = kbArticles.filter(a =>
    !kbSearch || a.title.toLowerCase().includes(kbSearch.toLowerCase())
  );

  // Patient-specific messages
  const patientMessages = patient?.communications || [];
  const unviewedMessages = patientMessages.filter(m => !viewedMessages.includes(m.id));

  // ---- Reusable section content ----
  const PriorityContent = () => (
    <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
      {!patient ? (
        <div className="p-4 text-center text-xs text-gray-500">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-gray-300" />
          Select a patient to view messages
        </div>
      ) : patientMessages.length === 0 ? (
        <div className="p-4 text-center text-xs text-gray-500">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-400" />
          No messages
        </div>
      ) : (
        patientMessages.map(msg => (
          <div key={msg.id} className="flex items-start gap-2 p-2.5 hover:bg-gray-50 transition-colors">
            <button
              onClick={() => setViewedMessages(prev => [...prev, msg.id])}
              className="mt-0.5 w-4 h-4 flex-shrink-0 rounded border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              title="Mark as read"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900">{msg.subject}</p>
              <p className="text-xs text-gray-600 leading-snug mt-0.5">{msg.summary}</p>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                <span>{msg.agent}</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />{msg.date}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const QuickContent = () => (
    <div className="p-2 grid grid-cols-2 gap-1.5">
      {quickActionsList.map(action => {
        const Icon = action.icon;
        return (
          <Button key={action.label} size="sm" variant="outline"
            className={`h-8 text-xs justify-start gap-1.5 border-gray-200 ${action.hover}`}>
            <Icon className={`w-3.5 h-3.5 ${action.color}`} />
            {action.label}
          </Button>
        );
      })}
      <Button size="sm" variant="outline"
        className="h-8 text-xs justify-start gap-1.5 border-gray-200 hover:bg-teal-50 col-span-2">
        <UserPlus className="w-3.5 h-3.5 text-teal-600" />
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
    <div className="flex flex-col gap-3 overflow-y-auto h-full">

      {/* Patient Messages */}
      {!floats.priority && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <SectionHeader
            icon={ArrowUpCircle} title="Patient Messages"
            badge={patient && <Badge className="bg-white text-[#8B1F1F] text-xs px-1.5 font-bold">{patientMessages.length}</Badge>}
            onPopOut={() => popOut('priority')}
          />
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

      {/* Quick Actions */}
      {!floats.quick && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <SectionHeader icon={Zap} title="Quick Actions" onPopOut={() => popOut('quick')} />
          <QuickContent />
        </div>
      )}
      {floats.quick && (
        <>
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-3 text-center text-xs text-gray-400">
            Quick Actions — popped out
          </div>
          <FloatingWidget title="Quick Actions" onClose={() => popIn('quick')} defaultPos={{ x: 120, y: 200 }}>
            <QuickContent />
          </FloatingWidget>
        </>
      )}

      {/* Patient Alerts */}
      {!floats.alerts && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <SectionHeader icon={AlertTriangle} title="Patient Alerts" color="bg-amber-700" onPopOut={() => popOut('alerts')} />
          <AlertsContent />
        </div>
      )}
      {floats.alerts && (
        <>
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-3 text-center text-xs text-gray-400">
            Patient Alerts — popped out
          </div>
          <FloatingWidget title="Patient Alerts" headerColor="bg-amber-700" onClose={() => popIn('alerts')} defaultPos={{ x: 160, y: 300 }}>
            <AlertsContent />
          </FloatingWidget>
        </>
      )}

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
  );
}