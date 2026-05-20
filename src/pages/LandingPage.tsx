import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, CheckCircle2, Users, Flame, ArrowRight, ShieldCheck, 
  Clock, Zap, MessageCircle, ChevronDown, Award, Sparkles, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, heading: 'متبقي على نهاية التحدي الحالي' });

  // Dynamic countdown timer logic
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const updateTimer = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 is Sunday, 6 is Saturday
      
      let target = new Date();
      let heading = '';
      
      if (currentDay === 4 || currentDay === 5) {
        // Thursday & Friday is Registration & Break countdown
        heading = 'يبدأ التحدي القادم خلال';
        const daysToSaturday = 6 - currentDay;
        target.setDate(now.getDate() + daysToSaturday);
        target.setHours(0, 0, 0, 0);
      } else {
        // Saturday to Wednesday is Active Challenge Countdown
        heading = 'متبقي على نهاية التحدي الحالي';
        const daysToWednesday = (3 - currentDay + 7) % 7;
        target.setDate(now.getDate() + daysToWednesday);
        target.setHours(23, 59, 59, 999);
      }
      
      const difference = target.getTime() - now.getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, heading });
        return;
      }
      
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s, heading });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const onStart = () => navigate('/auth');
  const onAdminStart = () => navigate('/auth?admin=true');

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div id="landing-root" className="min-h-screen bg-luxblack text-slate-800 selection:bg-brand/20 selection:text-brand-dark overflow-x-hidden" dir="rtl">
      
      {/* Navbar */}
      <nav id="navbar" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-emerald-100 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div id="nav-logo" className="flex items-center gap-3.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center shadow-md shadow-brand/10 group-hover:rotate-3 transition-transform duration-500 border border-brand-light/20">
              <Trophy className="text-white" size={20} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black font-serif tracking-tight leading-none text-brand-dark">تحدي الـ 5 أيام</span>
              <span className="text-[9px] font-bold text-[#059669] mt-0.5 tracking-wider">المنصة الروحانية المبتكرة</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-black text-slate-600 transition-colors">
            <a href="#about" className="hover:text-brand transition-colors">عن التحدي</a>
            <a href="#prizes" className="hover:text-brand font-bold text-brand-dark transition-colors">🏆 الجوائز النقدية</a>
            <a href="#feed" className="hover:text-brand transition-colors">تفاعل حي</a>
            <a href="#how" className="hover:text-brand transition-colors">خطوات الاشتراك</a>
            <a href="#faq" className="hover:text-brand transition-colors">الأسئلة الشائعة</a>
          </div>
          <div className="flex items-center gap-2">
            <button 
              id="nav-cta-btn"
              onClick={onStart}
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-xs shadow-md shadow-brand/10 active:scale-95 transition-all duration-200"
            >
              اشترك بـ 99 جنيه
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 md:pt-40 pb-20 px-6 text-center flex items-center min-h-[90vh] overflow-hidden bg-gradient-to-b from-emerald-50 via-teal-50/20 to-luxblack">
        
        {/* Soft Decorative Islamic Geometry Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-25">
          <div className="absolute inset-0 opacity-[0.04]" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L61.2 38.8 L100 50 L61.2 61.2 L50 100 L38.8 61.2 L0 50 L38.8 38.8 Z' fill='%23059669'/%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px' 
          }} />
          <div className="absolute top-10 -right-20 w-80 h-80 border-2 border-brand/5 rounded-full animate-[spin_180s_linear_infinite]" />
          <div className="absolute bottom-10 -left-20 w-80 h-80 border-2 border-brand/5 rounded-full rotate-45 animate-[spin_150s_linear_infinite]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 w-full flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2.5 bg-white border border-emerald-100 px-5 py-2 rounded-full text-xs font-black text-[#059669] mb-6 shadow-sm"
          >
            <span className="w-2 h-2 bg-emerald rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            <Flame size={14} className="text-[#059669] fill-[#059669]/10 animate-pulse" />
            <span>تحدي الـ 5 أيام للصلاة على النبي ﷺ</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight text-emerald-950 font-serif"
          >
            نافس على الجوائز المالية… <br />
            واملأ يومك بالصلاة على النبي ﷺ 🌿
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            🔥 <span className="font-bold text-[#059669]">5 أيام من الصلاة على النبي ﷺ</span> قد تجعلك من الفائزين بالجوائز المالية هذا الأسبوع! التزم بالذكر، شارك تقدمك، وارتَقِ في لوحة الصدارة.
          </motion.p>

          {/* Quick Highlight of the Prizes */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-3 gap-3 max-w-lg w-full mb-8 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100/80 text-center"
          >
            <div className="p-2">
              <span className="text-xl sm:text-2xl font-black text-brand-dark block">🥇 1000ج</span>
              <span className="text-[10px] text-zinc-600 font-bold">المركز الأول</span>
            </div>
            <div className="p-2 border-x border-emerald-200">
              <span className="text-xl sm:text-2xl font-black text-slate-700 block">🥈 600ج</span>
              <span className="text-[10px] text-zinc-600 font-bold">المركز الثاني</span>
            </div>
            <div className="p-2">
              <span className="text-xl sm:text-2xl font-black text-amber-700 block">🥉 400ج</span>
              <span className="text-[10px] text-zinc-600 font-bold">المركز الثالث</span>
            </div>
          </motion.div>

          {/* Clean Main Call to Action */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full sm:w-auto flex flex-col items-center gap-3 mb-10"
          >
            <button 
              id="hero-cta-btn"
              onClick={onStart}
              className="w-full sm:w-auto px-12 py-5 bg-[#059669] hover:bg-emerald-700 text-white font-black text-xl rounded-2xl shadow-lg hover:scale-103 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 btn-3d"
            >
              🚀 اشترك الآن بـ 99 جنيه
              <ArrowRight size={20} className="mr-1" />
            </button>
            <div className="text-xs text-red-500 font-bold flex items-center gap-1.5 justify-center">
              <AlertCircle size={14} className="text-red-500 animate-pulse" />
              <span>⚠️ التسجيل الحالي يقترب من الإغلاق لضمان حصر أعداد المتنافسين</span>
            </div>
          </motion.div>

          {/* Active Countdown Timer */}
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 justify-center">
            <Clock size={14} className="text-[#059669] animate-pulse" />
            <span className="text-slate-700">{timeLeft.heading}</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-4 gap-3 sm:gap-4 max-w-sm w-full bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm"
          >
            {[
              { label: 'يوم', val: timeLeft.days },
              { label: 'ساعة', val: timeLeft.hours },
              { label: 'دقيقة', val: timeLeft.minutes },
              { label: 'ثانية', val: timeLeft.seconds }
            ].map((t, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center bg-emerald-50/40 py-2.5 rounded-xl border border-emerald-50">
                <span className="text-2xl sm:text-3xl font-black text-brand-dark font-sans tracking-tight">
                  {String(t.val).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 font-bold mt-0.5">{t.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Motivation Quote Cards */}
          <div className="mt-12 bg-white border border-emerald-100/80 p-6 rounded-2xl max-w-2xl w-full text-center shadow-xs">
            <h3 className="text-[#059669] font-black text-lg mb-2">99 جنيه فرصة قوية جداً مقابل إمكانية الفوز والالتزام</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              مبلغ الاشتراك الرمزي صمم خصيصاً لفرز المشاركين الجادين في الالتزام اليومي، حيث يتم حشده بالكامل لتوفير الجوائز وإدارة المنصة بنزاهة ومصداقية تامة وبتحكيم يدوي حريص.
            </p>
          </div>

        </div>
      </section>

      {/* HUGE PRIZES SECTION - Visually Dominating & Highly Motivating */}
      <section id="prizes" className="py-24 px-6 bg-white relative overflow-hidden border-y border-emerald-100/60">
        
        {/* Visual Glow Decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-100/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="text-center mb-16">
            <span className="inline-block text-[#059669] text-xs font-black tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full mb-3 uppercase">ESTABLISHED VALUE & COMMITMENT</span>
            <h2 className="text-4xl md:text-6xl font-black text-emerald-950 font-serif leading-tight">
              🏆 الجوائز المالية للدورة الحالية
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto mt-4 text-sm sm:text-lg leading-relaxed">
              كل دورة تفتخر المنصة بتقديم جوائز نقدية حقيقية بقيمة إجمالية <span className="text-[#059669] font-extrabold text-2xl border-b-2 border-brand-light">2,000 جنيه مصري</span> يتم إرسالها فوراً للمتفوقين.
            </p>
          </div>

          {/* Big Podium Feature for Prizes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto mb-16">
            
            {/* Second Place Card */}
            <motion.div 
              {...fadeIn}
              className="bg-luxcard border border-emerald-100 rounded-[2.5rem] p-8 text-center flex flex-col justify-between relative shadow-sm hover:shadow-md hover:border-[#059669]/20 transition-all duration-300 md:translate-y-6"
            >
              <div className="absolute top-6 right-6 w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm">2</div>
              <div className="flex flex-col items-center pt-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 mb-6">
                  <Award className="text-slate-400" size={32} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">متميز التحدي</span>
                <h3 className="text-2xl font-black text-slate-800 font-serif mt-1 mb-2">🥈 المركز الثاني</h3>
                <div className="inline-flex items-baseline gap-1 bg-slate-50 px-4 py-1 rounded-full border border-slate-100">
                  <span className="text-4xl sm:text-5xl font-black font-sans text-slate-700">600</span>
                  <span className="text-xs font-bold text-slate-500">جنيه نقدًا</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs font-medium leading-relaxed mt-6 pt-4 border-t border-slate-50">
                يتم تكريم الفائز بالمركز الثاني بـ 600 جنيه مصري ترسل له مباشرة بعد فرز ومطابقة المشرفين للعداد بدقة لمنع أي تلاعب.
              </p>
            </motion.div>

            {/* FIRST PLACE CARD - ABSOLUTELY HUGE & GLOWING */}
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1.05 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#FAFAF9] border-2 border-[#059669] rounded-[3rem] p-10 text-center flex flex-col justify-between relative shadow-[0_20px_50px_rgba(16,185,129,0.12)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.18)] transition-all duration-300 z-10"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#059669] to-brand-light text-white font-black text-xs px-6 py-2 rounded-full uppercase tracking-widest shadow-md">
                👑 الجائزة الكبرى
              </div>
              
              <div className="flex flex-col items-center pt-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-[#059669]/30 mb-6 animate-pulse">
                  <Trophy className="text-[#059669]" size={40} fill="currentColor" />
                </div>
                <span className="text-xs font-black text-[#059669] uppercase tracking-widest">بطل القمة</span>
                <h3 className="text-3xl font-black text-emerald-950 font-serif mt-1 mb-3">🥇 المركز الأول</h3>
                <div className="inline-flex items-baseline gap-1.5 bg-emerald-50 px-6 py-2 rounded-full border border-emerald-100 shadow-inner">
                  <span className="text-5xl sm:text-6.5xl font-black font-sans text-[#059669] leading-none">1000</span>
                  <span className="text-sm font-black text-[#059669]">جنيه نقدًا</span>
                </div>
              </div>

              <div className="space-y-4 mt-8 pt-6 border-t border-emerald-100">
                <p className="text-slate-600 text-sm font-bold leading-relaxed">
                  جائزة نقدية كبرى بقيمة 1000 جنيه مصري لصاحب أعلى همة وأول من يعتلي مرتبة صدارة الـ 5 أيام للصلاة على الحبيب ﷺ.
                </p>
                <div className="text-[11px] text-[#059669] font-bold bg-white p-2 rounded-xl border border-emerald-100 inline-block">
                  🎯 فرصة حقيقية وقوية مقابل التزامك اليومي
                </div>
              </div>
            </motion.div>

            {/* Third Place Card */}
            <motion.div 
              {...fadeIn}
              className="bg-luxcard border border-emerald-100 rounded-[2.5rem] p-8 text-center flex flex-col justify-between relative shadow-sm hover:shadow-md hover:border-[#059669]/20 transition-all duration-300 md:translate-y-6"
            >
              <div className="absolute top-6 right-6 w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 font-bold text-sm">3</div>
              <div className="flex flex-col items-center pt-4">
                <div className="w-16 h-16 bg-amber-50/50 rounded-full flex items-center justify-center border border-amber-200/50 mb-6">
                  <Award className="text-amber-700" size={32} />
                </div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">متميز التحدي</span>
                <h3 className="text-2xl font-black text-slate-800 font-serif mt-1 mb-2">🥉 المركز الثالث</h3>
                <div className="inline-flex items-baseline gap-1 bg-amber-50/50 px-4 py-1 rounded-full border border-amber-100">
                  <span className="text-4xl sm:text-5xl font-black font-sans text-amber-800">400</span>
                  <span className="text-xs font-bold text-amber-600">جنيه نقدًا</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs font-medium leading-relaxed mt-6 pt-4 border-t border-slate-50">
                تكريمًا لصاحب المركز الثالث بـ 400 جنيه مصري تدفع مباشرة لتعزيز المثابرة وتأكيد الحافز لتقديم الأفضل في الدورات القادمة.
              </p>
            </motion.div>

          </div>

          {/* Inspirational CTA Text Footer */}
          <div className="text-center bg-[#F0F4F1] p-8 rounded-[2rem] border border-emerald-100 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-right">
              <h4 className="text-emerald-950 font-black text-lg mb-1">المعادلة واضحة ومحفزة للجميع! ✨</h4>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold">
                كلما زاد عدد الصلاة على النبي ﷺ... زادت فرصتك للوصول إلى المراكز الأولى ونيل الجائزة وشرف الالتزام بالذكر وصلاح أحوالك.
              </p>
            </div>
            <button 
              onClick={onStart} 
              className="px-8 py-4 bg-[#059669] hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-95 text-nowrap"
            >
              احجز مكانك في تحدي الدورة الحالية 🚀
            </button>
          </div>

        </div>
      </section>

      {/* Leaderboard and Live Feed Mockup Showcase */}
      <section id="feed" className="py-24 px-6 bg-[#FAFAF9] relative">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
          
          <motion.div {...fadeIn} className="space-y-6 w-full">
            <span className="inline-flex items-center gap-2 bg-emerald-100/60 text-[#059669] px-4 py-1.5 rounded-full text-xs font-black border border-emerald-200">
              <Sparkles size={14} className="animate-pulse" />
              <span>لوحة تحكم حية بتقدمك اليومي</span>
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-emerald-950 leading-tight font-serif">
              تجربة تفاعلية وبث مباشر لتعزيز طاقتك الإيمانية 🌿
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
              صممنا لك شاشة تحكم واضحة ومبسطة تضمن متابعة دقيقة وعادلة للجميع دون تشتيت، لتدخل في أجواء المنافسة الروحية والمالية وتحطيم أرقام صلاتك اليومية.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-right mt-8">
              {[
                { t: "جدول صدارة حقيقي وعادل", d: "شاهد ترتيبك الصريح يتحدث باستمرار مع بقية المتنافسين بوضوح تام." },
                { t: "متابعة فعلية ونزيهة", d: "نشاط فوري يوضح إلتزام المشتركين برفع أعداد الصلاة ﷺ بصفة دورية." },
                { t: "فارق المسافة المتبقية للمركز التالي", d: "يوضح لك النظام مباشرة كم تتبقى لك لتقفز للمركز التالي وتعتلي القمة." },
                { t: "أمان ومطابقة بشرية دقيقة", d: "مراجعة شاملة وإشرافية حية من المشرفين لحماية المصداقية وحفز التنافس الشريف." }
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white border border-emerald-100/80 rounded-2xl shadow-xs">
                  <div className="text-sm font-black text-[#059669] mb-1">{item.t}</div>
                  <div className="text-xs text-slate-500 font-bold leading-relaxed">{item.d}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* Easy Step Integration Section */}
      <section id="how" className="py-24 px-6 bg-white border-t border-emerald-100/60">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-[#059669] text-xs font-black tracking-widest block mb-2 uppercase">SIMPLE PARTICIPATION PROTOCOL</span>
            <h2 className="text-3xl md:text-5xl font-black text-emerald-950 font-serif">كيف تعمل وتشترك بالتحدي؟ 💡</h2>
            <p className="text-slate-500 text-sm mt-3">انضم إلينا بخطوات واضحة وسهلة في غضون دقائق معدودة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { n: "1", t: "سجل حسابك واملأ بياناتك", d: "سجل برقم هاتفك واسمك الحقيقي للمشاركة في قائمة المتصدرين لتسهيل تحويل الجائزة لك." },
              { n: "2", t: "ادفع اشتراك الدورة (99 جنيه)", d: "حول الاشتراك عبر تطبيق إنستا باي لضمان حصر واستبعلد المشوشين وتأكيد الحماس." },
              { n: "3", t: "باشر الصلاة والتزم بالذكر", d: "يقوم المشرفون بتفعيل حسابك فورا، وتبدأ العداد اليومى وتتنافس للصعود على المنصة المتميزة!" }
            ].map((item, i) => (
              <div key={i} className="text-center p-8 bg-emerald-50/30 rounded-3xl border border-emerald-50">
                <span className="w-12 h-12 rounded-full border border-[#059669] text-[#059669] bg-white flex items-center justify-center text-lg font-black mx-auto mb-6 shadow-xs">{item.n}</span>
                <h4 className="text-lg font-black text-emerald-900 mb-2 font-serif">{item.t}</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">{item.d}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-[#FAFAF9] border-t border-emerald-100/40">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-emerald-950 font-serif">الأسئلة الشائعة 💬</h2>
            <p className="text-slate-500 text-sm mt-2">كل التفاصيل التقنية والشرعية وتفاصيل التحدي تهمنا</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "لماذا تفرض رسوم اشتراك وما مصداقيتها؟", a: "رسم الاشتراك البسيط (99 جنيه) يحقق غرضين أساسيين: أولًا ضمان جدية وتصفية أعداد المشتركين الحريصين فعلًا على الالتزام اليومي وصالح الذكر، وبذلك تكون المنافسة خالية من السهو. ثانيًا: تشكيل الوعاء المالي المخصص لتقديم الجوائز الفائزة مباشرة ومجهودات إدارة وتدقيق المنصة يدوياً." },
              { q: "كيف يتم اختيار الفائزين؟", a: "يتم ترتيب المشاركين بناءً على إجمالي عدد الصلاة على النبي ﷺ خلال فترة التحدي الخمسة أيام، مع مراجعة ومصادقة المشرفين يدويًا قبل إعلان الفائزين لضمان النزاهة العادلة بنسبة 100%." },
              { q: "كيف تضمنون عدم الغش بالعداد؟", a: "لدينا نظام مراقبة دقيق وموثوق. إذا تم رصد أرقام غير منطقية أو قفزات مفاجئة لا تطابق الجهد الطبيعي، يستطيع المشرف تعديل العدادات يدويًا وحظر صاحب الحساب في الحالات المتكررة لضمان العدالة والجدية بنسبة 100%." },
              { q: "متى يتم تصفير العداد والاشتراكات؟", a: "فور نهاية التحدي الأسبوعي ليلة الأربعاء، يتم أرشفة جدول الصدارة وإعلان الفائزين الجمعة. وقبل بدء التحدي التالي، يتم تصفير جميع عدادات الصلاة تماماً، ويجب تجديد التأكيد للجميع للعودة للحالة الأولى لضمان اشتراك جديد وعادل للجميع." },
              { q: "هل هناك تجديد تلقائي؟", a: "لا يوجد أي تجديد تلقائي أو خصومات دائمة. الاشتراك يتم يدويا عن طريق إنستا باي أو تحويل المحفظة لكل دورة منفصلة تبدي فيها رغبتك بالدخول والتحدي." }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-emerald-100/80 overflow-hidden shadow-xs">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-6 text-right flex items-center justify-between font-black text-sm sm:text-base text-emerald-950 hover:bg-emerald-50/20 transition-all"
                >
                  <span className="font-serif">{faq.q}</span>
                  <ChevronDown className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-[#059669]' : 'text-slate-400'}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-emerald-50/20"
                    >
                      <div className="p-6 text-slate-600 font-semibold leading-relaxed text-xs sm:text-sm border-t border-emerald-100/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-block" className="py-24 px-6 bg-gradient-to-b from-white to-emerald-50 text-center relative border-t border-emerald-100">
        <div className="absolute inset-0 bg-radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops)) from-[#059669]/5 via-white to-white opacity-60 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-serif text-emerald-950 leading-tight">
            🔥 5 أيام فقط قد تجعلك من الفائزين
          </h2>
          <p className="text-slate-600 text-base sm:text-xl max-w-xl mx-auto font-medium">
            ابدأ التحدي الآن، نافس على المراكز الأولى، والتزم بالصلاة على النبي ﷺ يوميًا وعطر لسانك وحياتك بالذكر الدائم.
          </p>
          <button 
            id="footer-action-cta"
            onClick={onStart}
            className="px-12 py-5 bg-[#059669] hover:bg-emerald-700 text-white rounded-[2rem] text-xl font-black hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-emerald-500/20 mx-auto block"
          >
            🔥 اشترك الآن بـ 99 جنيه
          </button>
        </div>
      </section>

      {/* Desktop & Mobile Floating Target Component */}
      <div className="fixed bottom-6 left-6 right-6 z-50 sm:hidden">
        <button 
          onClick={onStart}
          className="w-full bg-[#059669] hover:bg-emerald-700 text-white py-4 rounded-xl font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          🚀 اشترك الآن بـ 99 جنيه
        </button>
      </div>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-emerald-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Trophy className="text-[#059669]" size={24} fill="currentColor" />
            <span className="font-serif text-lg font-black text-emerald-950">تحدي الـ 5 أيام للصلاة على النبي ﷺ</span>
          </div>
          <p className="text-xs text-slate-500 font-bold text-center sm:text-right text-balance max-w-md">
            © 2026 جميع الحقوق محفوظة لـ تحدي الـ 5 أيام. يتم تأكيد الاشتراك يدويًا لكل دورة لضمان جودة المتابعة، والالتزام، والمنافسة العادلة.
          </p>
          <button onClick={onAdminStart} className="text-xs font-black text-slate-400 hover:text-[#059669] transition-colors">
            دخول المشرف 🔑
          </button>
        </div>
      </footer>

    </div>
  );
}
