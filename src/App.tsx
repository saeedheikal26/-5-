import React, { Suspense, lazy, ReactNode, useEffect, memo, Component, ErrorInfo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { auth } from './lib/firebase';
import { Trophy, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

// Error Boundary for robustness
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50" dir="rtl">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">عذراً، حدث خطأ غير متوقع</h1>
          <p className="text-gray-500 mb-8">يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-brand text-white px-8 py-3 rounded-2xl font-black shadow-lg"
          >
            إعادة تحميل التطبيق
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// New Access Flow Pages
const PaymentPage = lazy(() => import('./pages/access/PaymentPage'));
const OnboardingPage = lazy(() => import('./pages/access/OnboardingPage'));
const AccessStatusPage = lazy(() => import('./pages/access/AccessStatusPage'));

import RouteGuard from './components/RouteGuard';

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <div className="min-h-screen bg-[#FDFDFD]">
            <Toaster position="top-center" richColors />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand" /></div>}>
              <Routes>
                <Route path="/" element={<RouteGuard><LandingPage /></RouteGuard>} />
                <Route path="/auth" element={<RouteGuard><AuthPage /></RouteGuard>} />
                
                {/* Access Flow Routes */}
                <Route path="/onboarding" element={<RouteGuard><OnboardingPage /></RouteGuard>} />
                <Route path="/payment" element={<RouteGuard><PaymentPage /></RouteGuard>} />
                <Route path="/payment-pending" element={<RouteGuard><AccessStatusPage type="pending" /></RouteGuard>} />
                <Route path="/payment-rejected" element={<RouteGuard><AccessStatusPage type="rejected" /></RouteGuard>} />
                <Route path="/subscription-expired" element={<RouteGuard><AccessStatusPage type="expired" /></RouteGuard>} />
                
                <Route 
                  path="/dashboard" 
                  element={
                    <RouteGuard>
                      <DashboardPage />
                    </RouteGuard>
                  } 
                />
                <Route 
                  path="/admin/*" 
                  element={
                    <RouteGuard requireAdmin>
                      <AdminPage />
                    </RouteGuard>
                  } 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

