import React from 'react';
import { Phone } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useInteraction } from './InteractionContext';
import { scenarioList } from './scenarios';

export default function SimulateInteractionMenu() {
  const { actions, interaction } = useInteraction();
  if (!import.meta.env.DEV) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white text-gray-600 border-gray-200 hover:border-[#8B1F1F] hover:text-[#8B1F1F] transition-all"
      >
        <Phone className="w-3.5 h-3.5" /> Simulate
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {scenarioList.map(s => (
          <DropdownMenuItem
            key={s.id}
            disabled={!!interaction}
            onSelect={() => actions.startInteraction(s.id)}
          >
            <span className="font-semibold mr-2 uppercase text-[10px] text-gray-400">{s.type}</span>
            {s.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={!interaction} onSelect={() => actions.hangup()}>
          Stop all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
