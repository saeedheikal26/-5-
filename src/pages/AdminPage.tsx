import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, query, getDocs, doc, 
  onSnapshot, orderBy, limit, serverTimestamp, addDoc, 
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { User } from '../types';
import { 
  Users, Search, 
  Filter, ChevronLeft, Camera,
  AlertCircle, RefreshCw,
  Trophy, Megaphone, Edit2, ShieldCheck, History as HistoryIcon, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface AdminLog {
  id: string;
  adminName: string;
  action: string;
  targetUserName: string;
  details: string;
  timestamp: any;
}

interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  receiptImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export default function AdminPage() {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'logs' | 'settings'>('submissions');
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [editSalawatAmount, setEditSalawatAmount] = useState('');
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '' });
  const [isPerformingQuickAction, setIsPerformingQuickAction] = useState(false);

  // Helper date parsing
  const parseDate = useCallback((val: any) => {
    if (!val) return null;
    try {
      if (typeof val.toDate === 'function') return val.toDate();
      if (val.seconds !== undefined) return new Date(val.seconds * 1000);
      return new Date(val);
    } catch (e) {
      return null;
    }
  }, []);

  const logAdminAction = async (action: string, targetUserId: string, targetUserName: string, details: string) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'adminLogs'), {
        adminId: auth.currentUser.uid,
        adminName: auth.currentUser.displayName || auth.currentUser.email || 'Admin',
        action,
        targetUserId,
        targetUserName,
        details,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error('Log admin action error:', e);
    }
  };

  // Listen to Payments
  useEffect(() => {
    if (!auth.currentUser || activeTab !== 'submissions') return;
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRequest)));
    }, (error) => {
      console.warn("Payment listener error:", error);
    });
    return () => unsub();
  }, [activeTab]);

  // Listen to Admin Logs
  useEffect(() => {
    if (!auth.currentUser || activeTab !== 'logs') return;
    const q = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setAdminLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminLog)));
    }, (error) => {
      console.warn("Logs listener error:", error);
    });
    return () => unsub();
  }, [activeTab]);

  // Main users list hook
  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);
    const q = query(collection(db, 'users'), orderBy('salawatCount', 'desc'), limit(300));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((docSnap) => {
        usersData.push({ id: docSnap.id, ...docSnap.data() } as User);
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Users listener error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Update payment & subscription status (Approve / Reject)
  const handleStatusChange = async (targetUser: User, newStatus: 'active' | 'rejected', notes: string = '', paymentId?: string) => {
    if (!targetUser.id) return;
    const toastId = toast.loading('جاري تحديث حالة الاشتراك...');
    setIsProcessing(paymentId || targetUser.id);

    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', targetUser.id);
      
      const userUpdates: any = {
        status: newStatus,
        paymentStatus: newStatus === 'active' ? 'approved' : 'rejected',
        subscriptionActive: newStatus === 'active',
        isPaid: newStatus === 'active',
        updatedAt: serverTimestamp(),
      };

      if (newStatus === 'active') {
        userUpdates.salawatCount = targetUser.salawatCount || 0;
      } else {
        userUpdates.salawatCount = 0;
      }

      batch.update(userRef, userUpdates);

      // Upgrade payment doc
      if (paymentId) {
        const paymentRef = doc(db, 'payments', paymentId);
        batch.update(paymentRef, {
          status: newStatus === 'active' ? 'approved' : 'rejected',
          adminNotes: notes,
          reviewedAt: serverTimestamp(),
          reviewedBy: auth.currentUser?.email || 'Admin'
        });
      }

      await batch.commit();
      await logAdminAction(
        newStatus === 'active' ? 'قبول اشتراك وتفعيل' : 'رفض طلب اشتراك',
        targetUser.id,
        targetUser.name,
        `تفاصيل: ${notes}`
      );

      toast.success(newStatus === 'active' ? 'تم تنشيط العضوية والاشتراك بنجاح! 🚀' : 'تم الرفض بنجاح.', { id: toastId });
    } catch (err: any) {
      toast.error('حدثت مشكلة أثناء المعالجة: ' + err.message, { id: toastId });
    } finally {
      setIsProcessing(null);
    }
  };

  // Modify manual Salawat Override
  const handleModifySalawat = async (targetUser: User, targetCount: number) => {
    if (!targetUser.id) return;
    try {
      const userRef = doc(db, 'users', targetUser.id);
      const updates = {
        salawatCount: targetCount,
        updatedAt: serverTimestamp()
      };
      const batch = writeBatch(db);
      batch.update(userRef, updates);
      await batch.commit();

      await logAdminAction(
        'تعديل رصيد صلوات يدوي',
        targetUser.id,
        targetUser.name,
        `الجدير بالذكر تعديل الرصيد إلى ${targetCount}`
      );

      toast.success('تم فرز وتحديث عداد الصلوات بنجاح! ⭐');
      setSelectedUserForEdit(null);
    } catch (e: any) {
      toast.error('حدث خطأ أثناء تعديل العداد');
    }
  };

  // Global broadcast notification to active users
  const handleSendBroadcast = async () => {
    if (!broadcastData.title || !broadcastData.message) {
      toast.error('يرجى كتابة رسالة كاملة');
      return;
    }
    setIsPerformingQuickAction(true);
    const toastId = toast.loading('جاري إرسال الإشعار...');

    try {
      const batch = writeBatch(db);
      users.forEach((u) => {
        if (u.id) {
          const notifRef = doc(collection(db, 'notifications'));
          batch.set(notifRef, {
            userId: u.id,
            title: broadcastData.title,
            message: broadcastData.message,
            read: false,
            createdAt: serverTimestamp()
          });
        }
      });
      await batch.commit();
      toast.success('تم التوزيع بنجاح!', { id: toastId });
      setIsBroadcastModalOpen(false);
      setBroadcastData({ title: '', message: '' });
    } catch (e) {
      toast.error('فشل معالجة التوزيع الجماعي', { id: toastId });
    } finally {
      setIsPerformingQuickAction(false);
    }
  };

  // Cycle reset - Set Salawat count to 0, subscription state resets
  const handleWipeCycleReset = async () => {
    if (isPerformingQuickAction) return;
    setIsPerformingQuickAction(true);
    const toastId = toast.loading('جاري تصفير الدورة وأرشفة المتصدرين...');

    try {
      // Archive season top-3 results 
      const podium = users.slice(0, 3).map((u, i) => ({
        id: u.id,
        name: u.name,
        count: u.salawatCount,
        rank: i + 1,
        phone: u.phone
      }));

      await addDoc(collection(db, 'archivedCycles'), {
        podium,
        timestamp: serverTimestamp()
      });

      // Reset users in chunks
      const userRefs = users.map(u => doc(db, 'users', u.id!));
      const batchSize = 400;
      for (let i = 0; i < userRefs.length; i += batchSize) {
        const batch = writeBatch(db);
        users.slice(i, i + batchSize).forEach((u) => {
          if (u.id) {
            batch.update(doc(db, 'users', u.id), {
              salawatCount: 0,
              status: 'expired',
              paymentStatus: 'none',
              subscriptionActive: false,
              updatedAt: serverTimestamp()
            });
          }
        });
        await batch.commit();
      }

      // Delete payments
      const paymentSnap = await getDocs(collection(db, 'payments'));
      for (let i = 0; i < paymentSnap.size; i += batchSize) {
        const batch = writeBatch(db);
        paymentSnap.docs.slice(i, i + batchSize).forEach((d) => {
          batch.delete(d.ref);
        });
        await batch.commit();
      }

      toast.success('تم تصفير الدورة بنجاح والعودة لحجم الصفر!', { id: toastId });
      setIsResetConfirmOpen(false);
    } catch (err: any) {
      toast.error('فشل التصفير: ' + err.message, { id: toastId });
    } finally {
      setIsPerformingQuickAction(false);
    }
  };

  // Native robust CSV export
  const handleExportCSV = () => {
    try {
      let csv = '\uFEFFالاسم,رقم الهاتف,البريد الإلكتروني,عدد الصلوات,حالة المعاملة,تاريخ الاشتراك\n';
      users.forEach(u => {
        csv += `"${u.name || ''}","${u.phone || ''}","${u.email || ''}",${u.salawatCount || 0},"${u.status || ''}","${u.createdAt ? parseDate(u.createdAt)?.toLocaleDateString('ar-EG') : ''}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `5days_salawat_users_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('تم تصدير كشف المتنافسين بنجاح 🟢');
    } catch (e) {
      toast.error('فشل التصدير للـ CSV');
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;
    return users.filter(u => 
      u.name?.toLowerCase().includes(term) || 
      u.phone?.includes(term)
    );
  }, [users, searchTerm]);

  const pendingPayments = useMemo(() => {
    return payments.filter(p => p.status === 'pending');
  }, [payments]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const pending = pendingPayments.length;
    const totalSalawat = users.reduce((sum, u) => sum + (u.salawatCount || 0), 0);
    return { total, active, pending, totalSalawat };
  }, [users, pendingPayments]);

  return (
    <div id="admin-root" className="min-h-screen bg-stone-50 text-slate-800 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 pb-36" dir="rtl">
      
      {/* Header Panel */}
      <header className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-[#059669] shrink-0">
            <ShieldCheck size={32} fill="currentColor" className="opacity-80" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 font-serif">الإدارة والتدقيق 🛡️</h1>
            <p className="text-xs text-[#059669] font-black font-sans">تحدي الـ 5 أيام للصلاة على النبي ﷺ</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="px-5 py-3 bg-white border border-emerald-100 hover:border-[#059669]/50 hover:bg-emerald-50 text-[#059669] font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs relative z-10"
        >
          <ChevronLeft size={16} />
          الذهاب للوحة المستخدمين
        </button>
      </header>

      {/* Dynamic Bento Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'إجمالي المشتركين', 
            val: stats.total, 
            desc: `${stats.active} مشترك نشط حالياً`,
            icon: <Users size={20} className="text-[#059669]" />,
            bg: 'bg-emerald-50/40 border-emerald-100/50 text-emerald-900'
          },
          { 
            label: 'طلبات مراجعة معلقة', 
            val: stats.pending, 
            desc: stats.pending > 0 ? 'يرجى مراجعة إيصالات التحويل' : 'كل الطلبات مدققة بالكامل',
            icon: <Wallet size={20} className={stats.pending > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'} />,
            bg: stats.pending > 0 ? 'bg-amber-50/50 border-amber-200 text-amber-950 shadow-xs' : 'bg-white border-slate-100 text-slate-800'
          },
          { 
            label: 'صلوات الدورة الحالية', 
            val: stats.totalSalawat.toLocaleString('ar-EG'), 
            desc: 'مجموع ما سجله المتنافسون ﷺ',
            icon: <Trophy size={20} className="text-amber-500" />,
            bg: 'bg-amber-50/20 border-amber-100 text-slate-800'
          },
          { 
            label: 'نسبة التنشيط المستمر', 
            val: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%`, 
            desc: 'نسبة التفعيل في هذا الأسبوع',
            icon: <ShieldCheck size={20} className="text-[#059669]" />,
            bg: 'bg-white border-slate-100 text-slate-800'
          }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-5 rounded-[2rem] border flex flex-col justify-between space-y-3 ${stat.bg}`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10.5px] font-black opacity-80">{stat.label}</span>
              <span className="p-2 bg-white/90 rounded-xl border border-slate-100/60 shadow-xxs">{stat.icon}</span>
            </div>
            <div>
              <div className="text-2xl font-black font-sans leading-none tracking-tight">{stat.val}</div>
              <p className="text-[10px] font-bold opacity-60 mt-1">{stat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabbed Navigation Container with Active Highlights */}
      <div className="bg-white p-1.5 rounded-2xl border border-emerald-100/80 overflow-x-auto scrollbar-none flex items-center justify-between gap-1 shadow-xs">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'submissions', label: 'إيصالات الاشتراك', icon: <Camera size={14} />, count: stats.pending },
            { id: 'users', label: 'إدارة المشتركين', icon: <Users size={14} />, count: stats.total },
            { id: 'logs', label: 'سجل الأحداث', icon: <HistoryIcon size={14} /> },
            { id: 'settings', label: 'لوحة التحكم والمزامنة', icon: <Filter size={14} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap overflow-hidden cursor-pointer ${isActive ? 'text-white' : 'text-slate-500 hover:text-[#059669] hover:bg-emerald-50/50'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminTabHighlight"
                    className="absolute inset-0 bg-[#059669] rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-sans font-black rounded-lg ${isActive ? 'bg-white text-[#059669]' : 'bg-rose-50 border border-rose-100 text-rose-600'}`}>
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick action: export CSV */}
        <div className="hidden sm:block">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-50 border border-emerald-100 hover:border-[#059669]/50 text-[#059669] rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 font-sans"
          >
            <span>تصدير البيانات</span>
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Section contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'submissions' && (
          <motion.div 
            key="submissions" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <h2 className="text-lg sm:text-xl font-black text-emerald-950 font-serif flex items-center gap-2">
              <Camera size={20} className="text-[#059669]" />
              مراجعة الطلبات والتحويل المالي المعلق
            </h2>

            <div className="space-y-4">
              {pendingPayments.length === 0 ? (
                <div className="text-center py-20 bg-white p-8 rounded-[2.5rem] border border-emerald-100/80 shadow-xxs">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-[#059669] mb-4">
                    <ShieldCheck size={32} />
                  </div>
                  <p className="text-slate-400 font-bold italic text-sm">
                    لا توجد طلبات إثباتات معلقة للمعالجة في الوقت الراهن 😊
                  </p>
                </div>
              ) : (
                pendingPayments.map((p) => {
                  const correlatedUser = users.find(u => u.id === p.userId);
                  return (
                     <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs max-w-full">
                      <div className="flex items-center gap-5 w-full">
                        <div 
                          className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center cursor-zoom-in group shrink-0 relative"
                          onClick={() => p.receiptImage && setSelectedImage(p.receiptImage)}
                        >
                          {p.receiptImage ? (
                            <img src={p.receiptImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <Wallet size={32} className="text-[#059669]/40" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="text-[10px] text-white font-extrabold opacity-0 group-hover:opacity-100 transition-opacity">تكبير 🔍</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-black text-emerald-950">{p.userName}</h4>
                            <span className="bg-emerald-50 border border-emerald-100 text-[#059669] px-3 py-0.5 rounded-lg text-[10px] font-black">{p.amount} EGP</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1 font-sans">الرقم المرجعي: {p.transactionId}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-black text-[#059669]">
                            <span>محفظة / {p.paymentMethod === 'instapay' ? 'InstaPay' : 'كاش'}</span>
                            <span>•</span>
                            <span className="font-sans text-slate-400 font-medium">{p.createdAt ? parseDate(p.createdAt)?.toLocaleString('ar-EG') : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5 w-full md:w-56 shrink-0">
                        <button
                          disabled={isProcessing === p.id}
                          onClick={() => handleStatusChange(correlatedUser || { id: p.userId, name: p.userName } as User, 'active', '', p.id)}
                          className="w-full py-3.5 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          تأكيد المعاملة وتفعيل الدخول
                        </button>
                        <button
                          disabled={isProcessing === p.id}
                          onClick={() => {
                            const reason = prompt('سبب الرفض:', 'رقم معاملة خاطئ أو مستند غير ظاهر');
                            if (reason !== null) {
                              handleStatusChange(correlatedUser || { id: p.userId, name: p.userName } as User, 'rejected', reason, p.id);
                            }
                          }}
                          className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          رفض الإيصال
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            key="users" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <h2 className="text-xl font-black text-emerald-950 font-serif">كشف المتنافسين وإدارة العدادات</h2>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white text-slate-800 text-xs border border-emerald-100 rounded-xl px-4 py-3 outline-none text-right pr-10 focus:border-[#059669] transition-all"
                  />
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xs overflow-hidden">
              <div className="p-4 bg-emerald-50/20 border-b border-emerald-100 grid grid-cols-4 text-xs font-black text-slate-500 text-right">
                <span>الاسم</span>
                <span>الحالة</span>
                <span>العداد الحالي</span>
                <span className="text-left font-sans">تعديل</span>
              </div>

              <div className="divide-y divide-slate-50 max-h-[450px] overflow-y-auto scrollbar-none">
                {filteredUsers.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 font-bold italic">لا توجد سجلات مطابقة.</p>
                ) : (
                  filteredUsers.map((u) => (
                    <div key={u.id} className="p-4 grid grid-cols-4 items-center text-xs font-semibold hover:bg-slate-50 transition-colors">
                      <span className="font-extrabold text-slate-800 max-w-full truncate">{u.name}</span>
                      <span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${u.status === 'active' ? 'bg-emerald-50 text-[#059669] border border-emerald-100/60' : u.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                          {u.status === 'active' ? 'نشط' : u.status === 'pending' ? 'مراجعة' : 'غير مفعل'}
                        </span>
                      </span>
                      <span className="font-sans text-[#059669] font-black">{u.salawatCount?.toLocaleString('en-US') || 0}</span>
                      <div className="text-left font-sans">
                        <button
                          onClick={() => {
                            setSelectedUserForEdit(u);
                            setEditSalawatAmount(String(u.salawatCount || 0));
                          }}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-[#059669] hover:bg-emerald-50 hover:border-emerald-100 transition-all cursor-pointer font-bold inline-flex items-center gap-1 text-[11px]"
                        >
                          <Edit2 size={11} />
                          <span>تعديل</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div 
            key="logs" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-black text-emerald-950 font-serif">سجل إجراءات الإشراف</h2>
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {adminLogs.length === 0 ? (
                <p className="text-center py-12 text-slate-400 font-bold italic">لا توجد عمليات مسجلة حتى الآن.</p>
              ) : (
                adminLogs.map(l => (
                  <div key={l.id} className="py-4 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-slate-600">{l.adminName} ➔ {l.action}</span>
                      <span className="font-sans font-medium text-slate-400">{l.timestamp ? parseDate(l.timestamp)?.toLocaleString('ar-EG') : ''}</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-semibold">المستهدف: <span className="text-[#059669]">{l.targetUserName}</span> | تفاصيل: {l.details}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            key="settings" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-black text-emerald-950 font-serif">العمليات السريعة للنظام</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Reset card */}
              <div className="bg-white p-8 rounded-3xl border border-emerald-100 hover:border-red-200 transition-all space-y-4 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mb-3">
                    <RefreshCw size={18} />
                  </span>
                  <h4 className="font-black text-lg text-emerald-950 font-serif">دورة تصفير جديدة ⚠️</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    تحذير: سيقوم هذا الخيار بتصفير كافة عدادات الصلوات للمشتركين وأرشفة المتصدرين وإعادة كافة الحسابات لوضع الـ Expired لطلب اشتراك الدورة الجديدة.
                  </p>
                </div>
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-xs transition-colors cursor-pointer w-full mt-4"
                >
                  بدء التصفير الكلي للدورة
                </button>
              </div>

              {/* Broadcast card */}
              <div className="bg-white p-8 rounded-3xl border border-emerald-100 hover:border-[#059669]/20 transition-all space-y-4 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#059669] flex items-center justify-center mb-3">
                    <Megaphone size={18} />
                  </span>
                  <h4 className="font-black text-lg text-emerald-950 font-serif">إرسال تنبيه جماعي 📢</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    بث وتوزيع إشعار بضغطة زر يظهر فوراَ لجميع المشاركين بلوحة تحكم المتسابقين لرفع الهمم والتوجيه السريع.
                  </p>
                </div>
                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="px-6 py-3 bg-[#059669] text-white rounded-xl font-black text-xs hover:bg-[#064E3B] transition-colors cursor-pointer w-full mt-4"
                >
                  إرسال إشعار جماعي
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Count Override Modal */}
      <AnimatePresence>
        {selectedUserForEdit && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUserForEdit(null)} className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white p-8 rounded-3xl border border-emerald-100 z-50 text-center space-y-6 shadow-2xl">
              <h3 className="text-xl font-black text-emerald-950 font-serif">تعديل العداد يدوياً 👨‍💻</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                تعديل عداد الصلاة لـ <span className="text-[#059669] font-black">{selectedUserForEdit.name}</span>
              </p>
              
              <input 
                type="number"
                value={editSalawatAmount}
                onChange={(e) => setEditSalawatAmount(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-center rounded-xl p-4 border border-slate-200 font-black font-sans text-xl"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => handleModifySalawat(selectedUserForEdit, parseInt(editSalawatAmount) || 0)}
                  className="flex-1 py-3 bg-[#059669] text-white rounded-lg font-black text-xs cursor-pointer"
                >
                  حفظ التعديل
                </button>
                <button
                  onClick={() => setSelectedUserForEdit(null)}
                  className="flex-1 py-3 bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:text-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Broadcast message modal */}
      <AnimatePresence>
        {isBroadcastModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBroadcastModalOpen(false)} className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white p-8 rounded-3xl border border-emerald-100 z-50 space-y-5 shadow-2xl">
              <h3 className="text-xl font-black text-emerald-950 font-serif text-center">بث إشعار عام 📣</h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="عنوان الإشعار"
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 text-slate-800 rounded-xl p-3 border border-slate-200 font-extrabold text-xs"
                />
                <textarea
                  placeholder="نص التنبيه..."
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full h-28 bg-slate-50 text-slate-800 rounded-xl p-3 border border-slate-200 font-semibold text-xs"
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={handleSendBroadcast}
                  disabled={isPerformingQuickAction}
                  className="flex-1 py-3.5 bg-[#059669] text-white rounded-lg font-black text-xs transition-colors cursor-pointer"
                >
                  بث فوري
                </button>
                <button
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:text-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Master reset confirm modal */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsResetConfirmOpen(false)} className="fixed inset-0 bg-black/70 z-50 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white p-8 rounded-3xl border border-red-200 z-50 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-red-950 font-serif">تأكيد عملية التصفير الكلية الحساسة! 💣</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                هل أنت متأكد بنسبة 100% من تصفير عداد كافة المستخدمين وإنهاء الدورة الحالية؟ هذا الإجراء فوري ويعيد كافة المتسابقين لطلب إثبات الرسوم مجدداً للدورة الجديدة.
              </p>

              <div className="flex gap-3">
                <button
                  disabled={isPerformingQuickAction}
                  onClick={handleWipeCycleReset}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg font-black text-xs hover:bg-red-600 transition-colors cursor-pointer"
                >
                  نعم، صفّر وصفر فوراً
                </button>
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 py-3 bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:text-slate-800 cursor-pointer"
                >
                  إلغاء وتراجع
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image zoom lightbox overlay */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-xs" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="fixed inset-0 flex items-center justify-center p-6 z-50 pointer-events-none">
              <img src={selectedImage} className="max-w-full max-h-[85vh] rounded-2xl pointer-events-auto border-2 border-[#059669] object-contain shadow-2xl" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
    </div>
  );
}
