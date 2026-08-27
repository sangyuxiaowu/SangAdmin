import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  title: string;
  description: string;
}

interface StepProgressBarProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isNavigable = step.id < currentStep;

          return (
            <div
              key={step.id}
              onClick={() => isNavigable && onStepClick?.(step.id)}
              className={`flex items-center space-x-3 transition-all ${
                isNavigable ? 'cursor-pointer hover:opacity-80' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-4 ring-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <div className="min-w-0">
                <div
                  className={`text-xs sm:text-sm font-bold truncate ${
                    isCurrent
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : isCompleted
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
