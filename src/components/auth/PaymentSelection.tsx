import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Wallet, ArrowLeft, ShieldCheck } from 'lucide-react';

interface PaymentSelectionProps {
  onSelect: (method: 'instapay' | 'wallet') => void;
}

export const PaymentSelection: React.FC<PaymentSelectionProps> = ({ onSelect }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-[#1a1a1a]">اختر وسيلة الدفع</h2>
        <p className="text-gray-500 mt-2">اشترك بـ 99 جنيه فقط وابدأ التحدي الآن</p>
      </div>

      <button 
        onClick={() => onSelect('instapay')}
        className="w-full bg-white border border-gray-100 p-6 rounded-3xl flex items-center gap-5 hover:border-brand/40 hover:bg-brand/5 transition-all text-right group shadow-sm relative overflow-hidden active:scale-[0.98]"
      >
        <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center text-brand group-hover:scale-110 transition-all border border-brand/10 shadow-sm">
          <RefreshCw size={28} />
        </div>
        <div className="flex-1">
          <p className="font-black text-[#1a1a1a] text-xl font-sans tracking-tight">InstaPay</p>
          <p className="text-xs text-gray-400 font-medium font-sans mt-0.5">تحويل فوري وآمن</p>
        </div>
        <ArrowLeft size={20} className="text-gray-300 group-hover:text-brand transition-colors" />
      </button>

      <button 
        onClick={() => onSelect('wallet')}
        className="w-full bg-white border border-gray-100 p-6 rounded-3xl flex items-center gap-5 hover:border-amber-400/40 hover:bg-amber-50 transition-all text-right group shadow-sm relative overflow-hidden active:scale-[0.98]"
      >
        <div className="w-14 h-14 bg-amber-100/50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-all border border-amber-200/50 shadow-sm">
          <Wallet size={28} />
        </div>
        <div className="flex-1">
          <p className="font-black text-[#1a1a1a] text-xl">محفظة إلكترونية</p>
          <p className="text-xs text-gray-400 font-medium font-sans mt-0.5">فودافون كاش، اتصالات، أورانج</p>
        </div>
        <ArrowLeft size={20} className="text-gray-300 group-hover:text-amber-600 transition-colors" />
      </button>

      <div className="pt-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] font-sans">Payment Data Encrypted & Secure</span>
        </div>
      </div>
    </motion.div>
  );
};
