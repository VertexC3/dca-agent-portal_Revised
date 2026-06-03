import React, { useState, useRef, useCallback } from 'react';
import { LayoutDashboard, MessageSquare, ArrowLeftRight, Eye, EyeOff } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import AgentWorkspaceTabs from '../components/agent/AgentWorkspaceTabs';
import AgentRightPanel from '../components/agent/AgentRightPanel';
import OrderSearchBar from '../components/agent/OrderSearchBar';
import AgentDashboard from '../components/agent/AgentDashboard';
import InlineMessageBox from '../components/agent/InlineMessageBox';
import CoachMarks from '../components/agent/CoachMarks';
import PrescriptionRefillWorkflow from '../components/agent/workflows/PrescriptionRefillWorkflow';
import ShipmentUpdateWorkflow from '../components/agent/workflows/ShipmentUpdateWorkflow';
import PaymentWorkflow from '../components/agent/workflows/PaymentWorkflow';
import { mockPatients } from '../data/mockPatients';
import { InteractionProvider, useInteraction } from '../components/agent/interaction/InteractionContext';
import SimulateInteractionMenu from '../components/agent/interaction/SimulateInteractionMenu';
import TaskQueueRail from '../components/agent/interaction/TaskQueueRail';
import InteractionConsole from '../components/agent/interaction/InteractionConsole';
import AICopilotPanel from '../components/agent/interaction/AICopilotPanel';
import FloatingAIWindow from '../components/agent/interaction/FloatingAIWindow';
import WrapUpModal from '../components/agent/interaction/WrapUpModal';

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
        data-coach="swap-button"
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

