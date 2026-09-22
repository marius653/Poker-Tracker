export const BLIND_PACE_OPTIONS = [
  {
    key: 'simple',
    label: 'Enkel',
    description: 'Færre nivåer og større blindhopp',
    targetMinutesPerLevel: 25,
    minLevels: 5,
    maxLevels: 12,
  },
  {
    key: 'balanced',
    label: 'Balansert',
    description: 'Jevn progresjon og moderat nivåtid',
    targetMinutesPerLevel: 20,
    minLevels: 6,
    maxLevels: 16,
  },
  {
    key: 'frequent',
    label: 'Hyppig',
    description: 'Flere nivåer og mindre blindhopp',
    targetMinutesPerLevel: 15,
    minLevels: 8,
    maxLevels: 22,
  },
];

const NICE_BIG_BLIND_MULTIPLIERS = [
  1,
  1.2,
  1.5,
  2,
  2.5,
  3,
  4,
  5,
  6,
  8,
];

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function parseTimeToMinutes(value) {
  const [hours, minutes] = String(value || '').split(':').map(Number);

  if (
    !Number.isInteger(hours)
    || !Number.isInteger(minutes)
    || hours < 0
    || hours > 23
    || minutes < 0
    || minutes > 59
  ) {
    return null;
  }

  return (hours * 60) + minutes;
}

function getPaceOption(pace) {
  return BLIND_PACE_OPTIONS.find((option) => option.key === pace)
    || BLIND_PACE_OPTIONS[1];
}

function getChipValues(chipValues = {}) {
  return Object.values(chipValues)
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
}

function getSmallestChipValue(chipValues = {}) {
  const values = getChipValues(chipValues);

  return values.length ? values[0] : 10;
}

function calculateLevelCount(totalPlayMinutes, pace) {
  const option = getPaceOption(pace);
  const estimated = Math.round(
    totalPlayMinutes / option.targetMinutesPerLevel,
  );

  return clamp(estimated, option.minLevels, option.maxLevels);
}

function distributeLevelDurations(totalPlayMinutes, levelCount) {
  const baseDuration = Math.floor(totalPlayMinutes / levelCount);
  const extraMinutes = totalPlayMinutes - (baseDuration * levelCount);

  return Array.from({ length: levelCount }, (_, index) => (
    baseDuration + (index < extraMinutes ? 1 : 0)
  ));
}

function distributeBreaks(levelCount, requestedBreakCount) {
  const breakCount = Math.min(
    Math.max(0, Math.round(Number(requestedBreakCount) || 0)),
    Math.max(0, levelCount - 1),
  );

  const positions = [];

  for (let breakIndex = 1; breakIndex <= breakCount; breakIndex += 1) {
    let position = Math.round(
      (breakIndex * levelCount) / (breakCount + 1),
    );

    position = clamp(position, 1, levelCount - 1);

    while (positions.includes(position) && position < levelCount - 1) {
      position += 1;
    }

    while (positions.includes(position) && position > 1) {
      position -= 1;
    }

    if (!positions.includes(position)) {
      positions.push(position);
    }
  }

  return positions.sort((a, b) => a - b);
}

function buildRepresentableAmounts(chipValues, maxAmount) {
  const safeMaxAmount = Math.max(0, Math.ceil(maxAmount));
  const representable = new Uint8Array(safeMaxAmount + 1);
  representable[0] = 1;

  for (let amount = 1; amount <= safeMaxAmount; amount += 1) {
    for (const chipValue of chipValues) {
      if (chipValue > amount) break;

      if (representable[amount - chipValue]) {
        representable[amount] = 1;
        break;
      }
    }
  }

  return representable;
}

