import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Expense } from '../types';

export type NewExpenseInput = {
  date: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  note: string;
};

export function useExpenses(uid: string | null) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setExpenses([]);
      setLoaded(false);
      return;
    }

    const expensesRef = collection(db, 'users', uid, 'expenses');
    // Single orderBy on purpose — a second orderBy on a different field would need a
    // composite index that doesn't exist yet, and the listener fails silently without one.
    const q = query(expensesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setExpenses(
          snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              date: data.date ?? '',
              categoryId: data.categoryId ?? '',
              categoryName: data.categoryName ?? '',
              amount: data.amount ?? 0,
              note: data.note ?? '',
              createdAt: data.createdAt?.toMillis?.() ?? null,
            };
          }),
        );
        setLoaded(true);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoaded(true);
      },
    );

    return unsubscribe;
  }, [uid]);

  const addExpense = async (input: NewExpenseInput) => {
    if (!uid) return;
    await addDoc(collection(db, 'users', uid, 'expenses'), {
      ...input,
      createdAt: serverTimestamp(),
    });
  };

  const deleteExpense = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'expenses', id));
  };

  return { expenses, loaded, error, addExpense, deleteExpense };
}