// Thin draggable strip on the right edge of the InteractionConsole.
// Lets the rep shrink the console by up to 10% to reclaim horizontal space.
function ConsoleDragHandle({ onDrag, atMin, atMax }) {
  const dragging = React.useRef(false);
  const lastX = React.useRef(0);

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
      title={atMin ? 'Minimum width reached' : 'Drag to shrink Connected Call (up to 10%)'}
      className={`w-1.5 flex-shrink-0 cursor-col-resize transition-colors relative group ${
        atMin ? 'bg-gray-200' : 'bg-gray-100 hover:bg-[#8B1F1F]/30'
      }`}
    >
      <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-px transition-colors ${
        atMin ? 'bg-gray-300' : 'bg-gray-200 group-hover:bg-[#8B1F1F]/50'
      }`} />
      {/* Small grip indicator */}
      <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-1 h-8 rounded-full ${
        atMax ? 'bg-gray-300' : 'bg-[#8B1F1F]/40'
      } opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
    </div>
  );
}

function PatientWorkspace({
  selectedPatient, setSelectedPatient, middleW, dragMiddle,
  showMessageBox, setShowMessageBox, activeComm, setActiveComm,
  panelSwapped, setPanelSwapped, showCoachMarks, setShowCoachMarks,
  activeWorkflow, setActiveWorkflow, workflowData, setWorkflowData,
  rightPanelVisible, setRightPanelVisible, MIN, MAX
}) {
  const { interaction } = useInteraction();
  const [floatingOpen, setFloatingOpen] = React.useState(false);

  // Interaction Console width: default 560px, can be dragged closed by up to 10% (down to 504px).
  // Cannot be expanded beyond default.
  const CONSOLE_DEFAULT_W = 560;
  const CONSOLE_MIN_W = Math.round(CONSOLE_DEFAULT_W * 0.9); // 504
  const [consoleW, setConsoleW] = React.useState(CONSOLE_DEFAULT_W);
  const dragConsole = React.useCallback((delta) => {
    setConsoleW(w => Math.max(CONSOLE_MIN_W, Math.min(CONSOLE_DEFAULT_W, w + delta)));
  }, []);

  const handleDeepLink = React.useCallback((sug) => {
    if (!sug) return;
    const t = (sug.text || '').toLowerCase();
    if (sug.category === 'escalate') {
      console.info('Escalation suggestion clicked', sug);
      return;
    }
    if (t.includes('refill') || t.includes('semaglutide') || t.includes('tirzepatide')) {
      setActiveWorkflow('refill');
      setWorkflowData({ selectedRx: selectedPatient?.prescriptions?.[0] });
      return;
    }
    if (t.includes('shipment') || t.includes('delivery') || t.includes('tracking')) {
      setActiveWorkflow('shipment');
      setWorkflowData({ selectedOrder: selectedPatient?.orders?.[0] });
      return;
    }
    if (t.includes('payment') || t.includes('invoice') || t.includes('balance') || t.includes('plan') || t.includes('copay')) {
      setActiveWorkflow('payment');
      setWorkflowData({ cartTotal: selectedPatient?.invoices?.find(i => i.status !== 'paid')?.amount || 0 });
      return;
    }
    if (sug.kbLink) {
      window.open(sug.kbLink, '_blank', 'noopener');
    }
  }, [selectedPatient, setActiveWorkflow, setWorkflowData]);

  const aiTopSlot = interaction
    ? <AICopilotPanel onPopOut={() => setFloatingOpen(true)} onDeepLink={handleDeepLink} />
    : null;

  return (
    <>
      <div className="absolute top-[78px] right-4 z-30">
        <SimulateInteractionMenu />
      </div>

      <div className="flex gap-0 flex-1 overflow-hidden">
        {interaction && (
          <>
            <TaskQueueRail />
            <InteractionConsole width={consoleW} />
            <ConsoleDragHandle
              onDrag={dragConsole}
              atMin={consoleW <= CONSOLE_MIN_W}
              atMax={consoleW >= CONSOLE_DEFAULT_W}
            />
          </>
        )}

        {/* Active Workflow Takes Over Left Side */}
        {activeWorkflow ? (
          <div style={{ width: middleW, minWidth: MIN, maxWidth: MAX }} className="flex-shrink-0 overflow-hidden flex flex-col border-r border-gray-200">
            {activeWorkflow === 'refill' && (
              <PrescriptionRefillWorkflow
                patient={selectedPatient}
                selectedRx={workflowData?.selectedRx}
                onBack={() => setActiveWorkflow(null)}
                onComplete={() => setActiveWorkflow(null)}
              />
            )}
            {activeWorkflow === 'shipment' && (
              <ShipmentUpdateWorkflow
                patient={selectedPatient}
                selectedOrder={workflowData?.selectedOrder}
                onBack={() => setActiveWorkflow(null)}
                onComplete={() => setActiveWorkflow(null)}
              />
            )}
            {activeWorkflow === 'payment' && (
              <PaymentWorkflow
                patient={selectedPatient}
                cartTotal={workflowData?.cartTotal}
                onBack={() => setActiveWorkflow(null)}
                onComplete={() => setActiveWorkflow(null)}
              />
            )}
          </div>
        ) : (
          <>
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
                    onStartWorkflow={(workflow, data) => {
                      setActiveWorkflow(workflow);
                      setWorkflowData(data);
                    }}
                    data-coach="workspace-tabs"
                  />
                </div>
                <ResizeDivider onDrag={dragMiddle} onSwap={() => setPanelSwapped(v => !v)} />
                {/* Right: Right Panel with Visibility Toggle */}
                {rightPanelVisible && (
                  <div data-coach="right-panel" className="flex-1 min-w-0 overflow-hidden flex flex-col">
                    <div className="absolute top-[92px] right-4 z-40">
                      <button
                        onClick={() => setRightPanelVisible(false)}
                        className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                        title="Hide right panel"
                      >
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <AgentRightPanel
                      patient={selectedPatient}
                      onOpenMessage={(msg) => { setActiveComm(msg); setShowMessageBox(true); }}
                      onStartWorkflow={(workflow, data) => {
                        setActiveWorkflow(workflow);
                        setWorkflowData(data);
                      }}
                      topSlot={aiTopSlot}
                    />
                  </div>
                )}
                {!rightPanelVisible && (
                  <div className="absolute top-[92px] right-4 z-40">
                    <button
                      onClick={() => setRightPanelVisible(true)}
                      className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                      title="Show right panel"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Swapped: Right Panel on left with Visibility Toggle */}
                {rightPanelVisible && (
                  <div data-coach="right-panel" style={{ width: middleW, minWidth: MIN, maxWidth: MAX }} className="flex-shrink-0 overflow-hidden flex flex-col border-r border-gray-200">
                    <div className="absolute top-[92px] left-4 z-40">
                      <button
                        onClick={() => setRightPanelVisible(false)}
                        className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                        title="Hide right panel"
                      >
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <AgentRightPanel
                      patient={selectedPatient}
                      onOpenMessage={(msg) => { setActiveComm(msg); setShowMessageBox(true); }}
                      onStartWorkflow={(workflow, data) => {
                        setActiveWorkflow(workflow);
                        setWorkflowData(data);
                      }}
                      topSlot={aiTopSlot}
                    />
                  </div>
                )}
                {!rightPanelVisible && (
                  <div className="absolute top-[92px] left-4 z-40">
                    <button
                      onClick={() => setRightPanelVisible(true)}
                      className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                      title="Show right panel"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
                <ResizeDivider onDrag={dragMiddle} onSwap={() => setPanelSwapped(v => !v)} />
                {/* Workspace Tabs on right */}
                <div data-coach="workspace-tabs" className="flex-1 min-w-0 overflow-hidden flex flex-col">
                  <AgentWorkspaceTabs
                    patient={selectedPatient}
                    onSwitchPatient={(member) => {
                      const found = mockPatients.find(p => p.email === member.email);
                      if (found) setSelectedPatient(found);
                    }}
                    onStartWorkflow={(workflow, data) => {
                      setActiveWorkflow(workflow);
                      setWorkflowData(data);
                    }}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showMessageBox && interaction?.type !== 'chat' && (
        <InlineMessageBox
          patient={selectedPatient}
          activeComm={activeComm}
          linkedOrder={activeComm?.order_id ? selectedPatient?.orders?.find(o => o.id === activeComm.order_id) : null}
          onClose={() => { setShowMessageBox(false); setActiveComm(null); }}
        />
      )}

      <CoachMarks isActive={showCoachMarks} onComplete={() => setShowCoachMarks(false)} />
      <FloatingAIWindow open={floatingOpen} onClose={() => setFloatingOpen(false)} onDeepLink={handleDeepLink} />
      <WrapUpModal />
    </>
  );
}

export default function AgentPortal() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [middleW, setMiddleW] = useState(700);
  const [showMessageBox, setShowMessageBox] = useState(true);
  const [activeComm, setActiveComm] = useState(null);
  // When true: left=RightPanel, right=WorkspaceTabs (swapped)
  const [panelSwapped, setPanelSwapped] = useState(false);
  const [showCoachMarks, setShowCoachMarks] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [workflowData, setWorkflowData] = useState(null);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  const MIN = 400;
  const MAX = 1000;

  const dragMiddle = useCallback((delta) => {
    setMiddleW(w => Math.min(MAX, Math.max(MIN, w + delta)));
  }, []);

  React.useEffect(() => {
    if (window.__agentOnboardingActive && selectedPatient) {
      setShowCoachMarks(true);
      localStorage.setItem('agentOnboardingComplete', 'true');
      window.__agentOnboardingActive = false;
    }
  }, [selectedPatient]);

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] bg-gray-50 overflow-hidden">
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
        <InteractionProvider patient={selectedPatient}>
          <PatientWorkspace
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
            middleW={middleW} dragMiddle={dragMiddle}
            showMessageBox={showMessageBox} setShowMessageBox={setShowMessageBox}
            activeComm={activeComm} setActiveComm={setActiveComm}
            panelSwapped={panelSwapped} setPanelSwapped={setPanelSwapped}
            showCoachMarks={showCoachMarks} setShowCoachMarks={setShowCoachMarks}
            activeWorkflow={activeWorkflow} setActiveWorkflow={setActiveWorkflow}
            workflowData={workflowData} setWorkflowData={setWorkflowData}
            rightPanelVisible={rightPanelVisible} setRightPanelVisible={setRightPanelVisible}
            MIN={MIN} MAX={MAX}
          />
        </InteractionProvider>
      )}
    </div>
  );
}
