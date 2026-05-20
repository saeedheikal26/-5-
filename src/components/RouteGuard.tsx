import React, { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { PAYMENT_STATUS } from '../types';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const LoadingScreen = memo(() => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD]" dir="rtl">
    <div className="relative">
       <motion.div 
         animate={{ rotate: 360 }}
         transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
         className="w-20 h-20 border-4 border-brand/10 border-t-brand rounded-full shadow-inner"
       />
       <div className="absolute inset-0 flex items-center justify-center">
          <Trophy size={24} className="text-brand/20" />
       </div>
    </div>
    <div className="mt-8 space-y-2 text-center">
       <h2 className="text-brand font-black text-lg">جاري تحميل الحساب...</h2>
       <p className="text-gray-400 font-bold text-xs uppercase tracking-widest font-sans">PLEASE WAIT</p>
    </div>
  </div>
));

const RouteGuard: React.FC<Props> = ({ children, requireAdmin = false }) => {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  // 1. Not logged in -> Auth
  if (!user) {
    if (location.pathname === '/auth' || location.pathname === '/') {
        return <>{children}</>;
    }
    return <Navigate to="/auth" replace />;
  }

  // 2. Logged in but no profile yet (should rarely happen with our loading states)
  if (!profile && !loading) {
     return <LoadingScreen />;
  }

  // 3. Admin logic
  if (isAdmin) {
    // If admin is on landing or auth, go to admin dashboard
    if (['/', '/auth', '/payment', '/onboarding'].includes(location.pathname)) {
        return <Navigate to="/admin" replace />;
    }
    return <>{children}</>;
  }

  // 4. Regular User logic
  
  // If user is trying to access admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const currentPath = location.pathname;

  // Onboarding check
  if (!profile?.onboardingCompleted) {
    if (currentPath !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
    return <>{children}</>;
  }

  // Payment status checks
  if (profile.paymentStatus === PAYMENT_STATUS.NONE || !profile.paymentStatus) {
    if (currentPath !== '/payment') {
      return <Navigate to="/payment" replace />;
    }
    return <>{children}</>;
  }

  if (profile.paymentStatus === PAYMENT_STATUS.PENDING) {
    if (currentPath !== '/payment-pending') {
      return <Navigate to="/payment-pending" replace />;
    }
    return <>{children}</>;
  }

  if (profile.paymentStatus === PAYMENT_STATUS.REJECTED) {
    if (currentPath !== '/payment-rejected') {
      return <Navigate to="/payment-rejected" replace />;
    }
    return <>{children}</>;
  }

  // Subscription check (expired)
  if (profile.status === 'expired' || !profile.subscriptionActive) {
    if (currentPath !== '/subscription-expired') {
      return <Navigate to="/subscription-expired" replace />;
    }
    return <>{children}</>;
  }

  // If user is on an access screen but is fully active
  const accessPaths = ['/auth', '/onboarding', '/payment', '/payment-pending', '/payment-rejected', '/subscription-expired'];
  if (accessPaths.includes(currentPath)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
