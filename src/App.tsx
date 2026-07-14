import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useCategories } from './hooks/useCategories';
import { useExpenses } from './hooks/useExpenses';
import { useAdmin } from './hooks/useAdmin';
import { LoginScreen } from './components/LoginScreen';
import { PendingApproval } from './components/PendingApproval';
import { AppHeader, type TabKey } from './components/AppHeader';
import { DashboardTab } from './components/DashboardTab';
import { InsightsTab } from './components/InsightsTab';
import { AdminTab } from './components/AdminTab';
import { Footer } from './components/Footer';

function LoadingScreen() {
  return (
    <div className="auth-shell">
      <div className="loading-spinner" />
    </div>
  );
}

function ApprovedApp() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const isAdmin = profile?.role === 'admin';

  const { categories, addCategory, updateCategory, deleteCategory } = useCategories(user?.uid ?? null);
  const { expenses, error: expensesError, addExpense, deleteExpense } = useExpenses(user?.uid ?? null);
  const { pending } = useAdmin(isAdmin, user?.uid ?? null);

  return (
    <div className="app-shell">
      <AppHeader activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} pendingCount={pending.length} />

      {activeTab === 'dashboard' && (
        <DashboardTab
          categories={categories}
          expenses={expenses}
          expensesError={expensesError}
          addExpense={addExpense}
          deleteExpense={deleteExpense}
          addCategory={addCategory}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
        />
      )}

      {activeTab === 'insights' && <InsightsTab categories={categories} expenses={expenses} />}

      {activeTab === 'admin' && isAdmin && <AdminTab />}

      <Footer />
    </div>
  );
}

function Gate() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginScreen />;
  if (!profile || profile.status !== 'approved') return <PendingApproval />;

  return <ApprovedApp />;
}

function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

export default App;
