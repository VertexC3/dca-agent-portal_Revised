import React, { useState } from 'react';
import { Users, Clock, Phone, Mail, Send, Bot, ChevronDown, ChevronUp, UserPlus, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CHANNEL_ICONS = {
  phone: { icon: Phone, color: 'text-blue-600' },
  email: { icon: Mail, color: 'text-purple-600' },
  text:  { icon: Send, color: 'text-green-600' },
  ai_agent: { icon: Bot, color: 'text-orange-600' },
};

// Derive unique agents from communications
function deriveAgents(communications) {
  const agentMap = {};
  communications.forEach(c => {
    if (!agentMap[c.agent]) {
      agentMap[c.agent] = { name: c.agent, interactions: [], isAI: c.agent === 'AI Agent' };
    }
    agentMap[c.agent].interactions.push(c);
  });
  return Object.values(agentMap);
}

export default function AgentEngagementLog({ communications }) {
  const [expanded, setExpanded] = useState(true);
  const [addingAgent, setAddingAgent] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [extraAgents, setExtraAgents] = useState([]);

  const derivedAgents = deriveAgents(communications);
  const allAgents = [
    ...derivedAgents,
    ...extraAgents.map(name => ({ name, interactions: [], isAI: false, manual: true }))
  ];

  const handleAddAgent = () => {
    if (newAgentName.trim()) {
      setExtraAgents(prev => [...prev, newAgentName.trim()]);
      setNewAgentName('');
      setAddingAgent(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-[#8B1F1F]" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Agent Engagement Log</span>
          <Badge className="bg-gray-200 text-gray-700 text-xs px-1.5 py-0">{allAgents.length}</Badge>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
      </button>

      {expanded && (
        <div className="p-3 space-y-2 bg-white">
          {allAgents.map((agent, i) => {
            const lastInteraction = agent.interactions.length > 0
              ? agent.interactions.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              : null;

            return (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${agent.isAI ? 'bg-orange-500' : 'bg-[#8B1F1F]'}`}>
                  {agent.isAI ? <Bot className="w-4 h-4" /> : agent.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-900">{agent.name}</p>
                    {agent.manual && <Badge className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0">Added</Badge>}
                    {agent.isAI && <Badge className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0">AI</Badge>}
                  </div>
                  {agent.interactions.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {agent.interactions.map(inter => {
                        const cfg = CHANNEL_ICONS[inter.type] || CHANNEL_ICONS.phone;
                        const Icon = cfg.icon;
                        return (
                          <span key={inter.id} className="flex items-center gap-1 text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                            <Icon className={`w-3 h-3 ${cfg.color}`} />
                            {format(new Date(inter.date), 'MM/dd')}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">Manually added — no interactions logged</p>
                  )}
                  {lastInteraction && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last: {lastInteraction.subject} · {format(new Date(lastInteraction.date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <p className="text-xs font-bold text-gray-500 flex-shrink-0">
                  {agent.interactions.length > 0 ? `${agent.interactions.length} interaction${agent.interactions.length !== 1 ? 's' : ''}` : ''}
                </p>
              </div>
            );
          })}

          {/* Add Agent */}
          {addingAgent ? (
            <div className="flex items-center gap-2 pt-1">
              <Input
                value={newAgentName}
                onChange={e => setNewAgentName(e.target.value)}
                placeholder="Agent name..."
                className="h-7 text-xs"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleAddAgent(); if (e.key === 'Escape') setAddingAgent(false); }}
              />
              <button onClick={handleAddAgent} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
              <button onClick={() => setAddingAgent(false)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button
              onClick={() => setAddingAgent(true)}
              className="flex items-center gap-1.5 text-xs text-[#8B1F1F] hover:underline font-semibold mt-1"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add Agent
            </button>
          )}
        </div>
      )}
    </div>
  );
}