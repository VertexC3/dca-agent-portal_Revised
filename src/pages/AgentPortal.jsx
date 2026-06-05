import React, { useState, useRef, useCallback } from 'react';
import { LayoutDashboard, MessageSquare, ArrowLeftRight, Eye, EyeOff, PanelRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile, useIsTablet, useIsWide } from '@/hooks/use-mobile';
import AgentWorkspaceTabs from '../components/agent/AgentWorkspaceTabs';
import AgentRightPanel from '../components/agent/AgentRightPanel';
import OrderSearchBar from '../components/agent/OrderSearchBar';
import AgentDashboard from '../components/agent/AgentDashboard';
import InlineMessageBox from '../components/agent/InlineMessageBox';
import CoachMarks from '../components/agent/CoachMarks';
import PrescriptionRefillWorkflow from '../components/agent/workflows/PrescriptionRefillWorkflow';
import ShipmentUpdateWorkflow from '../components/agent/workflows/ShipmentUpdateWorkflow';
import PaymentWorkflow from '../components/agent/workflows/PaymentWorkflow';
import { usePatients } from '@/hooks/usePatients';
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
      {/* Swap button — positioned near top with always-visible label */}
      <div
        className="absolute z-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none"
        style={{ top: '68px' }}
      >
        <button
          data-coach="swap-button"
          onMouseDown={e => e.stopPropagation()}
          onClick={onSwap}
          aria-label="Swap panels"
          className="pointer-events-auto w-6 h-6 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-[#8B1F1F] hover:border-[#8B1F1F] hover:text-white text-gray-500 transition-all duration-200 hover:scale-[2]"
        >
          <ArrowLeftRight className="w-3 h-3" />
        </button>
        <span className="whitespace-nowrap rounded-md bg-gray-800 px-1.5 py-0.5 text-[9px] font-medium leading-tight text-white shadow-sm">
          Swap panels
        </span>
      </div>
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

const actionLabelClass =
  'whitespace-nowrap rounded-md bg-gray-800 px-1.5 py-0.5 text-[9px] font-medium leading-tight text-white shadow-sm';

function RightPanelVisibilityToggle({ visible, onHide, onShow, edge = 'right' }) {
  if (visible) {
    return (
      <div className="flex justify-end items-center gap-1.5 px-2 py-1 border-b border-gray-100 bg-white flex-shrink-0">
        <span className={actionLabelClass}>Hide panel</span>
        <button
          onClick={onHide}
          aria-label="Hide right panel"
          className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <EyeOff className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    );
  }

  const borderClass = edge === 'left' ? 'border-r' : 'border-l';

  return (
    <div className={`flex-shrink-0 flex flex-col items-center gap-0.5 pt-2 px-1.5 ${borderClass} border-gray-200 bg-gray-50/90 self-stretch`}>
      <button
        onClick={onShow}
        aria-label="Show right panel"
        title="Show panel"
        className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
      >
        <Eye className="w-4 h-4 text-gray-600" />
      </button>
      <span className={actionLabelClass}>Show panel</span>
    </div>
  );
}

