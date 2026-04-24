import React, { useState, useRef } from 'react';
import { GripVertical, LayoutDashboard } from 'lucide-react';

/**
 * A grid of reorderable panels. Drag the grip handle to reorder.
 * panels: [{ id, title, content }]
 */
export default function DraggablePanelGrid({ panels, onReorder }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const handleDragStart = (i) => setDragIndex(i);
  const handleDragOver = (e, i) => { e.preventDefault(); setOverIndex(i); };
  const handleDrop = (i) => {
    if (dragIndex === null || dragIndex === i) { setDragIndex(null); setOverIndex(null); return; }
    const reordered = [...panels];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(i, 0, moved);
    onReorder(reordered);
    setDragIndex(null);
    setOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  return (
    <div className="space-y-3">
      {panels.map((panel, i) => (
        <div
          key={panel.id}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={() => handleDrop(i)}
          onDragEnd={handleDragEnd}
          className={`group rounded-lg border bg-white shadow-sm transition-all duration-150 ${
            dragIndex === i ? 'opacity-40 scale-[0.98]' : ''
          } ${overIndex === i && dragIndex !== i ? 'ring-2 ring-[#8B1F1F] ring-offset-1' : 'border-gray-200'}`}
        >
          {/* Panel header with drag handle */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            <div
              data-coach="drag-icon"
              className="cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide flex-1">{panel.title}</span>
          </div>
          <div className="p-3">
            {panel.content}
          </div>
        </div>
      ))}
    </div>
  );
}