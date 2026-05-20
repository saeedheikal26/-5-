import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, ShieldCheck
} from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
  title: string;
  subtitle: string;
  showBadge?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  onBack, 
  title, 
  subtitle,
  showBadge = false 
}) => {
  return (
    <div className="min-h-screen bg-[#F9FBFA] flex flex-col font-sans overflow-x-hidden" dir="rtl">
      {/* Header */}
      <header className="p-6 md:p-10 flex items-center justify-between">
        {onBack ? (
          <button 
            onClick={onBack}
            className="w-12 h-12 bg-white rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={20} className="rotate-180" />
          </button>
        ) : <div className="w-12" />}
        
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-black text-brand tracking-tight">تكامل</h1>
            <span className="text-[8px] font-black uppercase text-gray-300 tracking-[0.3em]">Season 2026</span>
        </div>

        <div className="w-12" />
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 pb-24">
        <div className="w-full max-w-sm space-y-8">
           <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-[#1a1a1a]">{title}</h2>
              <p className="text-[10px] font-black text-brand uppercase tracking-[0.3em]">{subtitle}</p>
           </div>
           
           <div className="bg-white p-10 rounded-[3rem] border-2 border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl" />
              <div className="relative z-10 w-full">
                {children}
              </div>
           </div>

           {showBadge && (
             <div className="flex justify-center">
                <div className="bg-amber-100 text-amber-700 px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                   <ShieldCheck size={14} />
                   Admin Mode
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};
