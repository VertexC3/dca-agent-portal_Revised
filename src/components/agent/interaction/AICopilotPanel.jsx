import React from 'react';
import { Sparkles, AlertTriangle, Smile, Meh, Frown, ExternalLink } from 'lucide-react';
import { useInteraction } from './InteractionContext';
import SuggestionCard from './SuggestionCard';

const SENTIMENT_ICON = { calm: Smile, neutral: Meh, frustrated: Frown, distress: AlertTriangle };

export default function AICopilotPanel({ onPopOut, onDeepLink }) {
  const { interaction, suggestions, sentiment } = useInteraction();
  if (!interaction) return null;

  const SIcon = SENTIMENT_ICON[sentiment.label] || Meh;
  const distress = sentiment.label === 'distress';

  return (
    <div className="border-b border-gray-200 bg-white" data-coach="ai-copilot">
      <div className="px-4 py-3 flex items-center justify-between bg-[#8B1F1F]/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8B1F1F]" />
          <div className="text-xs font-bold uppercase tracking-wide text-[#8B1F1F]">AI Co-pilot</div>
        </div>
        {onPopOut && (
          <button onClick={onPopOut} title="Pop out" className="text-gray-500 hover:text-[#8B1F1F] p-1">
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">Phone</span>
          <span className="text-xs text-gray-800">{interaction.patient?.phone || '—'}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">Intent</span>
          {interaction.intentTags.length === 0 && <span className="text-xs text-gray-400">analyzing…</span>}
          {interaction.intentTags.map(tag => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{tag}</span>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">Sentiment</span>
          <SIcon className={`w-3.5 h-3.5 ${distress ? 'text-red-600' : 'text-gray-600'}`} />
          <span className={`text-xs font-semibold ${distress ? 'text-red-600' : 'text-gray-700'}`}>{sentiment.label}</span>
          <span className="text-[11px] text-gray-400">({sentiment.trend})</span>
        </div>
      </div>

      {distress && (
        <div role="alert" className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-xs font-semibold text-red-700 flex-1">Customer distress detected</span>
          <button className="text-xs font-semibold text-red-700 underline">Escalate to supervisor</button>
        </div>
      )}

      <div className="px-3 py-3 max-h-72 overflow-y-auto" aria-live="polite">
        {suggestions.length === 0 && (
          <div className="text-xs text-gray-400 italic px-1">I'm listening — suggestions will appear here.</div>
        )}
        {suggestions.map(s => <SuggestionCard key={s.id} suggestion={s} onDeepLink={onDeepLink} />)}
      </div>
    </div>
  );
}
