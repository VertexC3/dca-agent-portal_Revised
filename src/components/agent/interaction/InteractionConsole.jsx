import React from 'react';
import ConsoleHeader from './ConsoleHeader';
import TranscriptStream from './TranscriptStream';
import AutoNotesPanel from './AutoNotesPanel';

export default function InteractionConsole({ width }) {
  return (
    <section
      style={{ width }}
      className="flex-shrink-0 flex flex-col border-r border-gray-200 overflow-hidden bg-white"
    >
      <ConsoleHeader />
      <TranscriptStream />
      <AutoNotesPanel />
    </section>
  );
}
