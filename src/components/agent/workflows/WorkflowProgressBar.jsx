import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function WorkflowProgressBar({ currentStep, totalSteps, stepLabels }) {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-5 py-3">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#8B1F1F] text-white ring-2 ring-[#8B1F1F]/30'
                    : isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : stepNum}
                </div>
                {stepLabels && stepLabels[i] && (
                  <span className={`text-xs font-semibold mt-1 whitespace-nowrap ${
                    isActive ? 'text-[#8B1F1F]' : isCompleted ? 'text-green-700' : 'text-gray-400'
                  }`}>
                    {stepLabels[i]}
                  </span>
                )}
              </div>
              {i < totalSteps - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                  isCompleted ? 'bg-green-200' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}