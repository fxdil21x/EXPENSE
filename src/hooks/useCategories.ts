import { useEffect, useRef, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Category } from '../types';

export const CATEGORY_PALETTE_SIZE = 10;

const DEFAULT_CATEGORIES: Array<{ name: string; icon: string }> = [
  { name: 'Food', icon: '🍽️' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Bills', icon: '📄' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Health', icon: '💊' },
  { name: 'Miscellaneous', icon: '📦' },
];

export function useCategories(uid: string | null) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);
  const seededRef = useRef(false);

  useEffect(() => {
    if (!uid) {
      setCategories([]);
      setLoaded(false);
      seededRef.current = false;
      return;
    }

    const categoriesRef = collection(db, 'users', uid, 'categories');
    const q = query(categoriesRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty && !seededRef.current) {
        seededRef.current = true;
        const batch = writeBatch(db);
        DEFAULT_CATEGORIES.forEach((category, index) => {
          const ref = doc(categoriesRef);
          batch.set(ref, {
            name: category.name,
            icon: category.icon,
            colorIndex: index % CATEGORY_PALETTE_SIZE,
            order: index,
            createdAt: serverTimestamp(),
          });
        });
        await batch.commit();
        return;
      }

      setCategories(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name ?? '',
            icon: data.icon ?? '🏷️',
            colorIndex: data.colorIndex ?? 0,
            order: data.order ?? 0,
          };
        }),
      );
      setLoaded(true);
    });

    return unsubscribe;
  }, [uid]);

  const addCategory = async (name: string, icon: string) => {
    if (!uid || !name.trim()) return;
    await addDoc(collection(db, 'users', uid, 'categories'), {
      name: name.trim(),
      icon,
      colorIndex: categories.length % CATEGORY_PALETTE_SIZE,
      order: categories.length,
      createdAt: serverTimestamp(),
    });
  };

  const updateCategory = async (id: string, updates: Partial<Pick<Category, 'name' | 'icon'>>) => {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'categories', id), updates);
  };

  const deleteCategory = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'categories', id));
  };

  return { categories, loaded, addCategory, updateCategory, deleteCategory };
}
