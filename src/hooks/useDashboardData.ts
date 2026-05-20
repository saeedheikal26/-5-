import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, query, where, onSnapshot, doc, 
  updateDoc, increment, serverTimestamp, addDoc, limit, orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { User, Notification } from '../types';

export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  message: string;
  createdAt: any;
}

export const useDashboardData = (user: User | null) => {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Load competitive Real-time Leaderboard based ONLY on active paid users, sorted by salawatCount DESC
  useEffect(() => {
    // We fetch users whose status is active
    const q = query(
      collection(db, 'users'),
      where('status', '==', 'active'),
      orderBy('salawatCount', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((docSnap) => {
        usersData.push({ id: docSnap.id, ...docSnap.data() } as User);
      });
      // Fallback ranking if firestore index is not yet built (we can still sort locally to survive fallback states)
      setLeaderboard(usersData.sort((a, b) => b.salawatCount - a.salawatCount));
      setIsLoading(false);
    }, (err) => {
      console.warn("Leaderboard onSnapshot error. Might need composite index:", err);
      // Fallback: fetch without order first, sort locally
      const fallbackQuery = query(collection(db, 'users'), where('status', '==', 'active'));
      const unsubFallback = onSnapshot(fallbackQuery, (snap) => {
        const usersData: User[] = [];
        snap.forEach((docSnap) => {
          usersData.push({ id: docSnap.id, ...docSnap.data() } as User);
        });
        setLeaderboard(usersData.sort((a, b) => b.salawatCount - a.salawatCount));
        setIsLoading(false);
      }, (fallbackErr) => {
        handleFirestoreError(fallbackErr, OperationType.LIST, 'users', false);
        setError("فشل تحميل جدول الصدارة");
        setIsLoading(false);
      });
      return () => unsubFallback();
    });

    return () => unsubscribe();
  }, []);

  // 2. Load Real-time Activity Feed (Recent Salawat increments)
  useEffect(() => {
    const q = query(
      collection(db, 'activities'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: ActivityFeedItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as ActivityFeedItem);
      });
      setActivities(items);
    }, (err) => {
      console.warn("Activities stream error:", err);
    });

    return () => unsubscribe();
  }, []);

  // 3. Load User-specific Notifications
  useEffect(() => {
    if (!user?.id) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Notification[] = [];
      snapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...docSnap.data() } as Notification);
      });
      setNotifications(docs);
    }, (err) => {
      // Index is probably building
      const fallbackQ = query(collection(db, 'notifications'), where('userId', '==', user.id));
      const unsubFallback = onSnapshot(fallbackQ, (snapshot) => {
        const docs: Notification[] = [];
        snapshot.forEach((docSnap) => {
          docs.push({ id: docSnap.id, ...docSnap.data() } as Notification);
        });
        setNotifications(docs.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        }));
      });
      return () => unsubFallback();
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Increments Salawat count and appends an activity log item atomically
  const incrementSalawat = useCallback(async (amount: number) => {
    if (!user?.id) return;
    const cleanedAmount = Math.max(1, Math.floor(amount));
    
    try {
      // 1. Atomically update the user document
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        salawatCount: increment(cleanedAmount),
        updatedAt: serverTimestamp()
      });

      // 2. Log activity for the live scrolling feed
      const currentSalawat = (user.salawatCount || 0) + cleanedAmount;
      let feedText = `أضاف ${cleanedAmount.toLocaleString('en-US')} صلاة ﷺ`;
      
      // Smart milestone messages to build psychological drive
      if (currentSalawat >= 10000 && (user.salawatCount < 10000)) {
        feedText = `تجاوز حاجز الـ 10,000 صلاة! 🔥🎉`;
      } else if (currentSalawat >= 5000 && (user.salawatCount < 5000)) {
        feedText = `تجاوز الـ 5,000 صلاة! 🌟🚀`;
      } else if (currentSalawat >= 1000 && (user.salawatCount < 1000)) {
        feedText = `دخل نادي الـ 1000 صلاة! ✨`;
      }

      await addDoc(collection(db, 'activities'), {
        userId: user.id,
        userName: user.name || 'مشارك',
        amount: cleanedAmount,
        message: feedText,
        createdAt: serverTimestamp()
      });

    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  }, [user]);

  return {
    leaderboard,
    activities,
    notifications,
    isLoading,
    error,
    incrementSalawat
  };
};
