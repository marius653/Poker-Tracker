import { normalizeBlindLevels } from './defaultBlinds.js';
import { POSITION_MAP } from './pokerConstants.js';
import {
  applyPositionsForRound,
  createHandStateWithBlinds,
  getCurrentLevel,
} from './pokerLogic.js';

export function createPlayer({ name, index, playerCount, startStack }) {
  const id = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `p_${Date.now()}_${index}`;

  return {
    id,
    seatIndex: index,
    name: name?.trim() || `Spiller ${index + 1}`,
    chips: startStack,
    active: true,
    eliminated: false,
    currentPosition: POSITION_MAP[playerCount]?.[index] || 'Spiller',
  };
}

export function startTournamentFromSetup({ currentState, playerNames, blindLevels, startStack }) {
  const parsedStartStack = Number(startStack) || 2500;
  const playerCount = playerNames.length;

  let nextState = {
    ...currentState,
    players: playerNames.map((name, index) => createPlayer({
      name,
      index,
      playerCount,
      startStack: parsedStartStack,
    })),
    blinds: normalizeBlindLevels(blindLevels),
    startStack: parsedStartStack,
    currentLevelIndex: 0,
    currentPot: 0,
    roundNumber: 1,
    dealerIndex: playerCount - 1,
    timerRunning: false,
    levelEndsAt: null,
    handState: null,
  };

  const firstLevel = getCurrentLevel(nextState);
  nextState.timeRemainingSec = firstLevel.duration * 60;
  nextState.levelEndsAt = null;

  nextState = applyPositionsForRound(nextState);
  nextState = createHandStateWithBlinds(nextState);

  return nextState;
}

export function toggleTimer(state) {
  if (state.timerRunning) {
    const timeRemainingSec = state.levelEndsAt
      ? Math.max(0, Math.ceil((state.levelEndsAt - Date.now()) / 1000))
      : state.timeRemainingSec;

    return {
      ...state,
      timerRunning: false,
      levelEndsAt: null,
      timeRemainingSec,
    };
  }

  return {
    ...state,
    timerRunning: true,
    levelEndsAt: Date.now() + (state.timeRemainingSec * 1000),
  };
}

export function changeLevel(state, delta) {
  const nextIndex = Math.max(0, Math.min(
    state.blinds.length - 1,
    state.currentLevelIndex + delta,
  ));

  if (nextIndex === state.currentLevelIndex) return state;

  const nextState = {
    ...state,
    currentLevelIndex: nextIndex,
  };

  const current = getCurrentLevel(nextState);
  nextState.timeRemainingSec = current.duration * 60;
  nextState.levelEndsAt = nextState.timerRunning
    ? Date.now() + (nextState.timeRemainingSec * 1000)
    : null;

  return nextState;
}

export function updateTimerFromClock(state, now = Date.now()) {
  if (!state.timerRunning) {
    return {
      state,
      levelChanged: false,
    };
  }

  let nextState = {
    ...state,
  };

  if (!nextState.levelEndsAt) {
    nextState.levelEndsAt = now + (nextState.timeRemainingSec * 1000);
  }

  let levelChanged = false;

  while (
    nextState.levelEndsAt <= now
    && nextState.currentLevelIndex < nextState.blinds.length - 1
  ) {
    nextState.currentLevelIndex += 1;
    nextState.levelEndsAt += getCurrentLevel(nextState).duration * 60 * 1000;
    levelChanged = true;
  }

  nextState.timeRemainingSec = Math.max(
    0,
    Math.ceil((nextState.levelEndsAt - now) / 1000),
  );

  if (
    nextState.timeRemainingSec <= 0
    && nextState.currentLevelIndex >= nextState.blinds.length - 1
  ) {
    nextState.timeRemainingSec = 0;
    nextState.levelEndsAt = null;
    nextState.timerRunning = false;
  }

  return {
    state: nextState,
    levelChanged,
  };
}

export function saveEditedStacks(state, stackValues) {
  let nextState = {
    ...state,
    players: state.players.map((player, index) => {
      const chips = Math.max(0, Number(stackValues[index]) || 0);

      return {
        ...player,
        chips,
        eliminated: chips <= 0,
        active: chips > 0,
      };
    }),
  };

  nextState = applyPositionsForRound(nextState);

  return nextState;
}
