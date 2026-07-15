import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import type { Category, Expense } from '../types';
import type { NewExpenseInput } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDateTitle, formatHeaderDate, formatTime, monthKey } from '../lib/format';
import { paletteFor } from '../lib/palette';
import { CategoryManager } from './CategoryManager';

const todayIso = () => new Date().toISOString().slice(0, 10);

const greetingForHour = (hour: number) => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export function DashboardTab({
  categories,
  expenses,
  expensesError,
  addExpense,
  deleteExpense,
  addCategory,
  updateCategory,
  deleteCategory,
}: {
  categories: Category[];
  expenses: Expense[];
  expensesError: string | null;
  addExpense: (input: NewExpenseInput) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (name: string, icon: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Pick<Category, 'name' | 'icon'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}) {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    date: todayIso(),
    categoryId: '',
    note: '',
    amount: '',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedExpenses, setExpandedExpenses] = useState<Set<string>>(new Set());

  const toggleExpense = (id: string) => {
    setExpandedExpenses((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    for (const expense of expenses) {
      if (!groups[expense.date]) groups[expense.date] = [];
      groups[expense.date].push(expense);
    }
    const order = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return { groups, order };
  }, [expenses]);

  const thisMonthTotal = useMemo(() => {
    const key = monthKey(new Date());
    return expenses.filter((e) => e.date.startsWith(key)).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const todayTotal = useMemo(() => {
    return expenses.filter((e) => e.date === todayIso()).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const firstName = profile?.displayName?.split(' ')[0] || '';

  const handleDeleteExpense = async (expenseId: string) => {
    const result = await Swal.fire({
      title: 'Delete this expense?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteExpense(expenseId);
      await Swal.fire({
        icon: 'success',
        title: 'Expense deleted',
        text: 'The transaction was removed.',
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Could not delete expense',
        text: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    const category = categoryById.get(form.categoryId) ?? categories[0];
    if (!form.date || !form.amount || !category) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing details',
        text: 'Please choose a date, amount, and category before saving.',
      });
      return;
    }

    setSubmitting(true);
    try {
      await addExpense({
        date: form.date,
        categoryId: category.id,
        categoryName: category.name,
        amount: Number(form.amount),
        note: form.note.trim(),
      });
      setForm((prev) => ({ ...prev, note: '', amount: '' }));
      await Swal.fire({
        icon: 'success',
        title: 'Expense saved',
        text: 'Your transaction was added successfully.',
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save this expense. Please try again.');
      await Swal.fire({
        icon: 'error',
        title: 'Save failed',
        text: err instanceof Error ? err.message : 'Could not save this expense. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="hero-card">
        <div className="hero-content">
          <p className="hero-greeting">
            {greetingForHour(new Date().getHours())}
            {firstName ? `, ${firstName}` : ''}
          </p>
          <p className="hero-date">{formatHeaderDate()}</p>
        </div>
        <div className="summary-card">
          <div className="summary-metrics">
            <div className="summary-metric">
              <span className="summary-label">This month</span>
              <span className="summary-amount">{formatCurrency(thisMonthTotal)}</span>
            </div>
            <div className="summary-metric">
              <span className="summary-label">Today</span>
              <span className="summary-amount">{formatCurrency(todayTotal)}</span>
            </div>
          </div>
        </div>
      </section>

      {expensesError && (
        <div className="error-banner">Couldn't load your expenses: {expensesError}</div>
      )}

      <section className="grid-layout">
        <article className="panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Add Expense</p>
              <h2>Record a new transaction</h2>
            </div>
          </div>

          <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="date">Date</label>
                <input
                  id="date"
                  className="form-input"
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-select"
                  value={form.categoryId || categories[0]?.id || ''}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  disabled={categories.length === 0}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="note">Description</label>
              <input
                id="note"
                className="form-input"
                type="text"
                placeholder="e.g., Lunch at cafe, Monthly subscription..."
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="amount">Amount (₹)</label>
                <input
                  id="amount"
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={categories.length === 0 || submitting}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  {submitting ? 'Saving…' : 'Add Expense'}
                </button>
              </div>
            </div>

            {submitError && <p className="auth-error">{submitError}</p>}
          </form>
        </article>

        <CategoryManager categories={categories} onAdd={addCategory} onUpdate={updateCategory} onDelete={deleteCategory} />
      </section>

      <section className="daily-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Transaction History</p>
            <h2>Expenses by date</h2>
          </div>
        </div>

        {groupedByDate.order.length === 0 ? (
          <div className="day-card">
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              <p className="empty-title">No expenses yet</p>
              <p className="empty-description">Start tracking by adding your first expense above.</p>
            </div>
          </div>
        ) : (
          <div className="daily-grid">
            {groupedByDate.order.map((date) => (
              <div key={date} className="day-card">
                <div className="day-header">
                  <span className="day-date">{formatDateTitle(date)}</span>
                  <span className="day-total">
                    {formatCurrency(groupedByDate.groups[date].reduce((sum, expense) => sum + expense.amount, 0))}
                  </span>
                </div>
                <ul className="expense-list">
                  {groupedByDate.groups[date].map((expense) => {
                    const category = categoryById.get(expense.categoryId);
                    const colors = paletteFor(category?.colorIndex ?? 9);
                    const isOpen = expandedExpenses.has(expense.id);
                    return (
                      <li
                        key={expense.id}
                        className="expense-row"
                        onClick={() => toggleExpense(expense.id)}
                        aria-expanded={isOpen}
                      >
                        <div className="expense-info">
                          <div className="expense-icon category-icon" style={{ background: colors.bg }}>
                            {category?.icon ?? '🏷️'}
                          </div>
                          <div className="expense-details">
                            <p className="expense-title">{expense.categoryName}</p>
                            {isOpen && (
                              <>
                                {expense.note && <p className="expense-meta">{expense.note}</p>}
                                <p className="expense-meta expense-time">Added {formatTime(expense.createdAt)}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="expense-actions">
                          <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteExpense(expense.id);
                            }}
                            aria-label={`Delete ${expense.note || expense.categoryName}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
