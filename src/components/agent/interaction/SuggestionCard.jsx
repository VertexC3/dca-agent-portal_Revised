import React from 'react';
import { Copy, ThumbsUp, ThumbsDown, ExternalLink, Check } from 'lucide-react';
import { useInteraction } from './InteractionContext';

export default function SuggestionCard({ suggestion, onDeepLink }) {
  const { actions } = useInteraction();
  const { id, text, category, kbLink, feedback, copied } = suggestion;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 mb-2 border-l-2 border-l-[#8B1F1F]">
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-full bg-[#8B1F1F] text-white flex items-center justify-center flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-white" />
        </div>
        <div className="flex-1 text-sm text-gray-800">{text}</div>
      </div>
      <div className="mt-2 flex items-center gap-1 pl-7">
        <button
          onClick={() => actions.sendSuggestion(id)}
          title="Copy to clipboard"
          className="p-1 rounded hover:bg-gray-100 text-gray-500"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => actions.rateSuggestion(id, 'up')}
          className={`p-1 rounded hover:bg-gray-100 ${feedback === 'up' ? 'text-[#8B1F1F]' : 'text-gray-500'}`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => actions.rateSuggestion(id, 'down')}
          className={`p-1 rounded hover:bg-gray-100 ${feedback === 'down' ? 'text-[#8B1F1F]' : 'text-gray-500'}`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
        {(kbLink || category === 'action') && (
          <button
            onClick={() => onDeepLink?.(suggestion)}
            title="Open"
            className="ml-auto p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
        {category && (
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{category}</span>
        )}
      </div>
    </div>
  );
}
