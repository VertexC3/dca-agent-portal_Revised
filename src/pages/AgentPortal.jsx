import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown, LayoutDashboard, MessageSquare, ArrowLeftRight } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import AgentWorkspaceTabs from '../components/agent/AgentWorkspaceTabs';
import AgentRightPanel from '../components/agent/AgentRightPanel';
import OrderSearchBar from '../components/agent/OrderSearchBar';
import AgentDashboard from '../components/agent/AgentDashboard';
import InlineMessageBox from '../components/agent/InlineMessageBox';
import { mockPatients } from '../data/mockPatients';

// Drag-to-resize divider with swap button
function ResizeDivider({ onDrag, onSwap }) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  const onMouseDown = (e) => {
    dragging.current = true;
    lastX.current = e.clientX;
    e.preventDefault();
  };

  React.useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const delta = e.clientX - lastX.current;
      lastX.current = e.clientX;
      onDrag(delta);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [onDrag]);

  return (
    <div
      onMouseDown={onMouseDown}
      className="w-5 flex-shrink-0 cursor-col-resize hover:bg-[#8B1F1F]/10 bg-gray-100 transition-colors group relative flex items-center justify-center"
      title="Drag to resize"
    >
      {/* Vertical line */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200 group-hover:bg-[#8B1F1F]/30 transition-colors" />
      {/* Swap button — positioned near top */}
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={onSwap}
        title="Swap panels"
        style={{ top: '80px' }}
        className="absolute z-10 w-6 h-6 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-[#8B1F1F] hover:border-[#8B1F1F] hover:text-white text-gray-500 transition-all duration-200 hover:scale-[2]"
      >
        <ArrowLeftRight className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function AgentPortal() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [middleW, setMiddleW] = useState(700);
  const [showMessageBox, setShowMessageBox] = useState(true);
  const [activeComm, setActiveComm] = useState(null);
  // When true: left=RightPanel, right=WorkspaceTabs (swapped)
  const [panelSwapped, setPanelSwapped] = useState(false);

  const MIN = 400;
  const MAX = 1000;

  const dragMiddle = useCallback((delta) => {
    setMiddleW(w => Math.min(MAX, Math.max(MIN, w + delta)));
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Bar: Patient Selection + Order Search */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          {selectedPatient && (
            <button
              onClick={() => setSelectedPatient(null)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#8B1F1F] transition-colors whitespace-nowrap"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
          )}
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">Select Patient:</label>
          <Select value={selectedPatient?.id || ''} onValueChange={(id) => {
            const patient = mockPatients.find(p => p.id === id);
            setSelectedPatient(patient || null);
          }}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Choose a patient..." />
            </SelectTrigger>
            <SelectContent>
              {mockPatients.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="font-semibold">{p.name}</span> • {p.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-4">
            <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
            <OrderSearchBar onSelectPatient={setSelectedPatient} />
            {selectedPatient && (
              <>
                <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
                <button
                  onClick={() => setShowMessageBox(v => !v)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                    showMessageBox
                      ? 'bg-[#8B1F1F] text-white border-[#8B1F1F]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#8B1F1F] hover:text-[#8B1F1F]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {showMessageBox ? 'Hide Messages' : 'Messages'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!selectedPatient ? (
        <div className="flex-1 overflow-hidden">
          <AgentDashboard onSelectPatient={setSelectedPatient} />
        </div>
      ) : (
        <>
          <div className="flex gap-0 flex-1 overflow-hidden">
            {!panelSwapped ? (
              <>
                {/* Left: Workspace Tabs */}
                <div style={{ width: middleW, minWidth: MIN, maxWidth: MAX }} className="flex-shrink-0 overflow-hidden flex flex-col border-r border-gray-200">
                  <AgentWorkspaceTabs
                    patient={selectedPatient}
                    onSwitchPatient={(member) => {
                      const found = mockPatients.find(p => p.email === member.email);
                      if (found) setSelectedPatient(found);
                    }}
                  />
                </div>
                <ResizeDivider onDrag={dragMiddle} onSwap={() => setPanelSwapped(v => !v)} />
                {/* Right: Right Panel */}
                <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
                  <AgentRightPanel
                    patient={selectedPatient}
                    onOpenMessage={(msg) => { setActiveComm(msg); setShowMessageBox(true); }}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Swapped: Right Panel on left */}
                <div style={{ width: middleW, minWidth: MIN, maxWidth: MAX }} className="flex-shrink-0 overflow-hidden flex flex-col border-r border-gray-200">
                  <AgentRightPanel
                    patient={selectedPatient}
                    onOpenMessage={(msg) => { setActiveComm(msg); setShowMessageBox(true); }}
                  />
                </div>
                <ResizeDivider onDrag={dragMiddle} onSwap={() => setPanelSwapped(v => !v)} />
                {/* Workspace Tabs on right */}
                <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
                  <AgentWorkspaceTabs
                    patient={selectedPatient}
                    onSwitchPatient={(member) => {
                      const found = mockPatients.find(p => p.email === member.email);
                      if (found) setSelectedPatient(found);
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Floating Inline Message Box */}
          {showMessageBox && (
            <InlineMessageBox
              patient={selectedPatient}
              activeComm={activeComm}
              linkedOrder={activeComm?.order_id ? selectedPatient?.orders?.find(o => o.id === activeComm.order_id) : null}
              onClose={() => { setShowMessageBox(false); setActiveComm(null); }}
            />
          )}
        </>
      )}
    </div>
  );
}