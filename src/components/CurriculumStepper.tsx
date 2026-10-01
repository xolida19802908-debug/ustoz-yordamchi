import React from 'react';
import { Check, Lock } from 'lucide-react';

export interface StepItem {
  number: number;
  id: string;
  label: string;
  subtitle: string;
}

export const WIZARD_STEPS: StepItem[] = [
  { number: 1, id: 'subject', label: 'FAN', subtitle: 'Fanni tanlang' },
  { number: 2, id: 'grade', label: 'SINF', subtitle: 'Sinfni tanlang' },
  { number: 3, id: 'textbook', label: 'DARSLIK', subtitle: 'Darslikni tanlang' },
  { number: 4, id: 'chapter', label: 'BOB', subtitle: 'Bobni tanlang' },
  { number: 5, id: 'topic', label: 'MAVZU', subtitle: 'Mavzuni tanlang' },
  { number: 6, id: 'settings', label: 'SOZLAMALAR', subtitle: 'Parametrlarni sozlang' },
  { number: 7, id: 'generate', label: 'YARATISH', subtitle: 'AI bilan yaratish' },
];

interface Props {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepNumber: number) => void;
  title?: string;
  subtitle?: string;
}

export const CurriculumStepper: React.FC<Props> = ({
  currentStep,
  completedSteps,
  onStepClick,
  title,
  subtitle,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs mb-6 no-print">
      {(title || subtitle) && (
        <div className="mb-5 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Bosqich: {currentStep} / 7
            </span>
          </div>
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
        <div className="flex items-center min-w-[700px] justify-between relative">
          {/* Progress bar line background */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-100 -z-0" />
          {/* Active progress fill */}
          <div
            className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 -z-0"
            style={{
              width: `${Math.max(0, Math.min(100, ((currentStep - 1) / 6) * 100))}%`,
            }}
          />

          {WIZARD_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.number);
            const isCurrent = currentStep === step.number;
            const isLocked = !isCompleted && !isCurrent && step.number > (Math.max(0, ...completedSteps) + 1);

            return (
              <button
                key={step.id}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (!isLocked) onStepClick(step.number);
                }}
                className={`relative z-10 flex flex-col items-center group transition-all focus:outline-none ${
                  isLocked ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'
                }`}
              >
                {/* Circle badge */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white ring-4 ring-emerald-500/20 scale-110 shadow-md'
                      : 'bg-white border-2 border-slate-200 text-slate-400 group-hover:border-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <span>0{step.number}</span>
                  )}
                </div>

                {/* Step Labels */}
                <div className="mt-2 text-center">
                  <div
                    className={`text-[11px] sm:text-xs font-extrabold tracking-wider uppercase transition-colors ${
                      isCurrent
                        ? 'text-emerald-700'
                        : isCompleted
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block whitespace-nowrap">
                    {step.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
