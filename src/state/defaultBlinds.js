export const DEFAULT_BLINDS = [
  { level: 1, duration: 30, bb: 20 },
  { level: 2, duration: 30, bb: 40 },
  { level: 3, duration: 30, bb: 60 },
  { level: 4, duration: 30, bb: 80 },
  { level: 5, duration: 20, bb: 100 },
  { level: 6, duration: 20, bb: 120 },
  { level: 7, duration: 20, bb: 140 },
  { level: 8, duration: 20, bb: 160 },
  { level: 9, duration: 15, bb: 200 },
  { level: 10, duration: 15, bb: 300 },
  { level: 11, duration: 15, bb: 400 },
  { level: 12, duration: 15, bb: 500 },
  { level: 13, duration: 10, bb: 600 },
  { level: 14, duration: 10, bb: 800 },
  { level: 15, duration: 10, bb: 1000 },
  { level: 16, duration: 10, bb: 1400 },
];

export function normalizeBlindLevels(blindLevels) {
  return blindLevels.map((entry, index) => {
    const bb = Number(entry.bb) || 20;
    const duration = Number(entry.duration) || 15;
    return { level: index + 1, duration, bb, sb: Math.max(1, Math.floor(bb / 2)) };
  });
}
