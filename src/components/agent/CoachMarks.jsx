import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COACH_MARKS = [
  {
    id: 'drag-panels',
    title: 'Move Panels Around',
    description: 'Drag panels by clicking the grip icon (≡) at the top to reorganize your workspace.',
    selector: '[data-coach="drag-icon"]',
    position: 'right',
    step: 1,
  },
  {
    id: 'swap-panels',
    title: 'Swap Panels',
    description: 'Click the swap button to exchange the left and right panels for quick layout changes.',
    selector: '[data-coach="swap-button"]',
    position: 'bottom',
    step: 2,
  },
  {
    id: 'tabs',
    title: 'Patient Tabs',
    description: 'Switch between Overview, Prescriptions, Orders, Communications, and Billing tabs to view different patient data.',
    selector: '[data-coach="workspace-tabs"]',
    position: 'bottom',
    step: 3,
  },
  {
    id: 'right-panel',
    title: 'Patient Information Panel',
    description: 'View recent communications, quick actions, and alerts about your patient.',
    selector: '[data-coach="right-panel"]',
    position: 'left',
    step: 4,
  },
];

export default function CoachMarks({ isActive, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || currentStep >= COACH_MARKS.length) return;

    const mark = COACH_MARKS[currentStep];
    const element = document.querySelector(mark.selector);

    if (element) {
      const rect = element.getBoundingClientRect();
      const offset = 16;

      let top = rect.top + window.scrollY;
      let left = rect.left + window.scrollX;

      if (mark.position === 'right') {
        left = rect.right + offset;
        top = rect.top + window.scrollY + rect.height / 2 - 60;
      } else if (mark.position === 'left') {
        left = rect.left - 320 - offset;
        top = rect.top + window.scrollY;
      } else if (mark.position === 'bottom') {
        left = rect.left + window.scrollX;
        top = rect.bottom + offset;
      }

      setPosition({ top, left });
    }
  }, [isActive, currentStep]);

  if (!isActive || currentStep >= COACH_MARKS.length) return null;

  const mark = COACH_MARKS[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setCurrentStep(COACH_MARKS.length)} />

      {/* Coach Mark Tooltip */}
      <div
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
        className="fixed z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="text-xs font-semibold text-[#8B1F1F] uppercase tracking-wide">
              Step {mark.step} of {COACH_MARKS.length}
            </div>
            <h3 className="text-sm font-bold text-gray-900 mt-1">{mark.title}</h3>
          </div>
          <button
            onClick={() => setCurrentStep(COACH_MARKS.length)}
            className="text-gray-400 hover:text-gray-600 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{mark.description}</p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep(COACH_MARKS.length)}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="flex-1 bg-[#8B1F1F] hover:bg-[#721919]"
            size="sm"
          >
            {currentStep === COACH_MARKS.length - 1 ? 'Done' : 'Next'}
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </>
  );
}