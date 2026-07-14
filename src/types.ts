export type UserStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'admin' | 'member';

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  status: UserStatus;
  role: UserRole;
  createdAt: number | null;
  approvedAt: number | null;
  approvedBy: string | null;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  colorIndex: number;
  order: number;
};

export type Expense = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  categoryId: string;
  categoryName: string;
  amount: number;
  note: string;
  createdAt: number | null;
};
