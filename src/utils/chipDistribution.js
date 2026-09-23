import { getChipTypes } from '../state/pokerConstants.js';

export const CHIP_STACK_TARGET_SHARES = [0.032, 0.128, 0.24, 0.40, 0.20];

const SHARE_WEIGHTS = [1.15, 1.9, 1.7, 1.25, 0.9];

function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));

  while (y) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }

  return x;
}

function extendedGcd(a, b) {
  if (b === 0) {
    return { gcd: Math.abs(a), x: a >= 0 ? 1 : -1, y: 0 };
  }

  const next = extendedGcd(b, a % b);

  return {
    gcd: next.gcd,
    x: next.y,
    y: next.x - Math.trunc(a / b) * next.y,
  };
}

function ceilDiv(a, b) {
  return Math.ceil(a / b);
}

function floorDiv(a, b) {
  return Math.floor(a / b);
}

function buildCountCandidates(targetCount, maxCount, expansion = 1) {
  const safeMax = Math.max(0, Math.floor(maxCount));
  const center = Math.max(0, Number(targetCount) || 0);
  const radius = Math.min(
    safeMax,
    Math.max(10, Math.ceil(center * 0.8), 8 * expansion),
  );
  const start = Math.max(0, Math.floor(center - radius));
  const end = Math.min(safeMax, Math.ceil(center + radius));
  const candidates = new Set([0, 1, 2, safeMax]);

  for (let value = start; value <= end; value += 1) {
    candidates.add(value);
  }

  for (let value = 0; value <= Math.min(8, safeMax); value += 1) {
    candidates.add(value);
  }

  return [...candidates]
    .filter((value) => value >= 0 && value <= safeMax)
    .sort((a, b) => {
      const distance = Math.abs(a - center) - Math.abs(b - center);
      return distance || a - b;
    });
}

function calculateDistributionScore({
  counts,
  chips,
  startStack,
  earlyMaxBb,
}) {
  let score = 0;

  counts.forEach((count, index) => {
    const chip = chips[index];
    const actualShare = (count * chip.value) / startStack;
    const targetShare = CHIP_STACK_TARGET_SHARES[index];
    const normalizedDifference = (actualShare - targetShare) / Math.max(0.02, targetShare);

    score += SHARE_WEIGHTS[index] * (normalizedDifference ** 2);

    // Litt av minste valør er nyttig for SB, veksling og spesielle bet-størrelser.
    if (index === 0 && count < 4) {
      score += ((4 - count) ** 2) * 0.15;
    }

    // Rang 2 og 3 er de viktigste arbeidschipene for tidlig 2–3 BB betting.
    if ((index === 1 || index === 2) && count < 6) {
      score += ((6 - count) ** 2) * 0.18;
    }

    // Er største chip veldig stor relativt til de første nivåene, behandles den
    // som reserve. Én er nyttig, flere er ofte unødvendig i startstacken.
    if (
      index === chips.length - 1
      && earlyMaxBb > 0
      && chip.value >= earlyMaxBb * 6
      && count > 1
    ) {
      score += ((count - 1) ** 2) * 0.45;
    }
  });

  const totalChipCount = counts.reduce((sum, count) => sum + count, 0);

  if (totalChipCount > 45) {
    score += ((totalChipCount - 45) ** 2) * 0.008;
  }

  return score;
}

function solveLastTwo({
  valueA,
  valueB,
  remainder,
  targetA,
  targetB,
  evaluate,
}) {
  if (remainder < 0) return;

  const commonDivisor = gcd(valueA, valueB);

  if (remainder % commonDivisor !== 0) return;

  const reducedA = valueA / commonDivisor;
  const reducedB = valueB / commonDivisor;
  const reducedRemainder = remainder / commonDivisor;
  const eg = extendedGcd(reducedA, reducedB);

  const x0 = eg.x * reducedRemainder;
  const y0 = eg.y * reducedRemainder;
  const xStep = reducedB;
  const yStep = reducedA;

  const minT = ceilDiv(-x0, xStep);
  const maxT = floorDiv(y0, yStep);

  if (minT > maxT) return;

  const targetTFromA = (targetA - x0) / xStep;
  const targetTFromB = (y0 - targetB) / yStep;
  const targetT = (targetTFromA + targetTFromB) / 2;

  const candidates = new Set([
    minT,
    maxT,
    Math.floor(targetT),
    Math.ceil(targetT),
    Math.floor(targetTFromA),
    Math.ceil(targetTFromA),
    Math.floor(targetTFromB),
    Math.ceil(targetTFromB),
  ]);

  for (let offset = -3; offset <= 3; offset += 1) {
    candidates.add(Math.round(targetT) + offset);
  }

  candidates.forEach((t) => {
    if (t < minT || t > maxT) return;

    const countA = x0 + (xStep * t);
    const countB = y0 - (yStep * t);

    if (countA < 0 || countB < 0) return;

    evaluate(countA, countB);
  });
}

