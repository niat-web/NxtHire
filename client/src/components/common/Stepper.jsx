import React from 'react';
import { FiCheck } from 'react-icons/fi';

const Stepper = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-40 sm:pr-80' : ''}`}>
            {currentStep > step.id ? (
              // Completed Step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-1 w-full bg-primary-600" />
                </div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-600">
                  <FiCheck className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <span className="absolute -bottom-8 w-max text-sm font-semibold text-primary-600">{step.name}</span>
              </>
            ) : currentStep === step.id ? (
              // Current Step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-1 w-full bg-gray-200" />
                </div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-600 bg-white" aria-current="step">
                  <span className="h-3 w-3 rounded-full bg-primary-600" />
                </div>
                <span className="absolute -bottom-8 w-max text-sm font-semibold text-primary-600">{step.name}</span>
              </>
            ) : (
              // Upcoming Step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-1 w-full bg-gray-200" />
                </div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                    <span className="h-3 w-3 rounded-full bg-transparent" />
                </div>
                 <span className="absolute -bottom-8 w-max text-sm font-medium text-gray-500">{step.name}</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;