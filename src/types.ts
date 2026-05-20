export const PAYMENT_STATUS = {
  NONE: 'none',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export interface Subscription {
  isActive: boolean;
  startedAt: any;
  expiresAt: any;
  cycleId: string; // e.g., "cycle_2026_05_1" (5 days challenge cycle ID)
  paymentStatus: 'pending' | 'approved' | 'rejected';
}

export interface User {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  isPaid: boolean;
  subscription?: Subscription;
  salawatCount: number; // The absolute single tracking metric
  status: 'pending' | 'active' | 'rejected' | 'expired';
  paymentStatus: 'none' | 'pending' | 'approved' | 'rejected';
  onboardingCompleted: boolean;
  subscriptionActive: boolean;
  role: 'user' | 'admin';
  createdAt?: string | any;
  updatedAt?: string | any;
  receiptImage?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewedAt?: any;
  reviewedBy?: string;
  adminNotes?: string;
  onboarded?: boolean;
  paymentHandle?: string;
  avatar?: string;
  lastActive?: any;
}

export interface ChallengeCycle {
  id: string;
  title: string;
  startsAt: any;
  endsAt: any;
  isFinished: boolean;
  registrationLocked: boolean;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: string;
  receiptImage?: string;
  createdAt: any;
  updatedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
  adminNotes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export type Tab = 'today' | 'leaderboard' | 'profile' | 'admin';

export const PRIZES = [
  { rank: 1, amount: 1000, label: 'المركز الأول', color: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.5)]', desc: 'أعلى عدد صلاة على النبي ﷺ' },
  { rank: 2, amount: 600, label: 'المركز الثاني', color: 'text-gray-300', glow: '', desc: 'ثاني أعلى عدد صلاة على النبي ﷺ' },
  { rank: 3, amount: 400, label: 'المركز الثالث', color: 'text-amber-600', glow: '', desc: 'ثالث أعلى عدد صلاة على النبي ﷺ' }
];
