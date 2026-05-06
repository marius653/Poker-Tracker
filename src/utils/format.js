export function formatNumber(num) { return String(num || 0); }
export function formatTime(totalSec) {
  const safe = Math.max(0, Math.floor(Number(totalSec) || 0));
  return `${Math.floor(safe / 60).toString().padStart(2, '0')}:${Math.floor(safe % 60).toString().padStart(2, '0')}`;
}
