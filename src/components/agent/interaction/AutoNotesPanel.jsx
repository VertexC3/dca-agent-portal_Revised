import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useInteraction } from './InteractionContext';

export default function AutoNotesPanel() {
  const { autoNotes, actions } = useInteraction();
  const generating = autoNotes.some(n => !n.confirmed);
  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wide text-gray-700">Interaction Notes</div>
        {generating && (
          <div className="flex items-center gap-1 text-[11px] text-[#8B1F1F]">
            <Sparkles className="w-3 h-3" /> Generating…
          </div>
        )}
      </div>
      <div className="px-4 py-3 space-y-1 max-h-44 overflow-y-auto">
        {autoNotes.length === 0 && (
          <div className="text-xs text-gray-400 italic">Notes appear automatically as the conversation progresses.</div>
        )}
        {autoNotes.map(n => (
          <div key={n.id} className="flex items-start gap-2 text-sm text-gray-800">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8B1F1F] flex-shrink-0" />
            <span className="flex-1">{n.text}</span>
            {!n.confirmed && (
              <button
                onClick={() => actions.confirmNote(n.id)}
                title="Confirm"
                className="text-gray-400 hover:text-green-600"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
