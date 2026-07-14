// Categorical slots for user-defined categories. Fixed order (never cycled per-render) —
// identity is always paired with a visible name/icon label, never color alone.
export const CATEGORY_COLORS: Array<{ bg: string; text: string }> = [
  { bg: '#fef3c7', text: '#92400e' }, // amber
  { bg: '#dbeafe', text: '#1e40af' }, // blue
  { bg: '#fce7f3', text: '#9d174d' }, // pink
  { bg: '#d1fae5', text: '#065f46' }, // green
  { bg: '#ede9fe', text: '#5b21b6' }, // violet
  { bg: '#fee2e2', text: '#991b1b' }, // red
  { bg: '#cffafe', text: '#155e75' }, // cyan
  { bg: '#ffedd5', text: '#9a3412' }, // orange
  { bg: '#ecfccb', text: '#3f6212' }, // lime
  { bg: '#f3f4f6', text: '#374151' }, // gray
];

export function paletteFor(colorIndex: number) {
  return CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];
}
