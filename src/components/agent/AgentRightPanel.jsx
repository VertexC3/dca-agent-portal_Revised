import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Zap, Search, BookOpen,
  Phone, Mail, Send, RefreshCw, UserPlus, FileText,
  ChevronDown, ChevronUp, Clock, ArrowUpCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const priorityQueue = [
  { id: 1, type: 'refill', text: 'Refill request pending — Johnson, Robert', urgency: 'high', time: '2m ago' },
  { id: 2, type: 'payment', text: 'Failed payment — Smith, Jane (INV-2026-002)', urgency: 'high', time: '15m ago' },
  { id: 3, type: 'callback', text: 'Callback requested — Davis, Karen', urgency: 'medium', time: '45m ago' },
  { id: 4, type: 'delivery', text: 'Delivery delay — Martinez, Carlos', urgency: 'medium', time: '1h ago' },
  { id: 5, type: 'general', text: 'New message — Williams, Tom', urgency: 'low', time: '2h ago' },
];

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

export default function AgentRightPanel({ patient }) {
  const [kbSearch, setKbSearch] = useState('');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [kbExpanded, setKbExpanded] = useState(false);

  const activeTasks = priorityQueue.filter(t => !completedTasks.includes(t.id));
  const filteredKb = kbArticles.filter(a =>
    !kbSearch || a.title.toLowerCase().includes(kbSearch.toLowerCase())
  );

  return (
    <div className="w-64 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">

      {/* Priority Queue */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-3 py-2 bg-[#8B1F1F] text-white flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Priority Queue</h3>
          </div>
          <Badge className="bg-white text-[#8B1F1F] text-xs px-1.5 font-bold">{activeTasks.length}</Badge>
        </div>
        <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
          {activeTasks.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-400" />
              All caught up!
            </div>
          ) : (
            activeTasks.map(task => (
              <div key={task.id} className="flex items-start gap-2 p-2.5 hover:bg-gray-50 transition-colors">
                <button
                  onClick={() => setCompletedTasks(prev => [...prev, task.id])}
                  className="mt-0.5 w-4 h-4 flex-shrink-0 rounded border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors"
                  title="Mark complete"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800 leading-snug">{task.text}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-xs px-1.5 py-0 rounded-full font-medium ${urgencyClasses[task.urgency]}`}>
                      {task.urgency}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />{task.time}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-3 py-2 bg-[#8B1F1F] text-white flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          <h3 className="font-bold text-xs uppercase tracking-wider">Quick Actions</h3>
        </div>
        <div className="p-2 grid grid-cols-2 gap-1.5">
          {[
            { label: 'Refill Rx', icon: RefreshCw, color: 'text-blue-600', hover: 'hover:bg-blue-50' },
            { label: 'Log Call', icon: Phone, color: 'text-green-600', hover: 'hover:bg-green-50' },
            { label: 'Send Email', icon: Mail, color: 'text-purple-600', hover: 'hover:bg-purple-50' },
            { label: 'Send Text', icon: Send, color: 'text-orange-600', hover: 'hover:bg-orange-50' },
            { label: 'Escalate', icon: AlertTriangle, color: 'text-red-600', hover: 'hover:bg-red-50' },
            { label: 'Add Note', icon: FileText, color: 'text-yellow-600', hover: 'hover:bg-yellow-50' },
          ].map(action => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                size="sm"
                variant="outline"
                className={`h-8 text-xs justify-start gap-1.5 border-gray-200 ${action.hover}`}
              >
                <Icon className={`w-3.5 h-3.5 ${action.color}`} />
                {action.label}
              </Button>
            );
          })}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs justify-start gap-1.5 border-gray-200 hover:bg-teal-50 col-span-2"
          >
            <UserPlus className="w-3.5 h-3.5 text-teal-600" />
            New Patient Record
          </Button>
        </div>
      </div>

      {/* Patient Alerts */}
      {patient && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-3 py-2 bg-amber-700 text-white flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Patient Alerts</h3>
          </div>
          <div className="p-2 space-y-1.5">
            {patient.prescriptions.filter(p => p.refills <= 1).length === 0 &&
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
        </div>
      )}

      {/* Knowledge Base */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <button
          className="w-full px-3 py-2 bg-[#8B1F1F] text-white flex items-center justify-between"
          onClick={() => setKbExpanded(!kbExpanded)}
        >
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Knowledge Base</h3>
          </div>
          {kbExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {kbExpanded ? (
          <>
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
                <Input
                  className="pl-8 h-7 text-xs border-gray-200"
                  placeholder="Search articles..."
                  value={kbSearch}
                  onChange={e => setKbSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
              {filteredKb.map(a => (
                <button
                  key={a.id}
                  className="w-full text-left p-2.5 hover:bg-red-50 transition-colors text-xs text-gray-700 hover:text-[#8B1F1F] flex items-center justify-between group"
                >
                  <span>{a.title}</span>
                  <FileText className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <button
            className="w-full text-center p-2 text-xs text-[#8B1F1F] hover:bg-red-50 transition-colors font-semibold"
            onClick={() => setKbExpanded(true)}
          >
            Browse {kbArticles.length} articles →
          </button>
        )}
      </div>

    </div>
  );
}