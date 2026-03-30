import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, GripHorizontal } from 'lucide-react';

export default function FloatingWidget({ title, headerColor = 'bg-[#8B1F1F]', onClose, children, defaultPos }) {
  const [pos, setPos] = useState(defaultPos || { x: 100, y: 100 });
  const [size, setSize] = useState({ w: 320, h: 'auto' });
  const [minimized, setMinimized] = useState(false);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const ref = useRef(null);

  const onMouseDown = (e) => {
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
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
      className="fixed z-[200] shadow-2xl rounded-lg border border-gray-300 bg-white overflow-hidden select-none"
      style={{ left: pos.x, top: pos.y, width: size.w, minWidth: 260 }}
    >
      {/* Title bar */}
      <div
        className={`${headerColor} text-white flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing`}
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-1.5">
          <GripHorizontal className="w-3.5 h-3.5 opacity-60" />
          <span className="font-bold text-xs uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={() => setMinimized(m => !m)}
            className="p-0.5 rounded hover:bg-white/20 transition-colors"
            title={minimized ? 'Restore' : 'Minimize'}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={onClose}
            className="p-0.5 rounded hover:bg-white/20 transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Content */}
      {!minimized && (
        <div className="overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      )}
    </div>
  );
}