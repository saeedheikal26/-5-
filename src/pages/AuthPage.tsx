import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Trophy, ShieldCheck, Loader2, MessageCircle, AlertCircle, 
  ArrowLeft 
} from 'lucide-react';
import { 
  signInWithRedirect, 
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { toast } from 'sonner';
import { isMobileDevice, isSafari } from '../lib/utils';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
      if (isMobileDevice() || isSafari()) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
          toast.success(`أهلاً بك يا ${result.user.displayName?.split(' ')[0] || 'بطل'}! 🚀`);
        }
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      setIsGoogleLoading(false);
      
      const errorCode = error.code || (error.message?.includes('auth/popup-closed-by-user') ? 'auth/popup-closed-by-user' : '');

      if (errorCode === 'auth/popup-closed-by-user') {
        toast.info('تم إلغاء تسجيل الدخول.');
        return;
      }
      
      let message = 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.';
      
      if (errorCode === 'auth/popup-blocked') {
        message = 'تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة أو فتح التطبيق في تبويب جديد.';
      } else if (errorCode === 'auth/network-request-failed') {
        message = 'فشل الاتصال بالسيرفر. يرجى التأكد من جودة الإنترنت والمحاولة مرة أخرى.';
      }
      
      toast.error(message);
    }
  };

  return (
    <div id="auth-root" className="min-h-screen bg-luxblack text-slate-800 flex flex-col justify-center items-center p-6 relative overflow-hidden" dir="rtl">
      
      {/* Decorative Green Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 right-8 flex items-center gap-2 text-slate-500 font-bold hover:text-[#059669] transition-colors text-xs uppercase tracking-wider font-sans"
      >
        <ArrowLeft size={16} />
        العودة للرئيسية
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white p-10 rounded-[3rem] border border-emerald-100 shadow-xl space-y-8 relative z-10"
      >
        <div className="text-center">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner text-[#059669]"
          >
            <Trophy size={40} className="drop-shadow-[0_2px_15px_rgba(16,185,129,0.3)]" fill="currentColor" />
          </motion.div>
          
          <h1 className="text-3xl font-black text-emerald-950 font-serif tracking-tight mb-2">تأكيد هويتك 🔑</h1>
          <p className="text-slate-500 font-extrabold text-sm leading-relaxed">قم بتسجيل الدخول لبدء تتبع وإثبات الصلاة على النبي ﷺ والظهور بلوحة المتصدرين</p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-5 rounded-2xl bg-slate-50 border border-emerald-100 hover:border-[#059669]/50 hover:bg-emerald-50/50 flex items-center justify-center gap-3 font-black text-slate-800 shadow-sm active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin text-[#059669]" size={24} />
            ) : (
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-6 h-6 select-none"
                alt="Google Logo"
              />
            )}
            <span className="text-base font-sans font-bold">الدخول الفوري عبر Google</span>
          </button>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mr-2 uppercase tracking-wider font-sans">
            <ShieldCheck size={14} className="text-emerald" />
            <span>اتصال مُشفر بالكامل وآمن بنسبة 100%</span>
          </div>
          
          <a 
            href="https://wa.me/201012702258" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-600 hover:text-[#059669] hover:border-[#059669]/30 transition-colors font-bold text-xs bg-slate-50 px-5 py-3 rounded-full border border-slate-100"
          >
            <MessageCircle size={16} />
            تواجه صعوبة في التسجيل؟ تواصل معنا
          </a>
        </div>
      </motion.div>
      
      <p className="mt-8 text-[11px] text-slate-400 font-bold tracking-widest font-sans uppercase">
        تحدي الـ 5 أيام للصلاة على النبي ﷺ
      </p>
    </div>
  );
}