function buildNiceBigBlindCandidates(maxValue, chipValues) {
  const limit = Math.max(100, Math.ceil(maxValue));
  const rawCandidates = new Set();

  for (let magnitude = 1; magnitude <= limit * 10; magnitude *= 10) {
    NICE_BIG_BLIND_MULTIPLIERS.forEach((multiplier) => {
      const value = Math.round(multiplier * magnitude);

      if (value <= limit * 1.6) {
        rawCandidates.add(value);
      }
    });
  }

  const maximumCandidate = Math.max(...rawCandidates, limit);
  const representable = buildRepresentableAmounts(
    chipValues,
    Math.ceil(maximumCandidate),
  );

  return [...rawCandidates]
    .filter((bb) => (
      bb >= 2
      && bb % 2 === 0
      && representable[bb] === 1
      && representable[Math.floor(bb / 2)] === 1
    ))
    .sort((a, b) => a - b);
}

function findNearestCandidate(candidates, desiredValue, minimumExclusive = 0) {
  const available = candidates.filter((value) => value > minimumExclusive);

  if (!available.length) {
    return null;
  }

  let best = available[0];
  let bestDistance = Math.abs(best - desiredValue);

  for (const candidate of available) {
    const distance = Math.abs(candidate - desiredValue);

    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

function findAtLeastCandidate(candidates, targetValue, minimumExclusive = 0) {
  return candidates.find((value) => (
    value > minimumExclusive
    && value >= targetValue
  )) || null;
}

function buildBlindValues({
  levelCount,
  playerCount,
  startStack,
  chipValues,
}) {
  const safePlayers = Math.max(2, Math.round(Number(playerCount) || 2));
  const safeStartStack = Math.max(1, Number(startStack) || 1);
  const safeLevelCount = Math.max(3, Math.round(Number(levelCount) || 3));
  const totalChips = safePlayers * safeStartStack;
  const physicalChipValues = getChipValues(chipValues);
  const smallestChip = physicalChipValues[0] || 10;

  // The ordinary structure aims for ~15 total BB at the penultimate level.
  // The final level is intentionally harsher, aiming for ~8 total BB,
  // so the tournament is strongly pushed toward finishing on schedule.
  const rawStartBb = Math.max(2, safeStartStack / 125);
  const rawPenultimateBb = Math.max(rawStartBb, totalChips / 15);
  const rawFinalBb = Math.max(rawPenultimateBb * 1.5, totalChips / 8);

  const candidates = buildNiceBigBlindCandidates(
    rawFinalBb * 1.35,
    physicalChipValues.length ? physicalChipValues : [smallestChip],
  );

  if (!candidates.length) {
    throw new Error('Fant ingen blindverdier som kan bygges med chipverdiene.');
  }

  const startBb = findNearestCandidate(candidates, rawStartBb, 0)
    || candidates[0];

  const ordinaryLevelCount = safeLevelCount - 1;
  const penultimateIndex = ordinaryLevelCount - 1;

  let penultimateBb = findNearestCandidate(
    candidates,
    rawPenultimateBb,
    startBb,
  );

  if (!penultimateBb) {
    penultimateBb = candidates[candidates.length - 1];
  }

  const regularValues = [];
  let previousBb = 0;

  for (let index = 0; index < ordinaryLevelCount; index += 1) {
    if (index === 0) {
      regularValues.push(startBb);
      previousBb = startBb;
      continue;
    }

    if (index === penultimateIndex) {
      const finalRegular = Math.max(
        penultimateBb,
        findNearestCandidate(candidates, rawPenultimateBb, previousBb)
          || penultimateBb,
      );

      regularValues.push(finalRegular);
      previousBb = finalRegular;
      continue;
    }

    const progress = index / penultimateIndex;
    const desiredBb = startBb * (
      (rawPenultimateBb / startBb) ** progress
    );

    let bb = findNearestCandidate(candidates, desiredBb, previousBb);

    if (!bb) {
      bb = findAtLeastCandidate(
        candidates,
        previousBb + smallestChip,
        previousBb,
      );
    }

    if (!bb) {
      bb = previousBb + smallestChip;
    }

    regularValues.push(bb);
    previousBb = bb;
  }

  const finalTarget = Math.max(
    rawFinalBb,
    previousBb * 1.5,
  );

  let finalBb = findAtLeastCandidate(
    candidates,
    finalTarget,
    previousBb,
  );

  if (!finalBb) {
    finalBb = findNearestCandidate(
      candidates,
      finalTarget,
      previousBb,
    );
  }

  if (!finalBb) {
    finalBb = previousBb * 2;
  }

  return {
    values: [...regularValues, finalBb],
    totalChips,
    smallestChip,
  };
}

export function formatScheduleMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (!hours) return `${remaining} min`;
  if (!remaining) return `${hours} t`;

  return `${hours} t ${remaining} min`;
}

export function generateAutoBlindSchedule({
  startTime,
  endTime,
  breakCount,
  breakDuration,
  pace = 'balanced',
  playerCount,
  startStack,
  chipValues,
}) {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null) {
    return { error: 'Velg gyldig start- og sluttid.' };
  }

  let totalMinutes = endMinutes - startMinutes;

  // Supports tournaments that cross midnight.
  if (totalMinutes <= 0) {
    totalMinutes += 24 * 60;
  }

  const requestedBreakCount = Math.max(
    0,
    Math.round(Number(breakCount) || 0),
  );
  const safeBreakDuration = Math.max(
    1,
    Math.round(Number(breakDuration) || 10),
  );

  const requestedBreakMinutes = requestedBreakCount * safeBreakDuration;
  const estimatedPlayMinutes = totalMinutes - requestedBreakMinutes;

  if (estimatedPlayMinutes < 30) {
    return {
      error: 'Tidsvinduet er for kort etter at pausene er trukket fra.',
    };
  }

  let levelCount = calculateLevelCount(estimatedPlayMinutes, pace);
  let actualBreakCount = Math.min(requestedBreakCount, levelCount - 1);
  let totalBreakMinutes = actualBreakCount * safeBreakDuration;
  let totalPlayMinutes = totalMinutes - totalBreakMinutes;

  // Recalculate once after break count has been safely limited.
  levelCount = calculateLevelCount(totalPlayMinutes, pace);
  actualBreakCount = Math.min(requestedBreakCount, levelCount - 1);
  totalBreakMinutes = actualBreakCount * safeBreakDuration;
  totalPlayMinutes = totalMinutes - totalBreakMinutes;

  if (totalPlayMinutes < levelCount) {
    return {
      error: 'Tidsvinduet er for kort for det beregnede antallet blindnivåer.',
    };
  }

  const durations = distributeLevelDurations(totalPlayMinutes, levelCount);
  const breakAfterLevels = distributeBreaks(levelCount, actualBreakCount);

  let blindData;

  try {
    blindData = buildBlindValues({
      levelCount,
      playerCount,
      startStack,
      chipValues,
    });
  } catch (error) {
    return {
      error: error?.message || 'Kunne ikke beregne blinds fra chipverdiene.',
    };
  }

  const schedule = [];

  for (let index = 0; index < levelCount; index += 1) {
    const levelNumber = index + 1;
    const bb = blindData.values[index];

    schedule.push({
      level: levelNumber,
      duration: durations[index],
      bb,
      isBreak: false,
    });

    if (breakAfterLevels.includes(levelNumber)) {
      schedule.push({
        level: 'Pause',
        duration: safeBreakDuration,
        bb,
        isBreak: true,
        afterLevel: levelNumber,
      });
    }
  }

  return {
    error: null,
    schedule,
    summary: {
      pace: getPaceOption(pace),
      totalMinutes,
      totalPlayMinutes,
      totalBreakMinutes,
      levelCount,
      breakCount: actualBreakCount,
      breakAfterLevels,
      minLevelDuration: Math.min(...durations),
      maxLevelDuration: Math.max(...durations),
      startBb: blindData.values[0],
      finalBb: blindData.values[blindData.values.length - 1],
      totalChips: blindData.totalChips,
      smallestChip: blindData.smallestChip,
    },
  };
}
