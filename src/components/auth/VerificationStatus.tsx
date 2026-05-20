import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CheckCircle2, Clock, Hourglass } from 'lucide-react';

interface VerificationStatusProps {
  status: 'verifying' | 'success';
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ status }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-6 text-center"
    >
      <div className="relative w-28 h-28 mb-10">
        {status === 'verifying' ? (
          <>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-full h-full border-[6px] border-gray-100 border-t-brand rounded-full shadow-inner"
            />
            <div className="absolute inset-0 flex items-center justify-center text-brand">
              <Hourglass size={40} className="animate-pulse" />
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full h-full bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 relative"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-emerald-500 rounded-[2rem]"
            />
            <CheckCircle2 size={56} className="relative z-10" />
          </motion.div>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {status === 'verifying' ? 'جاري التحقق...' : 'أنت الآن بطل! 🎉'}
          </h2>
          <p className="text-gray-500 max-w-xs mx-auto font-bold leading-relaxed text-sm">
            {status === 'verifying' 
              ? 'نقوم الآن بتسجيل رقم العملية وتأمين بياناتك. ثواني من فضلك...'
              : 'تم إرسال رقم العملية بنجاح. سيتم تفعيل حسابك بمجرد مطابقة البيانات، انضم لجيش الأبطال الآن!'}
          </p>
        </motion.div>
      </AnimatePresence>

      {status === 'success' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-2xl border-2 border-emerald-100 border-b-4">
            <ShieldCheck size={20} />
            <span className="font-extrabold text-xs tracking-wide">SECURE SUBMISSION COMPLETE</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
