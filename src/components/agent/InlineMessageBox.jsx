import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Phone, Mail, Bot, GripVertical, ChevronDown, ChevronUp, Sparkles, Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CHANNELS = [
  { key: 'text',  label: 'SMS',   icon: MessageSquare, color: 'text-green-700 bg-green-50 border-green-200' },
  { key: 'email', label: 'Email', icon: Mail,          color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { key: 'phone', label: 'Phone', icon: Phone,         color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'ai',    label: 'AI',    icon: Bot,            color: 'text-orange-700 bg-orange-50 border-orange-200' },
];

// Build thread from a comm record
function buildThreadFromComm(comm, patient) {
  const name = patient?.name || 'Patient';
  const msgs = [];
  if (comm.message_content || comm.summary) {
    msgs.push({ id: 1, from: name, text: comm.message_content || comm.summary, time: comm.date || '', mine: false });
  }
  if (comm.recommended_response || comm.response_sent) {
    msgs.push({ id: 2, from: 'You', text: comm.recommended_response || comm.response_sent, time: comm.response_timestamp || comm.date || '', mine: true });
  }
  if (msgs.length === 0) {
    msgs.push({ id: 1, from: name, text: comm.subject || '(No content)', time: comm.date || '', mine: false });
  }
  return msgs;
}

// Build a context summary from a comm record or fallback to patient history
function buildContext(patient, activeComm) {
  if (activeComm) {
    return `Re: "${activeComm.subject}" (${activeComm.type?.toUpperCase()}, ${activeComm.date}) — ${activeComm.summary || 'No summary available.'}`;
  }
  if (!patient) return null;
  const rxNames = (patient.prescriptions || []).slice(0, 2).map(r => r.name).join(', ');
  const lastComm = (patient.communications || [])[0];
  return `${patient.name}'s last contact: ${lastComm ? `"${lastComm.subject}" on ${lastComm.date}` : 'none on record'}. Active Rx: ${rxNames || 'none'}.`;
}

function LinkedOrderPanel({ order }) {
  if (!order) return null;
  const statusColor = order.status === 'Delivered' ? 'text-green-700 bg-green-50 border-green-200'
    : order.status === 'In Transit' ? 'text-blue-700 bg-blue-50 border-blue-200'
    : order.status === 'In Progress' ? 'text-blue-700 bg-blue-50 border-blue-200'
    : 'text-yellow-700 bg-yellow-50 border-yellow-200';
  const StatusIcon = order.status === 'Delivered' ? CheckCircle2 : order.status === 'In Transit' ? Truck : Clock;
  return (
    <div className="border-t border-gray-100 bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
        <Package className="w-3 h-3" /> Linked Order
      </p>
      <div className="bg-white border border-gray-200 rounded-lg p-2 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800 truncate">{order.medication}</span>
          <Badge className={`text-xs flex items-center gap-0.5 border ${statusColor}`}>
            <StatusIcon className="w-2.5 h-2.5" />{order.status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-gray-500">
          <span>Receipt: <strong className="text-gray-700">#{order.receipt}</strong></span>
          <span>Amt: <strong className="text-gray-700">${order.amount.toFixed(2)}</strong></span>
          {order.tracking && order.tracking !== 'Pending' && (
            <span className="col-span-2">Tracking: <strong className="font-mono text-gray-700">{order.tracking}</strong></span>
          )}
          {order.delivered_at && <span className="col-span-2 text-green-700">Delivered: {order.delivered_at}</span>}
          {order.est_delivery && <span className="col-span-2 text-blue-700">Est. Delivery: {order.est_delivery}</span>}
        </div>
      </div>
    </div>
  );
}

export default function InlineMessageBox({ patient, activeComm, linkedOrder, onClose }) {
  const [pos, setPos] = useState({ x: window.innerWidth - 360, y: 70 });
  const [channel, setChannel] = useState('text');
  const [input, setInput] = useState('');
  const [thread, setThread] = useState([]);
  const [contextOpen, setContextOpen] = useState(true);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const boxRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // When a specific comm is clicked, load its content and switch channel
  useEffect(() => {
    if (!activeComm) return;
    const channelMap = { phone: 'phone', email: 'email', text: 'text', ai_agent: 'ai' };
    setChannel(channelMap[activeComm.type] || 'text');
    setThread(buildThreadFromComm(activeComm, patient));
    setContextOpen(true);
  }, [activeComm]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const onMouseDown = (e) => {
    dragging.current = true;
    const rect = boxRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - (boxRef.current?.offsetWidth || 320), e.clientX - offset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - offset.current.y)),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setThread(prev => [...prev, { id: Date.now(), from: 'You', text, time, mine: true }]);
    setInput('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const activeChannel = CHANNELS.find(c => c.key === channel);
  const contextSummary = buildContext(patient, activeComm);

  return (
    <div
      ref={boxRef}
      style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 300, width: 340 }}
      className="rounded-xl shadow-2xl border border-gray-200 overflow-hidden bg-white flex flex-col"
    >
      {/* Drag header */}
      <div
        onMouseDown={onMouseDown}
        className="bg-[#8B1F1F] text-white px-3 py-2 flex items-center gap-2 cursor-grab active:cursor-grabbing select-none"
      >
        <GripVertical className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider flex-1">
          {activeComm ? `Re: ${activeComm.subject}` : patient ? `Message — ${patient.name}` : 'Messages'}
        </span>
        <Badge className="bg-white/20 text-white text-xs px-1.5 border-0">{thread.length}</Badge>
        {onClose && (
          <button onClick={onClose} className="ml-1 p-0.5 rounded hover:bg-white/20 text-white text-xs font-bold">✕</button>
        )}
      </div>

      {/* Context banner */}
      {contextSummary && (
        <div className="bg-amber-50 border-b border-amber-200">
          <button
            onClick={() => setContextOpen(v => !v)}
            className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left"
          >
            <Sparkles className="w-3 h-3 text-amber-600 flex-shrink-0" />
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide flex-1">Context Summary</span>
            {contextOpen ? <ChevronUp className="w-3 h-3 text-amber-500" /> : <ChevronDown className="w-3 h-3 text-amber-500" />}
          </button>
          {contextOpen && (
            <p className="px-3 pb-2 text-[10px] text-amber-800 leading-relaxed">{contextSummary}</p>
          )}
        </div>
      )}

      {/* Channel selector */}
      <div className="flex border-b border-gray-100 bg-gray-50 px-2 py-1.5 gap-1">
        {CHANNELS.map(ch => {
          const ChIcon = ch.icon;
          return (
            <button
              key={ch.key}
              onClick={() => setChannel(ch.key)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border transition-all ${
                channel === ch.key ? ch.color + ' shadow-sm' : 'text-gray-500 border-transparent hover:bg-gray-100'
              }`}
            >
              <ChIcon className="w-3 h-3" />{ch.label}
            </button>
          );
        })}
      </div>

      {/* Thread */}
      <div className="flex flex-col gap-2 p-3 overflow-y-auto max-h-52 bg-white">
        {thread.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.mine ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${
              msg.mine ? 'bg-[#8B1F1F] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 px-1">{msg.from} · {msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-gray-50 p-2 flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Send via ${activeChannel?.label}… (Enter to send)`}
          rows={2}
          className="flex-1 resize-none text-xs rounded-lg border border-gray-200 bg-white px-2 py-1.5 focus:outline-none focus:border-[#8B1F1F] transition-colors"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!input.trim()}
          className="h-8 w-8 p-0 bg-[#8B1F1F] hover:bg-[#721919] flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Linked Order */}
      <LinkedOrderPanel order={linkedOrder} />
    </div>
  );
}