import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Phone, Mail, Bot, ChevronDown, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CHANNELS = [
  { key: 'text',  label: 'SMS',   icon: MessageSquare, color: 'text-green-700 bg-green-50 border-green-200' },
  { key: 'email', label: 'Email', icon: Mail,          color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { key: 'phone', label: 'Phone', icon: Phone,         color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'ai',    label: 'AI',    icon: Bot,            color: 'text-orange-700 bg-orange-50 border-orange-200' },
];

// Mock thread messages per patient
function getMockThread(patient) {
  const name = patient?.name || 'Patient';
  return [
    { id: 1, from: name,         text: 'Hi, I wanted to check on my refill status.',          time: '10:02 AM', mine: false },
    { id: 2, from: 'You',        text: 'Hi! Your refill is processing and will ship tomorrow.', time: '10:04 AM', mine: true  },
    { id: 3, from: name,         text: 'Great, thank you! Any side effects I should watch for?', time: '10:05 AM', mine: false },
    { id: 4, from: 'You',        text: 'Common ones are mild nausea and fatigue. Drink plenty of water.', time: '10:07 AM', mine: true  },
    { id: 5, from: name,         text: 'Got it. And when will I get the tracking number?',    time: '10:09 AM', mine: false },
  ];
}

export default function InlineMessageBox({ patient }) {
  const [pos, setPos] = useState({ x: window.innerWidth - 360, y: 70 });
  const [channel, setChannel] = useState('text');
  const [showChannelMenu, setShowChannelMenu] = useState(false);
  const [input, setInput] = useState('');
  const [thread, setThread] = useState([]);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const boxRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setThread(getMockThread(patient));
  }, [patient?.id]);

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
  const ActiveIcon = activeChannel?.icon || MessageSquare;

  return (
    <div
      ref={boxRef}
      style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 300, width: 320 }}
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
          {patient ? `Message — ${patient.name}` : 'Messages'}
        </span>
        <Badge className="bg-white/20 text-white text-xs px-1.5 border-0">{thread.length}</Badge>
      </div>

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
              msg.mine
                ? 'bg-[#8B1F1F] text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
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
    </div>
  );
}