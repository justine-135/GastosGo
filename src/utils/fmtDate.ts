export function fmtDate(dateStr: string, todayStr: string): string {
  if (dateStr === todayStr) return 'Today';

  const todayParts = todayStr.split('-').map(Number);
  const yesterday = new Date(todayParts[0], todayParts[1] - 1, todayParts[2] - 1);
  const yesterdayStr = [
    yesterday.getFullYear(),
    String(yesterday.getMonth() + 1).padStart(2, '0'),
    String(yesterday.getDate()).padStart(2, '0'),
  ].join('-');

  if (dateStr === yesterdayStr) return 'Yesterday';

  const parts = dateStr.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}
