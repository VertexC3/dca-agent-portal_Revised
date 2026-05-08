import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Mail, Bot, GripVertical, ChevronDown, ChevronUp, Sparkles, Package, Truck, CheckCircle2, Clock, MoreVertical, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ShareColleagueModal from './ShareColleagueModal';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const CHANNELS = [
  { key: 'text',      label: 'SMS',       icon: MessageSquare, color: 'text-green-700 bg-green-50 border-green-200' },
  { key: 'email',     label: 'Email',     icon: Mail,          color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { key: 'whatsapp',  label: 'WhatsApp',  icon: WhatsAppIcon,  color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'ai',        label: 'AI',        icon: Bot,           color: 'text-orange-700 bg-orange-50 border-orange-200' },
];

const AI_AGENT_NAME = 'Vera Joy';

// Build thread from a comm record
function buildThreadFromComm(comm, patient) {
  const name = patient?.name || 'Patient';
  const isAI = comm.type === 'ai_agent';
  const agentName = isAI ? AI_AGENT_NAME : (comm.agent || 'You');
  const msgs = [];
  if (comm.message_content || comm.summary) {
    msgs.push({ id: 1, from: name, text: comm.message_content || comm.summary, time: comm.date || '', mine: false });
  }
  if (isAI) {
    // Show a realistic AI conversation thread
    msgs.push({ id: 2, from: AI_AGENT_NAME, text: `Hello ${name.split(' ')[0]}, I'm Vera Joy, your virtual pharmacy assistant. How can I help you today?`, time: comm.date || '', mine: true, isAI: true });
    if (comm.summary) {
      msgs.push({ id: 3, from: name, text: comm.summary, time: comm.date || '', mine: false });
    }
    if (comm.recommended_response || comm.response_sent) {
      msgs.push({ id: 4, from: AI_AGENT_NAME, text: comm.recommended_response || comm.response_sent, time: comm.response_timestamp || comm.date || '', mine: true, isAI: true });
    }
  } else {
    if (comm.recommended_response || comm.response_sent) {
      msgs.push({ id: 2, from: agentName, text: comm.recommended_response || comm.response_sent, time: comm.response_timestamp || comm.date || '', mine: true });
    }
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

// Get logged-in agent name from localStorage
function getAgentName() {
  try {
    const stored = localStorage.getItem('mockUser');
    if (stored) return JSON.parse(stored).full_name || 'Agent';
  } catch {}
  return 'Agent';
}

export default function InlineMessageBox({ patient, activeComm, linkedOrder, onClose }) {
  const [pos, setPos] = useState({ x: window.innerWidth - 360, y: 70 });
  const [pinned, setPinned] = useState(false);
  const [channel, setChannel] = useState('text');
  const [input, setInput] = useState('');
  const [thread, setThread] = useState([]);
  const [contextOpen, setContextOpen] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessageId, setShareMessageId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const boxRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // When a specific comm is clicked, load its content and switch channel
  useEffect(() => {
    if (!activeComm) return;
    const channelMap = { phone: 'whatsapp', email: 'email', text: 'text', ai_agent: 'ai' };
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
    const senderName = channel === 'ai' ? AI_AGENT_NAME : getAgentName();
    setThread(prev => [...prev, { id: Date.now(), from: senderName, text, time, mine: true }]);
    setInput('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const activeChannel = CHANNELS.find(c => c.key === channel);
  const contextSummary = buildContext(patient, activeComm);

  const pinnedStyle = pinned
    ? { position: 'sticky', top: 0, zIndex: 300, width: '100%' }
    : { position: 'fixed', left: pos.x, top: pos.y, zIndex: 300, width: 340 };

  return (
    <div
      ref={boxRef}
      style={pinnedStyle}
      className={`${pinned ? 'rounded-none border-x-0 border-t-0' : 'rounded-xl shadow-2xl'} border border-gray-200 overflow-hidden bg-white flex flex-col`}
    >
      {/* Drag/Pin header */}
      <div
        onMouseDown={pinned ? undefined : onMouseDown}
        className={`bg-[#8B1F1F] text-white px-3 py-2 flex items-center gap-2 select-none ${pinned ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
      >
        {!pinned && <GripVertical className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />}
        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider flex-1">
          {activeComm ? `Re: ${activeComm.subject}` : patient ? `Message — ${patient.name}` : 'Messages'}
        </span>
        <Badge className="bg-white/20 text-white text-xs px-1.5 border-0">{thread.length}</Badge>
        <button
          onClick={() => setPinned(v => !v)}
          className="p-0.5 rounded hover:bg-white/20 text-white"
          title={pinned ? 'Unpin (float)' : 'Pin to top'}
        >
          {pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>
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
          <div key={msg.id} className={`flex flex-col group ${msg.mine ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-start gap-2 ${msg.mine ? 'flex-row-reverse' : ''}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm relative ${
                msg.mine ? 'bg-[#8B1F1F] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
              <div className="relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 text-gray-500"
                >
                  <MoreVertical className="w-3 h-3" />
                </button>
                {openMenuId === msg.id && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[150px]">
                    <button
                      onClick={() => {
                        setShareMessageId(msg.id);
                        setShowShareModal(true);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-3 h-3" />
                      Share with Colleague
                    </button>
                  </div>
                )}
              </div>
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

      {/* Share Modal */}
      {showShareModal && (
        <ShareColleagueModal
          onClose={() => { setShowShareModal(false); setShareMessageId(null); }}
          onShare={() => {}}
        />
      )}
    </div>
  );
}