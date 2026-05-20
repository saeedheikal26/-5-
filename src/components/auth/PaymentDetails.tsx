import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Copy, CheckCircle2, 
  Loader2, Send, AlertCircle, Hash
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentDetailsProps {
  method: 'instapay' | 'wallet';
  onBack: () => void;
  onConfirm: (transactionId: string) => void;
  isSubmitting: boolean;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ 
  method, 
  onBack, 
  onConfirm,
  isSubmitting 
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    const fallbackCopy = (content: string) => {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyFeedback(label);
        toast.success(`تم نسخ ${label === 'handle' ? 'بيانات التحويل' : 'المبلغ'} ✅`);
      } catch (err) {
        toast.error('فشل النسخ، يرجى النسخ يدوياً');
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopyFeedback(label);
        toast.success(`تم نسخ ${label === 'handle' ? 'بيانات التحويل' : 'المبلغ'} ✅`);
        setTimeout(() => setCopyFeedback(null), 2000);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const accountInfo = {
    instapay: {
      label: 'InstaPay Handle',
      value: 'saeedheikal1@instapay',
      display: 'saeedheikal1@instapay',
    },
    wallet: {
      label: 'رقم المحفظة',
      value: '01012702258',
      display: '01012702258',
    }
  }[method];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!transactionId.trim() || transactionId.trim().length < 6) {
      toast.error('يرجى إدخال رقم عمليةالدفع Reference )');
      return;
    }
    onConfirm(transactionId.trim());
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <button 
        onClick={onBack}
        className="text-sm font-bold text-brand flex items-center gap-1 mb-2 font-sans hover:-translate-x-1 transition-transform"
      >
        <ArrowLeft size={14} />
        تغيير وسيلة الدفع
      </button>

      <div className="text-center">
        <h2 className="text-2xl font-black text-[#1a1a1a]">تأكيد الدفع</h2>
        <p className="text-gray-500 mt-1 text-sm">اتبع الخطوات لإتمام الاشتراك</p>
      </div>

      {method === 'instapay' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand/10 to-white border border-brand/20 rounded-[2rem] p-6 text-center shadow-xl"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-brand/10 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-black text-brand uppercase tracking-widest">
                InstaPay Payment
              </span>
            </div>


            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-2">
                InstaPay Handle
              </p>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="font-black text-brand text-lg font-sans">
                  {accountInfo.display}
                </span>

                <button
                  onClick={() => handleCopy(accountInfo.value, 'handle')}
                  className="bg-brand/5 hover:bg-brand hover:text-white text-brand p-2 rounded-xl transition-all"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-gray-50/50 backdrop-blur-xl border border-gray-100 rounded-3xl p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-right pr-2">
            {accountInfo.label}
          </label>
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <span className="font-black text-[#1a1a1a] text-lg font-sans tracking-tight">
              {accountInfo.display}
            </span>
            <button 
              onClick={() => handleCopy(accountInfo.value, 'handle')}
              className="flex items-center gap-2 bg-brand/5 text-brand px-4 py-2.5 rounded-xl font-black text-xs hover:bg-brand hover:text-white transition-all active:scale-95"
            >
              {copyFeedback === 'handle' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copyFeedback === 'handle' ? 'تم' : 'نسخ'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-right pr-2">المبلغ</label>
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-baseline gap-1">
              <span className="font-black text-brand text-2xl font-sans tracking-tight">99.00</span>
              <span className="text-[10px] font-black text-brand/60 uppercase">EGP</span>
            </div>
            <button 
              onClick={() => handleCopy('99', 'amount')}
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-brand transition-all border border-gray-100 shadow-sm active:scale-95"
            >
              {copyFeedback === 'amount' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-2">
          <label className="flex items-center justify-between px-2">
            <span className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">رقم العملية (Transaction ID)</span>
            <Hash size={16} className="text-brand" />
          </label>
          <input 
            type="text" 
            value={transactionId}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setTransactionId(val);
            }}
            placeholder="أدخل رقم عملية الدفع Reference)"
            className="w-full bg-white border-2 border-gray-100 px-6 py-5 rounded-2xl outline-none focus:border-brand transition-all font-black text-[#1a1a1a] shadow-lg shadow-gray-200/20 text-center font-sans tracking-[0.2em] text-xl focus:ring-8 focus:ring-brand/5"
            required
            autoComplete="off"
          />
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 text-right">
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <p className="text-[10px] text-amber-900 leading-relaxed font-bold">
            بعد التحويل، ابحث عن رقم العملية في تفاصيل التحويل داخل إنستا باي وكتبه هنا بدقة لتفعيل حسابك فوراً.
          </p>
        </div>

        <button 
          type="submit"
          disabled={transactionId.length < 6 || isSubmitting}
          className={`w-full py-5 rounded-2xl text-lg font-black transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.97] hover:opacity-90 mt-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:translate-y-0 ${transactionId.length >= 6 && !isSubmitting ? 'bg-brand text-white shadow-brand/20' : 'bg-gray-100 text-gray-400'} ${isSubmitting ? 'cursor-wait shadow-none' : ''}`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>جاري التحقق...</span>
            </div>
          ) : (
            <>
              <span>تأكيد الدفع</span>
              <Send size={20} className="rotate-0" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
