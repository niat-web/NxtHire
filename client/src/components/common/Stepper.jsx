import React from 'react';
import { Check } from 'lucide-react';

const Stepper = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-40 sm:pr-80' : ''}`}>
            {currentStep > step.id ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                  <Check className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <span className="absolute -bottom-7 w-max text-[12px] font-semibold text-foreground">{step.name}</span>
              </>
            ) : currentStep === step.id ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-200" />
                </div>
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-white" aria-current="step">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#C0392B' }} />
                </div>
                <span className="absolute -bottom-7 w-max text-[12px] font-semibold text-foreground">{step.name}</span>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-200" />
                </div>
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white">
                    <span className="h-2 w-2 rounded-full bg-transparent" />
                </div>
                 <span className="absolute -bottom-7 w-max text-[12px] text-muted-foreground">{step.name}</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;
