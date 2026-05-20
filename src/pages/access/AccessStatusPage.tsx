import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { Loader2, ShieldCheck, AlertCircle, LogOut, ArrowRight, CreditCard } from 'lucide-react';

interface AccessStatusPageProps {
  type: 'pending' | 'rejected' | 'expired' | 'no-payment';
  name?: string;
  notes?: string;
}

const AccessStatusPage: React.FC<AccessStatusPageProps> = ({ type, name, notes }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/auth');
  };

  const config = {
    'pending': {
      title: 'طلبك قيد المراجعة والتدقيق ⏳',
      description: `يا ${name || 'بطل'}، نراجع مستند التحويل الخاص بك حالياً وسنقوم بتفعيل الحساب خلال دقائق قليلة. تفضل بالانتظار ريثما تبدأ الصلاة والمنافسة!`,
      icon: <Loader2 className="animate-spin text-brand" size={48} />,
      color: 'bg-brand/10 text-brand border-brand/20',
      action: { label: 'الرجوع للرئيسية', onClick: () => navigate('/') }
    },
    'rejected': {
      title: 'نعتذر، لم يتم تأكيد المعاملة ❌',
      description: `للأسف توجد مشكلة في مستند الإثبات الذي أرسلته. يرجى مراجعة ملاحظات المشرف أدناه وإعادة الإرفاق بطريقة صحيحة.`,
      icon: <AlertCircle size={48} className="text-red-500" />,
      color: 'bg-red-500/10 text-red-500 border-red-500/20',
      action: { label: 'إعادة إرفاق إيصال الدفع والمحاولة', onClick: () => navigate('/payment') }
    },
    'expired': {
      title: 'انتهت فترة الاشتراك الحالية 🔒',
      description: `يا ${name || 'بطل'}، تم تصفير العدادات وبدء دفعة تحدي جديدة بـ 5 أيام مشتعلة. يتوجب تفعيل الاشتراك للدورة الجديدة للدخول لوحة التحكم والصدارة!`,
      icon: <ShieldCheck size={48} className="text-brand" />,
      color: 'bg-brand/10 text-brand border-brand/20',
      action: { label: 'تفعيل اشتراك الدورة الجديدة', onClick: () => navigate('/payment') }
    },
    'no-payment': {
      title: 'باقي خطوة وتدخل السباق! 💳',
      description: `مرحباً بك يا ${name || 'بطل'}. لبدء تتبع الصلاة على النبي ﷺ والظهور في جدول الصدارة والمنافسة على مكافآت الدورة، يرجى تفعيل اشتراكك أولاً.`,
      icon: <CreditCard size={48} className="text-brand" />,
      color: 'bg-brand/10 text-brand border-brand/20',
      action: { label: 'تفعيل مالي للاشتراك (99 جنيه)', onClick: () => navigate('/payment') }
    }
  };

  const current = config[type];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-luxblack text-gray-200 text-center" dir="rtl">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-24 h-24 ${current.color} border rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl`}
      >
        {current.icon}
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-black text-white font-serif mb-4"
      >
        {current.title}
      </motion.h1>

      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-base text-gray-400 mb-8 max-w-md leading-relaxed"
      >
        {current.description}
      </motion.p>

      {notes && type === 'rejected' && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 mb-8 w-full max-w-sm text-right"
        >
          <p className="text-[10px] font-black text-red-400 uppercase mb-2 tracking-widest font-sans text-left">ملاحظات الإدارة والرفض</p>
          <p className="text-gray-200 font-bold text-sm leading-relaxed">{notes}</p>
        </motion.div>
      )}

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-4 w-full max-w-xs animate-in"
      >
        <button 
          onClick={current.action.onClick}
          className="w-full bg-gradient-to-r from-brand to-brand-dark hover:from-brand-light hover:to-brand text-luxblack px-8 py-5 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {current.action.label}
          <ArrowRight size={20} />
        </button>
        
        <button 
          onClick={handleLogout}
          className="text-gray-500 font-bold hover:text-red-400 transition-colors py-2 flex items-center justify-center gap-2 text-sm"
        >
          <LogOut size={18} />
          تسجيل خروج الحساب
        </button>
      </motion.div>
    </div>
  );
};

export default AccessStatusPage;
