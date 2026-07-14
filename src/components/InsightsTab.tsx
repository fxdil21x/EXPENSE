import { useMemo, useState } from 'react';
import type { Category, Expense } from '../types';
import { paletteFor } from '../lib/palette';
import { formatCompactCurrency, formatCurrency, lastNMonthKeys, monthKey, monthLabel, monthLabelShort } from '../lib/format';

export function InsightsTab({ categories, expenses }: { categories: Category[]; expenses: Expense[] }) {
  const monthOptions = useMemo(() => lastNMonthKeys(12).reverse(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthKey(new Date()));

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(selectedMonth)),
    [expenses, selectedMonth],
  );

  const prevMonthKey = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    return monthKey(d);
  }, [selectedMonth]);

  const prevMonthTotal = useMemo(
    () => expenses.filter((e) => e.date.startsWith(prevMonthKey)).reduce((sum, e) => sum + e.amount, 0),
    [expenses, prevMonthKey],
  );

  const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const activeDays = new Set(monthlyExpenses.map((e) => e.date)).size;
  const avgPerDay = activeDays ? totalMonthly / activeDays : 0;

  const momChange = prevMonthTotal > 0 ? ((totalMonthly - prevMonthTotal) / prevMonthTotal) * 100 : null;

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    for (const expense of monthlyExpenses) {
      totals.set(expense.categoryId, (totals.get(expense.categoryId) ?? 0) + expense.amount);
    }
    const rows = Array.from(totals.entries())
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        category: categoryById.get(categoryId),
        share: totalMonthly ? (amount / totalMonthly) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
    const max = rows[0]?.amount ?? 0;
    return { rows, max };
  }, [monthlyExpenses, categoryById, totalMonthly]);

  const trend = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const keys = lastNMonthKeys(6, new Date(year, month - 1, 1));
    const totals = keys.map((key) => ({
      key,
      total: expenses.filter((e) => e.date.startsWith(key)).reduce((sum, e) => sum + e.amount, 0),
    }));
    const max = Math.max(...totals.map((t) => t.total), 1);
    return { totals, max };
  }, [expenses, selectedMonth]);

  return (
    <>
      <section className="panel-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="eyebrow">Insights</p>
          <h2>Spending overview</h2>
        </div>
        <select className="month-select" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
          {monthOptions.map((key) => (
            <option key={key} value={key}>
              {monthLabel(key)}
            </option>
          ))}
        </select>
      </section>

      <section className="stat-grid insights-stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total — {monthLabel(selectedMonth)}</span>
          <span className="stat-value stat-value-hero">{formatCurrency(totalMonthly)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Previous month</span>
          <span className="stat-value">{formatCurrency(prevMonthTotal)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Month-over-month</span>
          <span className={`stat-value stat-delta ${momChange === null ? '' : momChange > 0 ? 'stat-delta-up' : 'stat-delta-down'}`}>
            {momChange === null ? '—' : (
              <>
                {momChange > 0 ? '↑' : '↓'} {Math.abs(momChange).toFixed(1)}%
              </>
            )}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. per active day</span>
          <span className="stat-value">{formatCurrency(avgPerDay)}</span>
        </div>
      </section>

      <section className="grid-layout insights-grid">
        <article className="panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">By category</p>
              <h2>Spend per head</h2>
            </div>
          </div>

          {categoryBreakdown.rows.length === 0 ? (
            <p className="empty-description">No expenses recorded for {monthLabel(selectedMonth)}.</p>
          ) : (
            <div className="breakdown-list">
              {categoryBreakdown.rows.map((row) => {
                const colors = paletteFor(row.category?.colorIndex ?? 9);
                const width = categoryBreakdown.max ? (row.amount / categoryBreakdown.max) * 100 : 0;
                return (
                  <div key={row.categoryId} className="breakdown-row">
                    <div className="breakdown-label">
                      <span className="category-icon breakdown-icon" style={{ background: colors.bg }}>
                        {row.category?.icon ?? '🏷️'}
                      </span>
                      <span className="category-name">{row.category?.name ?? 'Uncategorized'}</span>
                    </div>
                    <div className="breakdown-bar-track">
                      <div className="breakdown-bar-fill" style={{ width: `${width}%`, background: colors.text }} />
                    </div>
                    <div className="breakdown-value">
                      <span className="category-amount">{formatCurrency(row.amount)}</span>
                      <span className="breakdown-share">{row.share.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Trend</p>
              <h2>Last 6 months</h2>
            </div>
          </div>

          <div className="trend-chart">
            {trend.totals.map((point) => {
              const height = trend.max ? Math.max((point.total / trend.max) * 100, point.total > 0 ? 4 : 0) : 0;
              const isSelected = point.key === selectedMonth;
              return (
                <div key={point.key} className="trend-bar-col">
                  <span className="trend-bar-value">{point.total > 0 ? formatCompactCurrency(point.total) : ''}</span>
                  <div className="trend-bar-track">
                    <div
                      className={`trend-bar-fill ${isSelected ? 'trend-bar-fill-active' : ''}`}
                      style={{ height: `${height}%` }}
                      title={`${monthLabel(point.key)}: ${formatCurrency(point.total)}`}
                    />
                  </div>
                  <span className={`trend-bar-label ${isSelected ? 'trend-bar-label-active' : ''}`}>{monthLabelShort(point.key)}</span>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </>
  );
}
