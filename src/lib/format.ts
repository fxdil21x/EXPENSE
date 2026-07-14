export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDateTitle = (date: string) =>
  new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }).format(
    new Date(`${date}T00:00:00`),
  );

export const formatHeaderDate = () =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

export const formatTime = (ms: number | null) =>
  ms
    ? new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(ms))
    : '';

export const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const monthLabel = (key: string) => {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
};

export const monthLabelShort = (key: string) => {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date(year, month - 1, 1));
};

export const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

export const lastNMonthKeys = (n: number, from: Date = new Date()) => {
  return Array.from({ length: n }, (_, idx) => {
    const d = new Date(from.getFullYear(), from.getMonth() - (n - 1 - idx), 1);
    return monthKey(d);
  });
};
