import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, Timestamp, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { User, Subscription } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => profile?.role === 'admin', [profile?.role]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const uid = user.uid;
    setLoading(true);

    const unsubscribeDoc = onSnapshot(doc(db, 'users', uid), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as User;
        const fullData = { ...data, id: docSnap.id };
        
        // Migration: Ensure all users have essential access flow fields
        const needsMigration = 
          data.paymentStatus === undefined || 
          data.onboardingCompleted === undefined ||
          data.salawatCount === undefined ||
          data.subscriptionActive === undefined;

        if (needsMigration) {
          console.log('[Auth] Migrating user document for:', data.email);
          const updates: any = {};
          if (data.paymentStatus === undefined) updates.paymentStatus = data.status === 'active' ? 'approved' : 'none';
          if (data.onboardingCompleted === undefined) updates.onboardingCompleted = !!data.phone;
          if (data.salawatCount === undefined) updates.salawatCount = 0;
          if (data.subscriptionActive === undefined) updates.subscriptionActive = data.status === 'active';
          
          // Ensure Owner is Admin
          const ownerEmail = 'saeedheikal16@gmail.com'.toLowerCase();
          if (data.email?.toLowerCase() === ownerEmail && data.role !== 'admin') {
            updates.role = 'admin';
          }
          
          await updateDoc(doc(db, 'users', uid), updates);
          setProfile({ ...fullData, ...updates });
        } else {
          setProfile(fullData);
        }
      } else {
        // Create initial user doc if not exists
        console.log('[Auth] Creating new user document for:', user.email);
        const ownerEmail = 'saeedheikal16@gmail.com'.toLowerCase();
        const isOwner = user.email?.toLowerCase() === ownerEmail;

        const newUser: User = {
          name: user.displayName || 'لاعب جديد',
          email: user.email || '',
          phone: '',
          isPaid: false,
          salawatCount: 0,
          status: isOwner ? 'active' : 'pending',
          paymentStatus: isOwner ? 'approved' : 'none',
          onboardingCompleted: isOwner,
          subscriptionActive: isOwner,
          role: isOwner ? 'admin' : 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', uid), newUser);
        setProfile({ ...newUser, id: uid });
      }
      setLoading(false);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        handleFirestoreError(error, OperationType.GET, `users/${uid}`, false);
      }
      setLoading(false);
    });

    return () => unsubscribeDoc();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
