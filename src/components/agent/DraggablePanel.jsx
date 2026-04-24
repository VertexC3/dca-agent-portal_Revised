import React, { useRef, useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

/**
 * A draggable, fixed-position panel that can be moved anywhere on screen.
 * Starts at `defaultPos` and lets users drag by the header.
 */
export default function DraggablePanel({ title, icon: Icon, defaultPos = { x: 20, y: 80 }, children, className = '', headerColor = 'bg-[#8B1F1F]', onClose, minWidth = 260, maxWidth = 480 }) {
  const [pos, setPos] = useState(defaultPos);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const ref = useRef(null);

  const onMouseDown = (e) => {
    dragging.current = true;
    const rect = ref.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - (ref.current?.offsetWidth || 300), e.clientX - offset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - offset.current.y)),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 200, minWidth, maxWidth, width: minWidth }}
      className={`rounded-xl shadow-2xl border border-gray-200 overflow-hidden bg-white ${className}`}
    >
      {/* Drag Handle Header */}
      <div
        onMouseDown={onMouseDown}
        className={`${headerColor} text-white px-3 py-2 flex items-center gap-2 cursor-grab active:cursor-grabbing select-none`}
      >
        <GripVertical className="w-3.5 h-3.5 opacity-60" />
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="text-xs font-bold uppercase tracking-wider flex-1">{title}</span>
        {onClose && (
          <button onClick={onClose} className="text-white/70 hover:text-white text-sm leading-none ml-auto">✕</button>
        )}
      </div>
      <div className="overflow-y-auto max-h-[60vh]">
        {children}
      </div>
    </div>
  );
}