import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Home, User, Bell, ShieldCheck, HelpCircle, 
  ChevronRight, RefreshCw, LogOut, ChevronDown, CheckCircle2,
  AlertCircle, Sparkles, Send, Flame, Zap, Plus, Hash, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { Tab, PRIZES } from '../types';
import { toast } from 'sonner';
import { auth } from '../lib/firebase';
import { BottomNav } from '../components/dashboard/BottomNav';

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { 
    leaderboard, activities, notifications, isLoading, 
    error, incrementSalawat 
  } = useDashboardData(profile);

  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [customIncrement, setCustomIncrement] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  // Timer state for Challenge Schedule
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, heading: '' });

  // Calculate challenge schedule and countdown dynamically
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
      
      let target = new Date();
      target.setHours(23, 59, 59, 999);

      if (currentDay >= 1 && currentDay <= 3) {
        // active challenge cycle (Starts Saturday 00:00, ends Wednesday 23:59:59)
        const daysToWednesday = 3 - currentDay;
        target.setDate(now.getDate() + daysToWednesday);
        setTimeLeft(getDiff(target, now, "متبقي على نهاية التحدي"));
      } else if (currentDay === 4 || currentDay === 5) {
        // Thursday & Friday rest/registration period
        const daysToSaturday = 6 - currentDay;
        target.setDate(now.getDate() + daysToSaturday);
        target.setHours(0, 0, 0, 0);
        setTimeLeft(getDiff(target, now, "يبدأ التحدي القادم في"));
      } else {
        // Saturday & Sunday active cycle
        const fixDays = currentDay === 0 ? 3 : 4; 
        target.setDate(now.getDate() + fixDays);
        setTimeLeft(getDiff(target, now, "متبقي على نهاية التحدي"));
      }
    };

    const getDiff = (target: Date, now: Date, heading: string) => {
      const difference = target.getTime() - now.getTime();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, heading };
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      return { days, hours, minutes, seconds, heading };
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time stats calculations
  const myStats = useMemo(() => {
    if (!profile) return { rank: '---', salawatCount: 0, distanceMessage: 'جار الحساب' };
    
    // Find rank in the active leaderboard
    const userIndex = leaderboard.findIndex(u => u.id === profile.id);
    const myRank = userIndex !== -1 ? userIndex + 1 : leaderboard.length + 1;
    const count = profile.salawatCount || 0;

    let distanceMessage = 'أنت في الصدارة الآن! هنيئاً لك';
    if (leaderboard.length > 0) {
      if (myRank > 1) {
        const playerAbove = leaderboard[myRank - 2];
        if (playerAbove) {
          const diff = (playerAbove.salawatCount || 0) - count;
          distanceMessage = `يفصلك ${diff.toLocaleString('en-US')} صلاة عن المركز السابِق (${playerAbove.name})`;
        }
      }
      // Calculate specifically distance to Top 10 if not in top 10
      if (myRank > 10 && leaderboard[9]) {
        const top10Player = leaderboard[9];
        const diffTo10 = (top10Player.salawatCount || 0) - count;
        distanceMessage = ` يفصلك ${diffTo10.toLocaleString('en-US')} صلاة عن المركز العاشر (#10)`;
      }
    }

    return {
      rank: myRank === leaderboard.length + 1 && leaderboard.length === 0 ? '---' : `#${myRank}`,
      salawatCount: count,
      distanceMessage
    };
  }, [profile, leaderboard]);

  // Handle manual increment tap
  const handleTapIncrement = async (val: number) => {
    if (isIncrementing) return;
    setIsIncrementing(true);
    
    try {
      await incrementSalawat(val);
      // Fresh emerald green and white confetti celebration
      if (val >= 100) {
        confetti({ 
          particleCount: val >= 500 ? 150 : 60, 
          spread: 65, 
          origin: { y: 0.85 },
          colors: ['#059669', '#10B981', '#ffffff'] 
        });
      }
      toast.success(`تم تسجيل +${val.toLocaleString('ar-EG')} صلاة جديدة بنجاح!`, {
        icon: '🌿',
        style: { background: '#FAFAF9', color: '#059669', borderColor: '#10B981' }
      });
    } catch (e) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsIncrementing(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customIncrement);
    if (isNaN(val) || val <= 0) {
      toast.error('يرجى تحديد عدد صلوات صحيح');
      return;
    }
    if (val > 10000) {
      toast.error('أقصى عدد مسموح بتسجيله دفعة واحدة يدوياً هو 10,000 صلاة');
      return;
    }
    setShowCustomModal(false);
    setCustomIncrement('');
    await handleTapIncrement(val);
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  return (
    <div id="dashboard-root" className="min-h-screen bg-luxblack text-slate-800 pb-36" dir="rtl">
      
      {/* Header */}
      <header className="bg-white border-b border-emerald-100 px-6 py-5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-[#059669]">
              <Trophy size={20} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-black font-serif text-emerald-950 tracking-tight">لوحة تحكّم التحدي 🏆</h1>
              <p className="text-[9px] text-[#059669] font-black uppercase tracking-[0.1em] mt-0.5">منصة الصلاة تفاعلية</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button 
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-[#059669] text-white rounded-xl font-black text-xs hover:bg-[#064E3B] transition-all flex items-center gap-1 shadow-xs"
              >
                المشرف 🛠️
              </button>
            )}
            
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
              }}
              className="p-3 bg-slate-50 border border-emerald-100 hover:border-emerald-200 text-[#059669] rounded-xl transition-all relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-6 pt-8 space-y-8">
        
        {/* Dynamic Countdown Header */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-xs font-black text-[#059669] uppercase tracking-widest">{timeLeft.heading}</span>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-800">{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="text-[9px] text-slate-400 font-bold">يوم</span>
            </div>
            <span className="text-[#059669] font-black">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-800">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[9px] text-slate-400 font-bold">ساعة</span>
            </div>
            <span className="text-[#059669] font-black">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-800">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[9px] text-slate-400 font-bold">دقيقة</span>
            </div>
            <span className="text-[#059669] font-black">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-[#059669]">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[9px] text-slate-400 font-bold">ثانية</span>
            </div>
          </div>
        </div>

        {/* Tab Animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div 
              key="today"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              
              {/* User Position Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-extrabold block">ترتيبك الحالي</span>
                  <span className="text-3xl font-black text-[#059669] tracking-tight mt-1 inline-block">{myStats.rank}</span>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-extrabold block">إجمالي صلواتك</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{myStats.salawatCount.toLocaleString('en-US')}</span>
                    <span className="text-[10px] text-slate-500 font-extrabold">صلاة</span>
                  </div>
                </div>
              </div>

              {/* Proximity / Distance Warning Message */}
              <div className="bg-gradient-to-r from-emerald-50 to-white p-5 rounded-3xl border border-emerald-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100/30 border border-emerald-100 rounded-2xl flex items-center justify-center text-[#059669] shrink-0">
                  <Flame size={18} className="animate-pulse" />
                </div>
                <p className="text-xs font-black text-slate-700 leading-relaxed">{myStats.distanceMessage}</p>
              </div>

              {/* Master Manual Interactive Salawat Counter */}
              <div className="bg-white p-8 rounded-[3rem] border border-emerald-100 shadow-sm flex flex-col items-center text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <h3 className="text-2xl font-black text-emerald-950 font-serif">العداد التفاعلي 🌿</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">اضغط للتسجيل الفوري لحسابك أو استخدم الزيادة السريعة</p>
                </div>

                {/* Big Emerald Circle Orb button */}
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handleTapIncrement(1)}
                  disabled={isIncrementing}
                  className="w-56 h-54 rounded-full bg-gradient-to-b from-[#059669] to-[#064E3B] flex flex-col items-center justify-center text-white shadow-xl shadow-emerald-700/15 border-4 border-emerald-200 hover:border-emerald-300 active:border-emerald-500 transition-shadow select-none cursor-pointer relative group"
                >
                  <span className="text-4xl font-black tracking-widest font-serif block drop-shadow-sm select-none">صَلّيْتُ ﷺ</span>
                  <span className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-75 font-sans select-none">+1 لعدادك</span>
                </motion.button>

                {/* Sub-counters Quick Actions Buttons */}
                <div className="grid grid-cols-4 gap-2.5 w-full">
                  {[
                    { label: '+10', val: 10 },
                    { label: '+100', val: 100 },
                    { label: '+500', val: 500 },
                    { label: 'مُخصّص ✍️', isCustom: true }
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => btn.isCustom ? setShowCustomModal(true) : handleTapIncrement(btn.val!)}
                      disabled={isIncrementing}
                      className="py-4 rounded-2xl bg-slate-50 border border-emerald-100 hover:border-brand/40 hover:bg-emerald-50 text-sm font-black text-[#059669] transition-all cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Competitive Activity Feed */}
              <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-emerald-50 pb-3">
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <Zap size={15} className="text-[#059669] animate-bounce" />
                    تفاعلات المشتركين المباشرة الآن
                  </span>
                  <span className="text-[10px] text-slate-400 font-extrabold font-sans">Live Stream</span>
                </div>
                
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto scrollbar-none pr-1">
                  {activities.length === 0 ? (
                    <div className="text-center text-slate-400 font-semibold italic text-xs py-5">
                      لا يوجد نشاط مسجل للتو. كن أول من يبدأ بالصلاة!
                    </div>
                  ) : (
                    activities.map((act) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        key={act.id} 
                        className="p-3 bg-slate-50/50 border border-emerald-50/50 rounded-xl flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-700">{act.userName}</span>
                        <span className="text-[11px] text-[#059669] font-black">{act.message}</span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div 
              key="leaderboard" 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-emerald-950 font-serif">جدول الصدارة المباشر 👑</h3>
                <p className="text-xs text-slate-500 font-bold">الفائزون الرسميون من يقتحمون المراتب الثلاث الأولى</p>
              </div>

              {/* Gold, Silver, Bronze Podiums UI */}
              <div className="grid grid-cols-3 gap-3 pt-6 items-end pb-4">
                
                {/* 2nd place */}
                <div className="bg-slate-50 p-4 rounded-t-2xl border border-emerald-100 text-center flex flex-col items-center h-40 justify-end relative shadow-sm">
                  <span className="absolute -top-4 w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center border-2 border-white">٢</span>
                  <span className="text-xs font-black truncate max-w-full text-slate-800 mb-1">{leaderboard[1]?.name || 'في الانتظار'}</span>
                  <span className="text-[10px] font-sans text-slate-500 font-bold">🥈 {leaderboard[1]?.salawatCount?.toLocaleString('en-US') || 0}</span>
                </div>

                {/* 1st place */}
                <div className="bg-emerald-50 border-t-4 border-t-[#059669] p-5 rounded-t-3xl border-x border-b border-emerald-100 text-center flex flex-col items-center h-48 justify-end relative shadow-md">
                  <span className="absolute -top-5 w-10 h-10 rounded-full bg-[#059669] text-white font-black text-md flex items-center justify-center border-4 border-white shadow-md">١</span>
                  <span className="text-sm font-black truncate max-w-full text-emerald-950 mb-2">{leaderboard[0]?.name || 'في الانتظار'}</span>
                  <span className="text-xs font-sans text-[#059669] font-black">🏆 {leaderboard[0]?.salawatCount?.toLocaleString('en-US') || 0}</span>
                </div>

                {/* 3rd place */}
                <div className="bg-slate-50 p-4 rounded-t-2xl border border-emerald-100 text-center flex flex-col items-center h-36 justify-end relative shadow-sm">
                  <span className="absolute -top-4 w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center border-2 border-white">٣</span>
                  <span className="text-xs font-black truncate max-w-full text-slate-800 mb-1">{leaderboard[2]?.name || 'في الانتظار'}</span>
                  <span className="text-[10px] font-sans text-slate-500 font-bold">🥉 {leaderboard[2]?.salawatCount?.toLocaleString('en-US') || 0}</span>
                </div>

              </div>

              {/* Main Leaderboard scrolling users list */}
              <div className="bg-white p-5 rounded-[2.5rem] border border-emerald-100 shadow-xs space-y-3">
                {leaderboard.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 font-bold italic">لا توجد اشتراكات نشطة مفعَّلة حتى الآن.</p>
                ) : (
                  leaderboard.slice(0, 50).map((u, index) => {
                    const isMe = u.id === profile?.id;
                    return (
                      <div 
                        key={u.id} 
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isMe ? 'bg-emerald-50/70 border-[#059669] shadow-xs' : 'bg-slate-50/50 border-emerald-50/50'}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${index === 0 ? 'bg-[#059669] text-white' : index === 1 ? 'bg-slate-300 text-slate-700' : index === 2 ? 'bg-amber-600 text-white' : 'bg-emerald-50 text-slate-500'}`}>
                            {index + 1}
                          </span>
                          <span className={`text-xs font-black ${isMe ? 'text-[#059669]' : 'text-slate-800'}`}>{u.name} {isMe && '⭐'}</span>
                        </div>
                        <div className="flex items-center gap-1 font-sans">
                          <span className="text-xs font-extrabold text-[#059669]">{u.salawatCount?.toLocaleString('en-US') || 0}</span>
                          <span className="text-[10px] text-slate-500 font-bold font-serif">صلاة ﷺ</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile" 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              
              {/* Account Card */}
              <div className="bg-white p-8 rounded-[3.5rem] border border-emerald-100 shadow-sm text-center space-y-5">
                <div className="w-24 h-24 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center text-[#059669] mx-auto shadow-inner relative">
                  <User size={48} />
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald border border-white rounded-full" />
                </div>
                
                <div>
                  <h4 className="text-xl font-black text-slate-800">{profile?.name}</h4>
                  <p className="text-xs text-[#059669] font-black mt-1 font-sans">{profile?.phone}</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-emerald-100/30 text-right space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">حساب تسليم الأرباح:</span>
                    <span className="text-slate-800 font-black font-sans">{profile?.paymentHandle || 'لم يحدد بعد'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">نوع العضوية الحالية:</span>
                    <span className="text-[#059669] font-black">عضوية تنافسية نشطة</span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await auth.signOut();
                    navigate('/');
                  }}
                  className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 border border-slate-200 py-4 rounded-2xl font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={16} />
                  تسجيل خروج الحساب
                </button>
              </div>

              {/* Prize distributions card */}
              <div className="bg-[#F0F4F1] p-6 rounded-3xl border border-emerald-100 space-y-4">
                <h4 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                  <Trophy size={16} className="text-[#059669]" />
                  مكافآت التحدي الأسبوعي
                </h4>
                <div className="space-y-3 pt-2">
                  {PRIZES.map((p) => (
                    <div key={p.rank} className="flex justify-between items-center p-3.5 bg-white rounded-xl border border-emerald-100/50 text-xs">
                      <span className="font-extrabold text-slate-700">{p.label} {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : '🥉'}</span>
                      <span className="font-sans font-black text-[#059669]">{p.amount} جنيه مصري</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Notifications Drawer Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 max-w-full bg-white border-r border-[#059669]/20 z-50 p-6 shadow-2xl overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <h3 className="font-black text-emerald-950 text-lg font-serif">مركز الإشعارات 🔔</h3>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-700 transition-colors">إغلاق</button>
              </div>

              <div className="space-y-4 pt-6">
                {notifications.length === 0 ? (
                  <p className="text-center text-slate-400 font-bold italic py-10">لا توجد تنبيهات جديدة</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-4 bg-slate-50 border border-emerald-100/40 rounded-2xl space-y-2">
                      <h5 className="font-black text-sm text-[#059669]">{n.title}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Increment Popup Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
              onClick={() => setShowCustomModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white p-8 rounded-[3rem] border border-emerald-100 z-50 shadow-2xl text-center space-y-6"
            >
              <h3 className="text-xl font-black text-emerald-950 font-serif">تسجيل عدد مُخصّص ✍️</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">اكتب العدد الإجمالي للصلوات التي قمت بها بشكل خارجي يدوياً لإضافتها لعدادك</p>
              
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <input 
                  type="number"
                  placeholder="مثلاً: 500"
                  value={customIncrement}
                  onChange={(e) => setCustomIncrement(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-center border-2 border-emerald-100 focus:border-[#059669] rounded-2xl px-6 py-4 outline-none font-black text-2xl font-sans"
                  autoFocus
                />
                
                <div className="flex gap-3">
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-[#059669] hover:bg-emerald-700 text-white font-black text-sm rounded-xl active:scale-95 transition-all cursor-pointer"
                  >
                    تأكيد وإضافة
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="flex-1 py-4 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Bottom Nav */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
