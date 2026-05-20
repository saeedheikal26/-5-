import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  ArrowLeft, 
  Info,
  Smartphone,
  Wallet
} from 'lucide-react';

const PaymentPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'vodafone'>('instapay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!receiptImage) {
      toast.error('يرجى رفع صورة إيصال التحويل');
      return;
    }

    if (profile?.paymentStatus === 'pending') {
      toast.error('لديك طلب اشتراك بالفعل قيد المراجعة');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('جاري إرسال طلب التفعيل...');

    try {
      if (!profile?.id) throw new Error('مستخدم غير معروف');

      // 1. Update user document
      await updateDoc(doc(db, 'users', profile.id), {
        receiptImage: receiptImage,
        paymentStatus: 'pending',
        status: 'pending',
        updatedAt: serverTimestamp(),
      });

      // 2. Create payment document for admin
      await addDoc(collection(db, 'payments'), {
        userId: profile.id,
        userName: profile.name,
        userEmail: profile.email || '',
        amount: 99,
        paymentMethod: paymentMethod,
        receiptImage: receiptImage,
        transactionId: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      toast.success('تم إرسال طلب التفعيل بنجاح! سيتم مراجعه طلبك وتفعيله قريباً 🎉', { id: toastId });
      
      setTimeout(() => {
        navigate('/payment-pending', { replace: true });
      }, 1500);
      
    } catch (error: any) {
      console.error('Payment Error:', error);
      toast.error(error.message || 'حدث خطأ أثناء إرسال الطلب', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxblack p-6 sm:p-12 text-gray-200" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 font-bold hover:text-brand transition-colors"
        >
          <ArrowLeft size={20} />
          الرجوع للرئيسية
        </button>

        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-brand/10 text-brand rounded-3xl mx-auto flex items-center justify-center border border-brand/30 shadow-[0_0_30px_rgba(197,168,90,0.15)]"
          >
            <CreditCard size={40} />
          </motion.div>
          <h1 className="text-4xl font-black text-white font-serif">تفعيل الاشتراك 🚀</h1>
          <p className="text-gray-400 font-bold text-lg">باقي خطوة واحدة لتأكيد دخولك التحدي والمنافسة على الجوائز الماليّة العالية!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => setPaymentMethod('instapay')}
            className={`p-8 rounded-[2.5rem] border-2 transition-all text-right group ${paymentMethod === 'instapay' ? 'border-brand bg-luxgray shadow-[0_4px_30px_rgba(197,168,90,0.1)]' : 'border-[#222222] bg-luxblack opacity-60'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${paymentMethod === 'instapay' ? 'bg-brand text-luxblack shadow-lg' : 'bg-luxgray text-gray-400 border border-[#333]'}`}>
              <Smartphone size={32} />
            </div>
            <h3 className="text-xl font-black text-white font-serif mb-2">InstaPay</h3>
            <p className="text-gray-400 text-sm font-bold">التحويل عبر تطبيق إنستا باي</p>
          </button>

          <button 
            onClick={() => setPaymentMethod('vodafone')}
            className={`p-8 rounded-[2.5rem] border-2 transition-all text-right group ${paymentMethod === 'vodafone' ? 'border-brand bg-luxgray shadow-[0_4px_30px_rgba(197,168,90,0.1)]' : 'border-[#222222] bg-luxblack opacity-60'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${paymentMethod === 'vodafone' ? 'bg-brand text-luxblack shadow-lg' : 'bg-luxgray text-gray-400 border border-[#333]'}`}>
              <Wallet size={32} />
            </div>
            <h3 className="text-xl font-black text-white font-serif mb-2">فودافون كاش</h3>
            <p className="text-gray-400 text-sm font-bold">أو أي محفظة إلكترونية أخرى</p>
          </button>
        </div>

        <div className="bg-luxgray p-10 rounded-[3.5rem] border border-brand/20 shadow-xl space-y-8">
          <div className="space-y-6">
             <div className="flex items-center gap-4 p-6 bg-brand/5 rounded-3xl border border-brand/20">
                <div className="w-12 h-12 bg-luxblack border border-brand/20 rounded-2xl flex items-center justify-center text-brand shrink-0">
                   <Info size={24} />
                </div>
                <div>
                   <p className="text-xs font-black text-brand-light uppercase tracking-widest font-sans">معلومات وطريقة التحويل</p>
                   <p className="text-gray-200 font-bold text-sm sm:text-base mt-1">
                     حول قيمة الاشتراك <span className="text-brand font-black text-lg">99 جنيهاً مصرياً</span> للرقم:
                     <span className="block text-2xl font-black text-white font-sans tracking-widest mt-1 select-all hover:text-brand transition-colors">01004128509</span>
                   </p>
                </div>
             </div>

             <div className="space-y-4">
                 <p className="text-sm font-black text-white mr-2">ارفع صورة إيصال التحويل هنا 👇</p>
                 <div 
                   className={`relative h-64 rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center gap-4 ${receiptImage ? 'border-brand/60 bg-brand/5' : 'border-[#333] bg-luxblack hover:bg-luxgray hover:border-brand/40'}`}
                   onDragOver={(e) => e.preventDefault()}
                   onDrop={(e) => {
                     e.preventDefault();
                     const file = e.dataTransfer.files[0];
                     if (file) {
                       const reader = new FileReader();
                       reader.onloadend = () => setReceiptImage(reader.result as string);
                       reader.readAsDataURL(file);
                     }
                   }}
                 >
                   <input 
                     type="file" 
                     accept="image/*" 
                     onChange={handleImageChange}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                   />
                   {receiptImage ? (
                     <>
                       <img src={receiptImage} alt="Receipt" className="h-44 rounded-xl shadow-lg border border-brand/20 object-contain" />
                       <p className="text-brand font-black text-xs flex items-center gap-2">
                         <CheckCircle2 size={16} />
                         تم اختيار المستند بنجاح
                       </p>
                     </>
                   ) : (
                     <>
                       <div className="w-16 h-16 bg-luxgray border border-[#333] rounded-2xl flex items-center justify-center text-brand shadow-sm">
                         <Upload size={32} />
                       </div>
                       <div className="text-center">
                         <p className="text-gray-300 font-black text-sm">اسحب صورة الإيصال هنا أو اضغط للاختيار</p>
                         <p className="text-gray-500 text-xs font-bold mt-1">مدعوم JPG, PNG (حد أقصى 2MB)</p>
                       </div>
                     </>
                   )}
                 </div>
             </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !receiptImage}
            className="w-full bg-gradient-to-r from-brand to-brand-dark hover:from-brand-light hover:to-brand text-luxblack py-6 rounded-[2rem] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
          >
            {isSubmitting ? 'جاري إرسال الإيصال وتأكيد طلبك...' : 'تأكيد عملية الدفع وإرسال الإيصال المالي'}
            <CheckCircle2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
