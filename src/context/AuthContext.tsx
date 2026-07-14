import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { ADMIN_EMAILS, auth, db, googleProvider } from '../firebase';
import type { UserProfile } from '../types';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toProfile(uid: string, data: Record<string, any>): UserProfile {
  return {
    uid,
    email: data.email ?? '',
    displayName: data.displayName ?? '',
    photoURL: data.photoURL ?? '',
    status: data.status ?? 'pending',
    role: data.role ?? 'member',
    createdAt: data.createdAt?.toMillis?.() ?? null,
    approvedAt: data.approvedAt?.toMillis?.() ?? null,
    approvedBy: data.approvedBy ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthResolved(true);
      if (!nextUser) {
        setProfile(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid);

    getDoc(ref).then((snapshot) => {
      if (snapshot.exists()) return;
      const isAdmin = ADMIN_EMAILS.includes((user.email ?? '').toLowerCase());
      return setDoc(ref, {
        email: user.email ?? '',
        displayName: user.displayName ?? '',
        photoURL: user.photoURL ?? '',
        status: isAdmin ? 'approved' : 'pending',
        role: isAdmin ? 'admin' : 'member',
        createdAt: serverTimestamp(),
        approvedAt: isAdmin ? serverTimestamp() : null,
        approvedBy: isAdmin ? 'system' : null,
      });
    });

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(toProfile(user.uid, snapshot.data()));
      }
    });

    return unsubscribe;
  }, [user]);

  const signIn = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading: !authResolved || (!!user && !profile),
      signIn,
      signOutUser,
    }),
    [user, profile, authResolved],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