function PatientWorkspace({
  selectedPatient, setSelectedPatient, middleW, dragMiddle,
  showMessageBox, setShowMessageBox, activeComm, setActiveComm,
  panelSwapped, setPanelSwapped, showCoachMarks, setShowCoachMarks,
  activeWorkflow, setActiveWorkflow, workflowData, setWorkflowData,
  rightPanelVisible, setRightPanelVisible, MIN, MAX,
  isMobile, isTablet, isWide, mobilePanel, detailsSheetOpen, setDetailsSheetOpen
}) {
  const { interaction } = useInteraction();
  const { patients } = usePatients();
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

  const handleSwitchPatient = (member) => {
    const found = patients.find(p => p.email === member.email);
    if (found) setSelectedPatient(found);
  };

  const handleStartWorkflow = (workflow, data) => {
    setActiveWorkflow(workflow);
    setWorkflowData(data);
  };

  const panelWidthStyle = isWide
    ? { width: middleW, minWidth: MIN, maxWidth: MAX }
    : undefined;

  const panelWidthClass = isWide
    ? 'flex-shrink-0'
    : 'flex-1 min-w-0 w-full';

  const isDesktopLayout = !isMobile && !isTablet && !activeWorkflow;
  const showPanelSplit = isDesktopLayout && rightPanelVisible;
  const splitPanelStyle = showPanelSplit ? panelWidthStyle : undefined;
  const splitPanelClass = showPanelSplit ? panelWidthClass : 'flex-1 min-w-0 w-full';

  const renderWorkspace = () => (
    <AgentWorkspaceTabs
      patient={selectedPatient}
      onSwitchPatient={handleSwitchPatient}
      onStartWorkflow={handleStartWorkflow}
      data-coach="workspace-tabs"
    />
  );

  const renderRightPanel = () => (
    <AgentRightPanel
      patient={selectedPatient}
      onOpenMessage={(msg) => { setActiveComm(msg); setShowMessageBox(true); }}
      onStartWorkflow={handleStartWorkflow}
      topSlot={aiTopSlot}
    />
  );

  return (
    <>
      <div className="flex gap-0 flex-1 min-h-0 overflow-hidden relative">
        {interaction && !isMobile && (
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

        {activeWorkflow ? (
          <div style={panelWidthStyle} className={`${panelWidthClass} overflow-hidden flex flex-col border-r border-gray-200`}>
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
        ) : isMobile ? (
          mobilePanel === 'workspace' ? (
            <div data-coach="workspace-tabs" className="flex-1 min-w-0 overflow-hidden flex flex-col">
              {renderWorkspace()}
            </div>
          ) : (
            <div data-coach="right-panel" className="flex-1 min-w-0 overflow-hidden flex flex-col">
              {renderRightPanel()}
            </div>
          )
        ) : isTablet ? (
          <>
            <div data-coach="workspace-tabs" className="flex-1 min-w-0 overflow-hidden flex flex-col border-r border-gray-200">
              {renderWorkspace()}
            </div>
            <div
              data-coach="right-panel"
              className="w-[min(340px,38vw)] min-w-[260px] max-w-[400px] flex-shrink-0 overflow-hidden flex flex-col bg-gray-50/50"
            >
              {renderRightPanel()}
            </div>
          </>
        ) : !panelSwapped ? (
          <>
            <div
              data-coach="workspace-tabs"
              style={splitPanelStyle}
              className={`${splitPanelClass} overflow-hidden flex flex-col${showPanelSplit ? ' border-r border-gray-200' : ''}`}
            >
              {renderWorkspace()}
            </div>
            {showPanelSplit && (
              <ResizeDivider onDrag={dragMiddle} onSwap={() => setPanelSwapped(v => !v)} />
            )}
            {rightPanelVisible && (
              <div data-coach="right-panel" className="flex-1 min-w-0 overflow-hidden flex flex-col relative">
                <RightPanelVisibilityToggle
                  visible
                  onHide={() => setRightPanelVisible(false)}
                />
                {renderRightPanel()}
              </div>
            )}
            {!rightPanelVisible && (
              <RightPanelVisibilityToggle
                visible={false}
                onShow={() => setRightPanelVisible(true)}
                edge="right"
              />
            )}
          </>
        ) : (
          <>
            {rightPanelVisible && (
              <div
                data-coach="right-panel"
                style={splitPanelStyle}
                className={`${splitPanelClass} overflow-hidden flex flex-col border-r border-gray-200 relative`}
              >
                <RightPanelVisibilityToggle
                  visible
                  onHide={() => setRightPanelVisible(false)}
                />
                {renderRightPanel()}
              </div>
            )}
            {!rightPanelVisible && (
              <RightPanelVisibilityToggle
                visible={false}
                onShow={() => setRightPanelVisible(true)}
                edge="left"
              />
            )}
            {showPanelSplit && (
              <ResizeDivider onDrag={dragMiddle} onSwap={() => setPanelSwapped(v => !v)} />
            )}
            <div data-coach="workspace-tabs" className="flex-1 min-w-0 overflow-hidden flex flex-col">
              {renderWorkspace()}
            </div>
          </>
        )}
      </div>

      <Sheet open={detailsSheetOpen} onOpenChange={setDetailsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col gap-0">
          <SheetHeader className="px-4 py-3 border-b border-gray-200">
            <SheetTitle className="text-sm font-bold">Patient Details</SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0 overflow-hidden" data-coach="right-panel">
            {renderRightPanel()}
          </div>
        </SheetContent>
      </Sheet>

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

function AgentToolbar({
  selectedPatient,
  setSelectedPatient,
  isMobile,
  showMessageBox,
  setShowMessageBox,
  setMobilePanel,
  showSimulate,
}) {
  return (
    <div className="px-3 sm:px-4 py-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        {selectedPatient && (
          <button
            onClick={() => setSelectedPatient(null)}
            className="flex items-center gap-1.5 h-9 text-xs font-semibold text-gray-500 hover:text-[#8B1F1F] transition-colors whitespace-nowrap flex-shrink-0"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
        )}
        <OrderSearchBar onSelectPatient={setSelectedPatient} />
        {selectedPatient && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {isMobile && (
              <button
                onClick={() => setMobilePanel('details')}
                className="flex items-center gap-1.5 h-9 text-xs font-semibold px-3 rounded-lg border bg-white text-gray-600 border-gray-200 hover:border-[#8B1F1F] hover:text-[#8B1F1F] transition-all"
              >
                <PanelRight className="w-3.5 h-3.5" />
                Details
              </button>
            )}
            <button
              onClick={() => setShowMessageBox(v => !v)}
              className={`flex items-center gap-1.5 h-9 text-xs font-semibold px-3 rounded-lg border transition-all ${
                showMessageBox
                  ? 'bg-[#8B1F1F] text-white border-[#8B1F1F]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#8B1F1F] hover:text-[#8B1F1F]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showMessageBox ? 'Hide Messages' : 'Messages'}</span>
              <span className="sm:hidden">{showMessageBox ? 'Hide' : 'Msg'}</span>
            </button>
            {showSimulate && <SimulateInteractionMenu />}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentPortal() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [middleW, setMiddleW] = useState(700);
  const [showMessageBox, setShowMessageBox] = useState(true);
  const [activeComm, setActiveComm] = useState(null);
  const [panelSwapped, setPanelSwapped] = useState(false);
  const [showCoachMarks, setShowCoachMarks] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [workflowData, setWorkflowData] = useState(null);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [mobilePanel, setMobilePanel] = useState('workspace');
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isWide = useIsWide();

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

  const toolbarProps = {
    selectedPatient,
    setSelectedPatient,
    isMobile,
    showMessageBox,
    setShowMessageBox,
    setMobilePanel,
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50">
      {!selectedPatient ? (
        <>
          <AgentToolbar {...toolbarProps} showSimulate={false} />
          <div className="flex-1 min-h-0 overflow-hidden">
            <AgentDashboard onSelectPatient={setSelectedPatient} />
          </div>
        </>
      ) : (
        <InteractionProvider patient={selectedPatient}>
          <AgentToolbar {...toolbarProps} showSimulate />
          {isMobile && !activeWorkflow && (
            <div className="flex gap-1 px-3 sm:px-4 py-2 bg-white border-b border-gray-100">
              {[
                { key: 'workspace', label: 'Workspace' },
                { key: 'details', label: 'Patient Details' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMobilePanel(key)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-all ${
                    mobilePanel === key
                      ? 'bg-[#8B1F1F] text-white border-[#8B1F1F]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
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
            isMobile={isMobile} isTablet={isTablet} isWide={isWide}
            mobilePanel={mobilePanel}
            detailsSheetOpen={detailsSheetOpen} setDetailsSheetOpen={setDetailsSheetOpen}
          />
        </InteractionProvider>
      )}
    </div>
  );
}
