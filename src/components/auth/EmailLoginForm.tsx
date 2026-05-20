import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, 
  WifiOff
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { toast } from 'sonner';

interface EmailLoginFormProps {
  onSuccess: (user: any) => void;
}

export const EmailLoginForm: React.FC<EmailLoginFormProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || cooldown) return;

    if (!navigator.onLine) {
      toast.error('أنت غير متصل بالإنترنت');
      return;
    }

    const finalEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(finalEmail)) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      return;
    }

    if (mode !== 'reset' && !password) {
      toast.error('يرجى إدخال كلمة المرور');
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      return;
    }

    setCooldown(true);
    setTimeout(() => setCooldown(false), 1500);

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, finalEmail, password);
        toast.success('تم تسجيل الدخول بنجاح 🚀');
        setTimeout(() => onSuccess(result.user), 600);
      } else if (mode === 'signup') {
        if (password.length < 6) {
          toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          setIsLoading(false);
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, finalEmail, password);
        toast.success('تم إنشاء الحساب بنجاح! 🎉');
        setTimeout(() => onSuccess(result.user), 600);
      } else {
        await sendPasswordResetEmail(auth, finalEmail);
        toast.success('تم إرسال رابط استعادة كلمة المرور لبريدك');
        setMode('login');
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      
      let message = 'حدث خطأ أثناء تسجيل الدخول';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'بيانات الدخول غير صحيحة';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'هذا البريد مسجل لدينا بالفعل، يرجى تسجيل الدخول بدلاً من إنشاء حساب جديد';
        setMode('login');
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'تسجيل الدخول بالبريد غير مفعل في Firebase.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'مشكلة في الاتصال بالإنترنت';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'محاولات كثيرة خاطئة، تم حظر الحساب مؤقتاً';
      }
      
      toast.error(message);
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length > 10) return { label: 'قوية', color: 'text-emerald-500' };
    if (password.length > 6) return { label: 'متوسطة', color: 'text-amber-500' };
    return { label: 'ضعيفة', color: 'text-rose-500' };
  };

  const strength = getPasswordStrength();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm mx-auto"
      dir="rtl"
    >
      <motion.form 
        onSubmit={handleSubmit} 
        initial={{ opacity: 0, y: 15 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: hasError ? [-6, 6, -4, 4, 0] : 0
        }}
        transition={{ duration: 0.35 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <div className="relative group">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
            <input 
              type="email"
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full bg-gray-50/50 border-2 border-gray-100 pr-12 pl-4 py-4 rounded-2xl outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 transition-all font-bold text-gray-900 group-hover:border-gray-200"
              required
            />
          </div>
        </div>

        {mode !== 'reset' && (
          <div className="space-y-2">
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full bg-gray-50/50 border-2 border-gray-100 pr-12 pl-12 py-4 rounded-2xl outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 transition-all font-bold text-gray-900 group-hover:border-gray-200"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {mode === 'signup' && strength && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`text-[10px] font-black mr-2 ${strength.color}`}
              >
                قوة كلمة المرور: {strength.label}
              </motion.p>
            )}
          </div>
        )}

        <button 
          type="submit"
          disabled={isLoading || cooldown}
          className="w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl btn-3d hover:-translate-y-0.5 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:translate-y-0 bg-brand text-white border-teal-800 shadow-brand/20 hover:shadow-brand/30"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm">
                {mode === 'login' ? 'تتحقق من البيانات...' : mode === 'signup' ? 'نجهز ملفك الشخصي...' : 'نرسل الرابط...'}
              </span>
            </div>
          ) : (
            <>
              <span>{mode === 'login' ? 'تسجيل الدخول' : mode === 'signup' ? 'إنشاء حساب جديد' : 'استعادة كلمة المرور'}</span>
              <ArrowRight size={20} className="order-first rotate-180" />
            </>
          )}
        </button>
      </motion.form>

      <div className="flex flex-col items-center gap-4 mt-6">
        {mode === 'login' && (
          <button 
            type="button"
            onClick={() => setMode('reset')}
            className="text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
          >
            هل نسيت كلمة المرور؟
          </button>
        )}
        
        {mode !== 'signup' && (
          <button 
            type="button"
            onClick={() => setMode('signup')}
            className="text-brand font-black text-sm hover:underline"
          >
            ليس لديك حساب؟ إنشاء حساب جديد
          </button>
        )}

        {mode !== 'login' && (
          <button 
            type="button"
            onClick={() => setMode('login')}
            className="text-gray-500 font-black text-sm hover:underline"
          >
            العودة لتسجيل الدخول
          </button>
        )}
      </div>
    </motion.div>
  );
};