function findBestExactDistribution({
  chips,
  startStack,
  earlyMaxBb,
  expansion,
}) {
  const targets = chips.map((chip, index) => (
    (startStack * CHIP_STACK_TARGET_SHARES[index]) / chip.value
  ));

  const countSets = chips.slice(0, 3).map((chip, index) => (
    buildCountCandidates(
      targets[index],
      Math.floor(startStack / chip.value),
      expansion,
    )
  ));

  let best = null;

  for (const count0 of countSets[0]) {
    const value0 = count0 * chips[0].value;
    if (value0 > startStack) continue;

    for (const count1 of countSets[1]) {
      const value1 = value0 + (count1 * chips[1].value);
      if (value1 > startStack) continue;

      for (const count2 of countSets[2]) {
        const usedValue = value1 + (count2 * chips[2].value);
        const remainder = startStack - usedValue;

        if (remainder < 0) continue;

        solveLastTwo({
          valueA: chips[3].value,
          valueB: chips[4].value,
          remainder,
          targetA: targets[3],
          targetB: targets[4],
          evaluate: (count3, count4) => {
            const counts = [count0, count1, count2, count3, count4];
            const score = calculateDistributionScore({
              counts,
              chips,
              startStack,
              earlyMaxBb,
            });

            if (!best || score < best.score) {
              best = { counts, score };
            }
          },
        });
      }
    }
  }

  return best;
}

function getEarlyBlindInfo(blindLevels = []) {
  const firstLevels = blindLevels
    .filter((level) => !level?.isBreak)
    .slice(0, 4)
    .map((level) => ({
      sb: Number(level?.sb) || Math.floor((Number(level?.bb) || 0) / 2),
      bb: Number(level?.bb) || 0,
    }))
    .filter((level) => level.bb > 0);

  return {
    levels: firstLevels,
    earlyMaxBb: firstLevels.length
      ? Math.max(...firstLevels.map((level) => level.bb))
      : 0,
  };
}

export function calculateChipDistribution({
  playerCount,
  startStack,
  chipValues,
  blindLevels,
}) {
  const safePlayers = Math.max(1, Math.round(Number(playerCount) || 1));
  const safeStartStack = Math.max(1, Math.round(Number(startStack) || 0));

  const chips = getChipTypes(chipValues)
    .map((chip, originalIndex) => ({ ...chip, originalIndex }))
    .sort((a, b) => a.value - b.value || a.originalIndex - b.originalIndex);

  if (chips.length !== 5) {
    return { error: 'Fordelingen er laget for fem chipverdier.' };
  }

  if (!chips.every((chip) => Number.isFinite(chip.value) && chip.value > 0)) {
    return { error: 'Alle chipverdier må være større enn 0.' };
  }

  const commonDivisor = chips
    .map((chip) => chip.value)
    .reduce((current, value) => gcd(current, value));

  if (safeStartStack % commonDivisor !== 0) {
    return {
      error: `Start stack ${safeStartStack} kan ikke bygges nøyaktig med de valgte chipverdiene.`,
    };
  }

  const { levels, earlyMaxBb } = getEarlyBlindInfo(blindLevels);

  let best = findBestExactDistribution({
    chips,
    startStack: safeStartStack,
    earlyMaxBb,
    expansion: 1,
  });

  if (!best) {
    best = findBestExactDistribution({
      chips,
      startStack: safeStartStack,
      earlyMaxBb,
      expansion: 3,
    });
  }

  if (!best) {
    return {
      error: `Fant ingen praktisk, eksakt fordeling for start stack ${safeStartStack}.`,
    };
  }

  const distribution = chips.map((chip, index) => {
    const count = best.counts[index];
    const stackValue = count * chip.value;

    return {
      ...chip,
      rank: index + 1,
      count,
      stackValue,
      actualShare: stackValue / safeStartStack,
      targetShare: CHIP_STACK_TARGET_SHARES[index],
      totalCount: count * safePlayers,
    };
  });

  return {
    error: null,
    distribution,
    summary: {
      playerCount: safePlayers,
      startStack: safeStartStack,
      chipsPerPlayer: distribution.reduce((sum, item) => sum + item.count, 0),
      totalPhysicalChips: distribution.reduce((sum, item) => sum + item.totalCount, 0),
      totalTournamentValue: safePlayers * safeStartStack,
      earlyLevels: levels,
      earlyMaxBb,
    },
  };
}
