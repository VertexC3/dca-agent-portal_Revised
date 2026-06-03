import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useInteraction } from './InteractionContext';

export default function TranscriptStream() {
  const { interaction, transcript, chatThread, actions } = useInteraction();
  const scrollRef = useRef(null);
  const [draft, setDraft] = useState('');
  const isChat = interaction?.type === 'chat';

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [transcript.length, chatThread.length]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="px-4 py-2 border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-700">
        {isChat ? 'Conversation' : 'Live Transcription'}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {!isChat && transcript.map(line => (
          <div key={line.id} className={`text-sm transition-opacity ${line.partial ? 'opacity-60' : 'opacity-100'}`}>
            <span className={`font-semibold mr-2 ${line.speaker === 'agent' ? 'text-[#8B1F1F]' : 'text-gray-700'}`}>
              {line.speaker === 'agent' ? 'Agent' : interaction?.patient?.name?.split(' ')[0] || 'Patient'}:
            </span>
            <span className="text-gray-800">{line.text}</span>
          </div>
        ))}
        {isChat && chatThread.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
              msg.from === 'agent' ? 'bg-[#8B1F1F] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {(transcript.length === 0 && chatThread.length === 0) && (
          <div className="text-xs text-gray-400 italic">Waiting for activity…</div>
        )}
      </div>
      {isChat && (
        <form
          onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { actions.sendChat(draft.trim()); setDraft(''); } }}
          className="border-t border-gray-100 p-2 flex items-center gap-2"
        >
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Type a reply…"
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#8B1F1F]"
          />
          <button type="submit" className="w-9 h-9 rounded-full bg-[#8B1F1F] text-white flex items-center justify-center">
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
