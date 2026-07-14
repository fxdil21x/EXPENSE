import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserProfile } from '../types';

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

export function useAdmin(enabled: boolean, adminUid: string | null) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setUsers([]);
      setLoaded(false);
      return;
    }

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map((docSnap) => toProfile(docSnap.id, docSnap.data())));
      setLoaded(true);
    });

    return unsubscribe;
  }, [enabled]);

  const setStatus = async (uid: string, status: 'approved' | 'rejected' | 'pending') => {
    if (!adminUid) return;
    await updateDoc(doc(db, 'users', uid), {
      status,
      approvedAt: status === 'approved' ? serverTimestamp() : null,
      approvedBy: status === 'approved' ? adminUid : null,
    });
  };

  return {
    users,
    pending: users.filter((u) => u.status === 'pending'),
    loaded,
    approveUser: (uid: string) => setStatus(uid, 'approved'),
    rejectUser: (uid: string) => setStatus(uid, 'rejected'),
    revokeUser: (uid: string) => setStatus(uid, 'pending'),
  };
}
