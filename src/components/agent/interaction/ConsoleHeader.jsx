import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Pause, Play, PhoneOff, UserPlus, Grid3x3, PhoneForwarded } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useInteraction } from './InteractionContext';

const WRAP_CODES = ['Refill', 'Billing', 'Clinical', 'Shipping', 'Other'];

function fmtElapsed(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function ConsoleHeader() {
  const { interaction, actions } = useInteraction();
  const [now, setNow] = useState(Date.now());
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  if (!interaction) return null;
  const start = interaction.connectedAt || interaction.startedAt;
  const elapsed = now - start;
  const onHold = interaction.status === 'on-hold';
  const recording = interaction.recording.state === 'recording';

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-gray-700">
            {interaction.type === 'chat' ? 'Connected Chat' : interaction.status === 'ringing' ? 'Incoming Call' : 'Connected Call'}
          </div>
          <div className="text-[11px] text-gray-500">{interaction.queue} • {fmtElapsed(elapsed)}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded border ${
            recording ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-500 border-gray-200 bg-gray-50'
          }`}>
            <span className={`w-2 h-2 rounded-full ${recording ? 'bg-red-600 animate-pulse' : 'bg-gray-300'}`} />
            {recording ? 'Recording' : 'Paused'}
          </div>
          <Select
            value={interaction.wrapUpCode || ''}
            onValueChange={(v) => actions.setWrapUpCode(v)}
          >
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue placeholder="Wrap Up Code" />
            </SelectTrigger>
            <SelectContent>
              {WRAP_CODES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-center gap-2 border-t border-gray-100 bg-gray-50">
        {interaction.status === 'ringing' ? (
          <button
            onClick={actions.answer}
            className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
          >
            Answer
          </button>
        ) : (
          <>
            <IconBtn title="Add participant" onClick={() => {}}><UserPlus className="w-4 h-4" /></IconBtn>
            <IconBtn title="Transfer" onClick={() => {}}><PhoneForwarded className="w-4 h-4" /></IconBtn>
            <IconBtn title="Dialpad" onClick={() => {}}><Grid3x3 className="w-4 h-4" /></IconBtn>
            <IconBtn
              title={onHold ? 'Resume' : 'Hold'}
              onClick={onHold ? actions.resume : actions.hold}
            >
              {onHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </IconBtn>
            <IconBtn
              title={muted ? 'Unmute' : 'Mute'}
              onClick={() => { setMuted(m => !m); muted ? actions.unmute() : actions.mute(); }}
            >
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </IconBtn>
            <button
              onClick={actions.hangup}
              title="End"
              className="ml-2 w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function IconBtn({ title, onClick, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-[#8B1F1F] hover:text-[#8B1F1F] text-gray-600 flex items-center justify-center transition-colors"
    >
      {children}
    </button>
  );
}
