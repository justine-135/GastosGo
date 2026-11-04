// Formatting helpers — currency, dates. Used across all screens.

export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPesoCompact(amount: number): string {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}K`;
  return formatPeso(amount);
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function monthAbbr(month: number): string {
  return MONTH_NAMES[month - 1] ?? '';
}

export function monthFull(month: number): string {
  return MONTH_NAMES_FULL[month - 1] ?? '';
}

export function formatMonthYear(month: number, year: number): string {
  return `${MONTH_NAMES_FULL[month - 1]} ${year}`;
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isoDate === today.toISOString().split('T')[0]) return 'Today';
  if (isoDate === yesterday.toISOString().split('T')[0]) return 'Yesterday';

  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export function formatFullDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function getLast6Months(): Array<{ month: number; year: number }> {
  const result: Array<{ month: number; year: number }> = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return result;
}
