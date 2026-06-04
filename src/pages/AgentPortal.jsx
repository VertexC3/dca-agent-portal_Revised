import React, { useState, useRef, useCallback } from 'react';
import { LayoutDashboard, MessageSquare, ArrowLeftRight, Eye, EyeOff, PanelRight } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
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

export default function AgentPortal() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [middleW, setMiddleW] = useState(700);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [activeComm, setActiveComm] = useState(null);
  // When true: left=RightPanel, right=WorkspaceTabs (swapped)
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

  const handleSwitchPatient = (member) => {
    const found = mockPatients.find(p => p.email === member.email);
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
    />
  );

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50">
      {/* Top Bar: Patient Selection + Order Search */}
      <div className="px-3 sm:px-4 py-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 min-w-0 flex-1">
            {selectedPatient && (
              <button
                onClick={() => setSelectedPatient(null)}
                className="dashbords flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#8B1F1F] transition-colors whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </button>
            )}
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap hidden sm:block">Select Patient:</label>
            <Select value={selectedPatient?.id || ''} onValueChange={(id) => {
              const patient = mockPatients.find(p => p.id === id);
              setSelectedPatient(patient || null);
            }}>
              <SelectTrigger className="w-full sm:flex-1 sm:max-w-72 min-w-0">
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
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full min-w-0 lg:w-auto lg:gap-4 lg:ml-auto">
            <OrderSearchBar onSelectPatient={setSelectedPatient} />
            {selectedPatient && isMobile && (
              <button
                onClick={() => setMobilePanel('details')}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white text-gray-600 border-gray-200 hover:border-[#8B1F1F] hover:text-[#8B1F1F] transition-all"
              >
                <PanelRight className="w-3.5 h-3.5" />
                Details
              </button>
            )}
            {selectedPatient && (
              <button
                onClick={() => setShowMessageBox(v => !v)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  showMessageBox
                    ? 'bg-[#8B1F1F] text-white border-[#8B1F1F]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#8B1F1F] hover:text-[#8B1F1F]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{showMessageBox ? 'Hide Messages' : 'Messages'}</span>
                <span className="sm:hidden">{showMessageBox ? 'Hide' : 'Msg'}</span>
              </button>
            )}
          </div>
        </div>
        {selectedPatient && isMobile && !activeWorkflow && (
          <div className="flex gap-1 mt-3 border-t border-gray-100 pt-3">
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
      </div>

      {/* Main Content */}
      {!selectedPatient ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <AgentDashboard onSelectPatient={setSelectedPatient} />
        </div>
      ) : (
        <>
          <div className="flex gap-0 flex-1 min-h-0 overflow-hidden relative">
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
                <div style={panelWidthStyle} className={`${panelWidthClass} overflow-hidden flex flex-col border-r border-gray-200`}>
                  {renderWorkspace()}
                </div>
                <ResizeDivider onDrag={dragMiddle} onSwap={() => setPanelSwapped(v => !v)} />
                {rightPanelVisible && (
                  <div data-coach="right-panel" className="flex-1 min-w-0 overflow-hidden flex flex-col">
                    <div className="flex justify-end px-2 py-1 border-b border-gray-100 bg-white flex-shrink-0">
                      <button
                        onClick={() => setRightPanelVisible(false)}
                        className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                        title="Hide right panel"
                      >
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    {renderRightPanel()}
                  </div>
                )}
                {!rightPanelVisible && (
                  <div className="absolute top-2 right-2 z-40">
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
                {rightPanelVisible && (
                  <div data-coach="right-panel" style={panelWidthStyle} className={`${panelWidthClass} overflow-hidden flex flex-col border-r border-gray-200`}>
                    <div className="flex justify-end px-2 py-1 border-b border-gray-100 bg-white flex-shrink-0">
                      <button
                        onClick={() => setRightPanelVisible(false)}
                        className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                        title="Hide right panel"
                      >
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    {renderRightPanel()}
                  </div>
                )}
                {!rightPanelVisible && (
                  <div className="absolute top-2 left-2 z-40">
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

          {showMessageBox && (
            <InlineMessageBox
              patient={selectedPatient}
              activeComm={activeComm}
              linkedOrder={activeComm?.order_id ? selectedPatient?.orders?.find(o => o.id === activeComm.order_id) : null}
              onClose={() => { setShowMessageBox(false); setActiveComm(null); }}
            />
          )}

          <CoachMarks isActive={showCoachMarks} onComplete={() => setShowCoachMarks(false)} />
        </>
      )}
    </div>
  );
}