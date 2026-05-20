import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface ProgressStepsProps {
  currentStep: number;
}

const steps: Step[] = [
  { id: 1, label: 'الدخول' },
  { id: 2, label: 'البيانات' },
  { id: 3, label: 'الدفع' },
  { id: 4, label: 'المراجعة' },
];

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full mb-12 px-2 relative">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center relative z-10">
            <motion.div 
              initial={false}
              animate={{
                backgroundColor: currentStep >= step.id ? 'var(--color-brand)' : '#ffffff',
                borderColor: currentStep >= step.id ? 'var(--color-brand)' : '#e5e7eb',
                color: currentStep >= step.id ? '#ffffff' : '#9ca3af',
                scale: currentStep === step.id ? 1.1 : 1
              }}
              className="w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all shadow-sm"
            >
              {currentStep > step.id ? (
                <Check size={18} strokeWidth={4} />
              ) : (
                <span className="font-black text-xs">{step.id}</span>
              )}
            </motion.div>
            <motion.span 
              animate={{ opacity: currentStep >= step.id ? 1 : 0.5 }}
              className={`text-[9px] font-black mt-2 tracking-wider transition-colors ${currentStep >= step.id ? 'text-brand' : 'text-gray-400'}`}
            >
              {step.label}
            </motion.span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-[2px] bg-gray-100 mx-1 -mt-6 relative overflow-hidden">
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                className="absolute inset-0 bg-brand"
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
