import React from 'react';
import { Phone, MessageSquare, BellRing, ArrowUpRight, Layers } from 'lucide-react';
import { useInteraction } from './InteractionContext';

const typeIcon = {
  'voice-in': Phone,
  'voice-out': ArrowUpRight,
  'chat': MessageSquare,
  'task': BellRing,
};

function TaskItem({ task, active, ringing, onClick }) {
  const Icon = typeIcon[task.type] || Layers;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg p-3 mb-2 border transition-all ${
        active
          ? 'border-[#8B1F1F] bg-[#8B1F1F]/5'
          : 'border-gray-200 bg-white hover:border-gray-300'
      } ${ringing ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-start gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          active ? 'bg-[#8B1F1F] text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-gray-800 truncate">{task.label}</div>
          {task.subLabel && (
            <div className="text-[11px] text-gray-500 truncate">{task.subLabel}</div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function TaskQueueRail({ width = 220 }) {
  const { interaction, taskQueue, actions } = useInteraction();
  const currentTask = interaction
    ? { id: interaction.id, type: interaction.type, label: `${interaction.patient?.name || 'Unknown'}`, subLabel: interaction.queue }
    : null;
  const ringing = interaction?.status === 'ringing';

  return (
    <aside
      style={{ width }}
      className="flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto p-3"
      data-coach="task-queue-rail"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700">Current Task</h3>
      </div>
      {currentTask ? (
        <TaskItem task={currentTask} active ringing={ringing} onClick={() => {}} />
      ) : (
        <div className="text-xs text-gray-500 italic mb-2">No active task</div>
      )}

      <div className="flex items-center justify-between mt-4 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700">Other Tasks</h3>
      </div>
      {taskQueue.length === 0 && (
        <div className="text-xs text-gray-400 italic">Queue is quiet</div>
      )}
      {taskQueue.map(t => (
        <TaskItem
          key={t.id}
          task={t}
          active={false}
          ringing={false}
          onClick={() => actions.pickTask(t.id)}
        />
      ))}
    </aside>
  );
}
