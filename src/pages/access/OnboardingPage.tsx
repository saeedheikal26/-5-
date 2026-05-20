import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { 
  User as UserIcon, 
  Phone, 
  Wallet, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [paymentHandle, setPaymentHandle] = useState(profile?.paymentHandle || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!name || !phone || !paymentHandle) {
      toast.error('يرجى إكمال جميع البيانات المطلوبة');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('جاري حفظ البيانات...');

    try {
      if (!profile?.id) throw new Error('مستخدم غير معروف');

      await updateDoc(doc(db, 'users', profile.id), {
        name,
        phone,
        paymentHandle,
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      });

      toast.success('تم حفظ بياناتك بنجاح! ننتقل للخطوة التالية.', { id: toastId });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Onboarding Error:', error);
      toast.error(error.message || 'حدث خطأ أثناء حفظ البيانات', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: 'بيانات الهوية 👤',
      icon: <UserIcon size={32} />,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 block text-right font-sans">الاسم بالكامل (الحقيقي)</label>
            <div className="relative">
               <input 
                 type="text"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full bg-luxblack border border-[#333] focus:border-brand rounded-2xl px-6 py-4 outline-none font-bold text-white transition-all text-right pr-12"
                 placeholder="اكتب اسمك الحقيقي للتسجيل بجدول الصدارة"
               />
               <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 block text-right font-sans">رقم الواتساب</label>
            <div className="relative">
               <input 
                 type="tel"
                 dir="ltr"
                 value={phone}
                 onChange={(e) => setPhone(e.target.value)}
                 className="w-full bg-luxblack border border-[#333] focus:border-brand rounded-2xl px-6 py-4 outline-none font-bold text-white transition-all text-right pr-12 font-sans"
                 placeholder="01xxxxxxxxx"
               />
               <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            </div>
            <p className="text-[10px] text-gray-500 font-bold mr-2">نستخدمه للتواصل المباشر وتسليم كشوف الجوائز الأسبوعية</p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'تحويل الجوائز 💰',
      icon: <Wallet size={32} />,
      content: (
        <div className="space-y-6">
           <div className="bg-brand/5 p-6 rounded-3xl border border-brand/20 flex items-start gap-4">
              <div className="w-10 h-10 bg-luxblack border border-brand/20 rounded-xl flex items-center justify-center text-brand shrink-0">
                 <ShieldCheck size={20} />
              </div>
              <p className="text-gray-300 text-sm font-bold leading-relaxed">
                 لضمان تسليم الجوائز المالية الفورية (1000ج، 600ج، 400ج) بسرعة ودقة، يرجى كتابة عنوان InstaPay أو رقم المحفظة هنا.
              </p>
           </div>
           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 block text-right font-sans">محفظة كاش أو InstaPay Handle</label>
             <div className="relative">
               <input 
                 type="text"
                 value={paymentHandle}
                 onChange={(e) => setPaymentHandle(e.target.value)}
                 className="w-full bg-luxblack border border-[#333] focus:border-brand rounded-2xl px-6 py-4 outline-none font-bold text-white transition-all text-right pr-12 font-sans"
                 placeholder="مثلاً: 010xxxxxxxx أو name@instapay"
               />
               <Wallet className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps.find(s => s.id === step);

  return (
    <div className="min-h-screen bg-luxblack text-gray-200 flex items-center justify-center p-6" dir="rtl">
       <div className="max-w-md w-full space-y-10">
          <div className="text-center space-y-2">
             <div className="flex justify-center gap-2 mb-6">
                {[1, 2].map(s => (
                  <div key={s} className={`h-2 rounded-full transition-all duration-500 ${step >= s ? 'w-12 bg-brand' : 'w-4 bg-[#222222]'}`} />
                ))}
             </div>
             <h1 className="text-3xl font-black text-white font-serif">تعرّفنا عليك؟ ✨</h1>
             <p className="text-gray-400 font-bold">بضع خطوات بسيطة للدخول كمتنافس رسمي في التحدي</p>
          </div>

          <motion.div 
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-luxgray p-8 rounded-[3.5rem] border border-brand/20 shadow-2xl space-y-8"
          >
             <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-brand/5 border border-brand/20 text-brand rounded-3xl flex items-center justify-center shadow-inner">
                   {currentStep?.icon}
                </div>
                <h2 className="text-xl font-black text-white font-serif">{currentStep?.title}</h2>
             </div>

             {currentStep?.content}

             <button 
               onClick={step === 2 ? handleComplete : () => setStep(2)}
               disabled={isSubmitting}
               className="w-full bg-gradient-to-r from-brand to-brand-dark hover:from-brand-light hover:to-brand text-luxblack py-5 rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
             >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    جاري الحفظ والتهيئة...
                  </>
                ) : step === 2 ? (
                  <>
                    إكمال التسجيل والدخول
                    <CheckCircle2 size={24} />
                  </>
                ) : (
                  <>
                    الخطوة التالية
                    <ArrowRight size={24} />
                  </>
                )}
             </button>
          </motion.div>

          <p className="text-center text-gray-500 font-bold text-xs">بيانات التحويل المالية الخاصة بك مشفرة بالكامل وتظهر للمشرف فقط بشكل آمن.</p>
       </div>
    </div>
  );
};

export default OnboardingPage;
