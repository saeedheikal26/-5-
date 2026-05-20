import { initializeApp } from 'firebase/app';
import { 
  getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence 
} from 'firebase/auth';
import { 
  getFirestore, doc, getDocFromServer, initializeFirestore, persistentLocalCache, persistentMultipleTabManager 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent cache to handle "Could not reach backend" issues gracefully.
// This allows the app to work offline and reduces initial 10s timeout failures.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId || '(default)');

/**
 * Passionately verify if Firestore is online.
 * We use this to detect if we're in "Offline Mode" due to connectivity issues.
 */
export async function checkFirestoreHealth(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_internal_', 'health_check'));
    return true;
  } catch (error: any) {
    // If it's a timeout or network error, it's unhealthy
    const isNetworkError = error?.code === 'unavailable' || error?.code === 'deadline-exceeded';
    return !isNetworkError;
  }
}

export const auth = getAuth(app);
export const storage = getStorage(app);
console.log('[Firebase] Storage initialized with bucket:', firebaseConfig.storageBucket);
storage.maxUploadRetryTime = 120000; // Increased to 120 seconds
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Set persistence explicitly
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error("Auth persistence error:", err);
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, shouldThrow = true) {
  const err = error as any;
  
  // Basic console log for all errors during development help
  console.warn(`[Firestore ${operationType}] error at ${path}:`, err?.message || String(error));

  const errInfo: FirestoreErrorInfo = {
    error: err?.message || String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  
  if (shouldThrow || err?.code === 'permission-denied') {
    throw new Error(JSON.stringify(errInfo));
  }
  
  return errInfo;
}

// Connection warming removed to favor on-demand health checks and persistent cache.
