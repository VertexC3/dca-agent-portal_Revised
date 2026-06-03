import React from 'react';
import DraggablePanel from '../DraggablePanel';
import AICopilotPanel from './AICopilotPanel';

export default function FloatingAIWindow({ open, onClose, onDeepLink }) {
  if (!open) return null;
  return (
    <DraggablePanel
      title="AI Co-pilot"
      onClose={onClose}
      defaultPos={{ x: typeof window !== 'undefined' ? window.innerWidth - 420 : 100, y: 120 }}
      maxWidth={400}
      minWidth={320}
    >
      <AICopilotPanel onDeepLink={onDeepLink} />
    </DraggablePanel>
  );
}
