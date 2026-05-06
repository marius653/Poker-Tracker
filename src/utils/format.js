export function formatNumber(num) {
  return String(num || 0);
}

export function formatTime(totalSec) {
  const safeTotalSec = Math.max(0, Math.floor(Number(totalSec) || 0));
  const minutes = Math.floor(safeTotalSec / 60).toString().padStart(2, '0');
  const seconds = Math.floor(safeTotalSec % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}
