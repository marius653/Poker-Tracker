import {
  CHIP_TYPES,
  getChipTypes,
  POSITION_MAP,
  STREETS,
} from './pokerConstants.js';

export function getCurrentLevel(state) {
  return state.blinds[state.currentLevelIndex] || state.blinds[state.blinds.length - 1];
}

export function getNextLevel(state) {
  return state.blinds[Math.min(state.currentLevelIndex + 1, state.blinds.length - 1)] || getCurrentLevel(state);
}

export function getCurrentBlindLevel(state) {
  const currentLevel = getCurrentLevel(state);

  if (!currentLevel?.isBreak) return currentLevel;

  for (let index = state.currentLevelIndex + 1; index < state.blinds.length; index += 1) {
    if (!state.blinds[index]?.isBreak) {
      return state.blinds[index];
    }
  }

  for (let index = state.currentLevelIndex - 1; index >= 0; index -= 1) {
    if (!state.blinds[index]?.isBreak) {
      return state.blinds[index];
    }
  }

  return currentLevel;
}

export function emptyChipState() {
  return {
    white: 0,
    red: 0,
    green: 0,
    blue: 0,
    black: 0,
    remainder: 0,
  };
}

export function chipStateAmount(chips, chipTypes = CHIP_TYPES) {
  if (!chips) return 0;

  const chipTotal = chipTypes.reduce((sum, chip) => {
    return sum + ((Number(chips[chip.key]) || 0) * chip.value);
  }, 0);

  return chipTotal + (Number(chips.remainder) || 0);
}

function addAmountToChipStateInPlace(state, chipState, amount) {
  let remaining = Math.max(0, Number(amount) || 0);
  const chipTypes = [...getChipTypes(state)].sort((a, b) => b.value - a.value);

  chipTypes.forEach((chipType) => {
    while (remaining >= chipType.value) {
      chipState[chipType.key] += 1;
      remaining -= chipType.value;
    }
  });

  if (remaining > 0) {
    chipState.remainder = (Number(chipState.remainder) || 0) + remaining;
  }
}

export function cloneState(state) {
  return structuredClone(state);
}

export function getSeatIndicesOfActivePlayers(players) {
  return players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => !player.eliminated && player.chips > 0)
    .map(({ index }) => index);
}

export function calculateDynamicPositions(activeCount) {
  const positionsByActiveCount = {
    1: ['Dealer'],
    2: ['Dealer / Small Blind', 'Big Blind'],
    3: ['Dealer', 'Small Blind', 'Big Blind'],
    4: ['Dealer', 'Small Blind', 'Big Blind', 'Cutoff'],
    5: ['Dealer', 'Small Blind', 'Big Blind', 'Under the Gun', 'Cutoff'],
    6: ['Dealer', 'Small Blind', 'Big Blind', 'Under the Gun', 'Hijack', 'Cutoff'],
    7: ['Dealer', 'Small Blind', 'Big Blind', 'Under the Gun', 'Middle Position', 'Hijack', 'Cutoff'],
    8: ['Dealer', 'Small Blind', 'Big Blind', 'Under the Gun', 'Under the Gun +1', 'Lowjack', 'Hijack', 'Cutoff'],
    9: ['Dealer', 'Small Blind', 'Big Blind', 'Under the Gun', 'Under the Gun +1', 'Middle Position', 'Lowjack', 'Hijack', 'Cutoff'],
  };

  if (positionsByActiveCount[activeCount]) {
    return positionsByActiveCount[activeCount];
  }

  if (activeCount > 9) {
    const base = [...positionsByActiveCount[9]];

    for (let i = 10; i <= activeCount; i += 1) {
      base.splice(base.length - 1, 0, `Seat ${i - 3}`);
    }

    return base;
  }

  return [];
}

export function applyPositionsForRound(state) {
  const nextState = cloneState(state);

  nextState.players = nextState.players.map((player) => {
    const eliminated = player.chips <= 0;

    return {
      ...player,
      eliminated,
      active: !eliminated,
      currentPosition: eliminated ? 'Slått ut' : '',
    };
  });

  const activeIndices = getSeatIndicesOfActivePlayers(nextState.players);

  if (!activeIndices.length) return nextState;

  if (!activeIndices.includes(nextState.dealerIndex)) {
    nextState.dealerIndex = activeIndices[activeIndices.length - 1];
  }

  const orderedSeatIndices = [nextState.dealerIndex];
  const dealerPositionInActive = activeIndices.indexOf(nextState.dealerIndex);

  for (let i = 1; i < activeIndices.length; i += 1) {
    orderedSeatIndices.push(activeIndices[(dealerPositionInActive + i) % activeIndices.length]);
  }

  const labels = calculateDynamicPositions(activeIndices.length);

  orderedSeatIndices.forEach((seatIndex, index) => {
    if (nextState.players[seatIndex]) {
      nextState.players[seatIndex].currentPosition = labels[index] || '';
    }
  });

  return nextState;
}

export function moveDealerToNextActive(state) {
  const nextState = cloneState(state);
  const activeIndices = getSeatIndicesOfActivePlayers(nextState.players);

  if (!activeIndices.length) return nextState;

  const currentPosition = activeIndices.indexOf(nextState.dealerIndex);

  nextState.dealerIndex = currentPosition === -1
    ? activeIndices[0]
    : activeIndices[(currentPosition + 1) % activeIndices.length];

  return applyPositionsForRound(nextState);
}

export function createHandState(players) {
  const handState = {
    streetIndex: 0,
    streetBets: {
      preflop: {},
      flop: {},
      turn: {},
      river: {},
    },
    totalCommitted: {},
    folded: {},
    allIn: {},
    allInSnapshots: {},
    winnersByPot: {},
    firstToActByStreet: {},
  };

  players.forEach((player) => {
    handState.totalCommitted[player.id] = 0;
    handState.folded[player.id] = false;
    handState.allIn[player.id] = false;

    STREETS.forEach((street) => {
      handState.streetBets[street][player.id] = emptyChipState();
    });
  });

  return handState;
}

export function createHandStateWithBlinds(state) {
  let nextState = cloneState(state);
  nextState.handState = createHandState(nextState.players);
  nextState = autoPostBlinds(nextState);

  snapshotFirstToActForStreetInPlace(nextState, 'preflop');

  return nextState;
}

function isSmallBlindPosition(position) {
  return position === 'Small Blind' || position === 'Dealer / Small Blind';
}

export function autoPostBlinds(state) {
  const nextState = cloneState(state);
  const level = getCurrentBlindLevel(nextState);

  if (!level || !nextState.handState) return nextState;

  const smallBlindPlayer = nextState.players.find((player) => {
    return !player.eliminated && player.chips > 0 && isSmallBlindPosition(player.currentPosition);
  });

  const bigBlindPlayer = nextState.players.find((player) => {
    return !player.eliminated && player.chips > 0 && player.currentPosition === 'Big Blind';
  });

  if (smallBlindPlayer) {
    postForcedBetInPlace(nextState, smallBlindPlayer.id, level.sb, 'preflop');
  }

  if (bigBlindPlayer) {
    postForcedBetInPlace(nextState, bigBlindPlayer.id, level.bb, 'preflop');
  }

  return recalcPot(nextState);
}

export function postForcedBetInPlace(state, playerId, amount, street) {
  const player = state.players.find((candidate) => candidate.id === playerId);

  if (!player || player.eliminated || player.chips <= 0) return;

  const amountToPost = Math.min(Math.max(0, Number(amount) || 0), player.chips);
  const chipState = state.handState.streetBets[street][playerId];

  addAmountToChipStateInPlace(state, chipState, amountToPost);

  syncTotalCommittedForPlayerInPlace(state, playerId);

  if (getRemainingChipsForPlayer(state, playerId) === 0) {
    state.handState.allIn[playerId] = true;
  }
}

export function syncTotalCommittedForPlayerInPlace(state, playerId) {
  let total = 0;

  STREETS.forEach((street) => {
    total += chipStateAmount(
      state.handState.streetBets[street][playerId],
      getChipTypes(state),
    );
  });

  state.handState.totalCommitted[playerId] = total;
}

export function recalcPot(state) {
  const nextState = cloneState(state);

  nextState.currentPot = Object.values(nextState.handState?.totalCommitted || {})
    .reduce((sum, value) => sum + (Number(value) || 0), 0);

  return nextState;
}

export function getStreetName(state) {
  return STREETS[state.handState?.streetIndex];
}

function isPlayerEligibleToAct(state, player) {
  if (!player || player.eliminated || player.chips <= 0) return false;

  const playerId = player.id;

  return !state.handState?.folded?.[playerId]
    && !state.handState?.allIn?.[playerId];
}

function getNextEligiblePlayerAfterIndex(state, startIndex) {
  const playerCount = state.players.length;

  for (let offset = 1; offset <= playerCount; offset += 1) {
    const index = (startIndex + offset) % playerCount;
    const player = state.players[index];

    if (isPlayerEligibleToAct(state, player)) {
      return player;
    }
  }

  return null;
}

function calculateFirstToActPlayerId(state, street) {
  if (!state.handState || !street || !state.players.length) return null;

  const eligiblePlayers = state.players.filter((player) => (
    isPlayerEligibleToAct(state, player)
  ));

  if (eligiblePlayers.length < 2) return null;

  const livePlayers = state.players.filter((player) => (
    !player.eliminated && player.chips > 0
  ));

  if (street === 'preflop') {
    if (livePlayers.length === 2) {
      const dealer = state.players[state.dealerIndex];

      if (isPlayerEligibleToAct(state, dealer)) {
        return dealer.id;
      }

      return getNextEligiblePlayerAfterIndex(state, state.dealerIndex)?.id || null;
    }

    const bigBlindIndex = state.players.findIndex((player) => (
      !player.eliminated
      && player.chips > 0
      && player.currentPosition === 'Big Blind'
    ));

    if (bigBlindIndex >= 0) {
      return getNextEligiblePlayerAfterIndex(state, bigBlindIndex)?.id || null;
    }
  }

  return getNextEligiblePlayerAfterIndex(state, state.dealerIndex)?.id || null;
}

function snapshotFirstToActForStreetInPlace(state, street) {
  if (!state.handState || !street) return;

  if (!state.handState.firstToActByStreet) {
    state.handState.firstToActByStreet = {};
  }

  if (Object.prototype.hasOwnProperty.call(
    state.handState.firstToActByStreet,
    street,
  )) {
    return;
  }

  state.handState.firstToActByStreet[street] = calculateFirstToActPlayerId(
    state,
    street,
  );
}

export function getFirstToActPlayerId(state) {
  const street = getStreetName(state);

  if (!street || !state.handState) return null;

  const savedPlayerId = state.handState.firstToActByStreet?.[street];

  if (
    savedPlayerId
    && state.players.some((player) => player.id === savedPlayerId)
  ) {
    return savedPlayerId;
  }

  return calculateFirstToActPlayerId(state, street);
}

export function getRemainingChipsForPlayer(state, playerId) {
  const player = state.players.find((candidate) => candidate.id === playerId);

  if (!player) return 0;

  const committed = state.handState?.totalCommitted?.[playerId] || 0;

  return Math.max(0, player.chips - committed);
}

export function addChipToPlayer(state, playerId, chipKey) {
  const nextState = cloneState(state);
  const street = getStreetName(nextState);
  const chip = getChipTypes(nextState).find((candidate) => candidate.key === chipKey);

  if (!street || !chip) return state;

  const remaining = getRemainingChipsForPlayer(nextState, playerId);

  if (remaining < chip.value) return state;

  nextState.handState.streetBets[street][playerId][chipKey] += 1;
  syncTotalCommittedForPlayerInPlace(nextState, playerId);

  if (getRemainingChipsForPlayer(nextState, playerId) === 0) {
    nextState.handState.allIn[playerId] = true;
  }

  return recalcPot(nextState);
}

export function removeChipFromPlayer(state, playerId, chipKey) {
  const nextState = cloneState(state);
  const street = getStreetName(nextState);

  if (!street) return state;

  const chips = nextState.handState.streetBets[street][playerId];

  if (!chips || chips[chipKey] <= 0) return state;

  chips[chipKey] -= 1;
  syncTotalCommittedForPlayerInPlace(nextState, playerId);

  if (getRemainingChipsForPlayer(nextState, playerId) > 0) {
    nextState.handState.allIn[playerId] = false;

    if (nextState.handState.allInSnapshots) {
      delete nextState.handState.allInSnapshots[playerId];
    }
  }

  return recalcPot(nextState);
}

export function setFolded(state, playerId, folded) {
  const nextState = cloneState(state);

  nextState.handState.folded[playerId] = folded;

  return nextState;
}

export function setAllIn(state, playerId, allIn) {
  const nextState = cloneState(state);
  const street = getStreetName(nextState);

  if (!nextState.handState.allInSnapshots) {
    nextState.handState.allInSnapshots = {};
  }

  if (allIn) {
    if (!street) return state;

    if (!nextState.handState.allIn[playerId]) {
      nextState.handState.allInSnapshots[playerId] = {
        street,
        chips: cloneState(nextState.handState.streetBets[street][playerId]),
      };
    }

    nextState.handState.allIn[playerId] = true;
    pushRemainingStackToCurrentStreetInPlace(nextState, playerId);

    return recalcPot(nextState);
  }

  const snapshot = nextState.handState.allInSnapshots[playerId];

  if (snapshot?.street && snapshot?.chips) {
    nextState.handState.streetBets[snapshot.street][playerId] = cloneState(snapshot.chips);
    syncTotalCommittedForPlayerInPlace(nextState, playerId);
    delete nextState.handState.allInSnapshots[playerId];
  }

  nextState.handState.allIn[playerId] = false;

  return recalcPot(nextState);
}

export function pushRemainingStackToCurrentStreetInPlace(state, playerId) {
  const street = getStreetName(state);

  if (!street) return;

  const remaining = getRemainingChipsForPlayer(state, playerId);

  if (remaining <= 0) return;

  const chipState = state.handState.streetBets[street][playerId];

  addAmountToChipStateInPlace(state, chipState, remaining);
  syncTotalCommittedForPlayerInPlace(state, playerId);
}

export function nextStreet(state) {
  const nextState = cloneState(state);

  if (nextState.handState.streetIndex < STREETS.length - 1) {
    nextState.handState.streetIndex += 1;

    const street = STREETS[nextState.handState.streetIndex];
    snapshotFirstToActForStreetInPlace(nextState, street);

    return nextState;
  }

  nextState.handState.streetIndex = STREETS.length;

  return nextState;
}

export function prevStreet(state) {
  const nextState = cloneState(state);

  if (nextState.handState.streetIndex > 0) {
    nextState.handState.streetIndex -= 1;
  }

  return nextState;
}

export function getEligiblePlayersForPot(state) {
  return state.players.filter((player) => {
    return !player.eliminated && (state.handState.totalCommitted[player.id] || 0) > 0;
  });
}

export function buildSidePots(state) {
  const contributors = getEligiblePlayersForPot(state)
    .map((player) => ({
      playerId: player.id,
      amount: state.handState.totalCommitted[player.id],
      folded: Boolean(state.handState.folded[player.id]),
    }))
    .filter((contributor) => contributor.amount > 0)
    .sort((a, b) => a.amount - b.amount);

  const sidePots = [];
  let previousAmount = 0;

  while (contributors.length) {
    const minimumAmount = contributors[0].amount;
    const potLayer = minimumAmount - previousAmount;
    const activeLayer = contributors.filter((contributor) => contributor.amount >= minimumAmount);
    const totalPot = potLayer * activeLayer.length;
    const eligiblePlayerIds = activeLayer
      .filter((contributor) => !contributor.folded)
      .map((contributor) => contributor.playerId);

    sidePots.push({
      amount: totalPot,
      eligiblePlayerIds,
    });

    previousAmount = minimumAmount;

    while (contributors.length && contributors[0].amount === minimumAmount) {
      contributors.shift();
    }
  }

  return sidePots;
}

export function finalizeRound(state) {
  let nextState = cloneState(state);
  const sidePots = buildSidePots(nextState);
  const winnerSelections = [];

  for (let i = 0; i < sidePots.length; i += 1) {
    const ids = nextState.handState.winnersByPot[i] || [];

    if (!ids.length) {
      return {
        state,
        error: `Velg minst én vinner for pot ${i + 1}`,
      };
    }

    winnerSelections.push(ids);
  }

  nextState.players = nextState.players.map((player) => {
    const committed = nextState.handState.totalCommitted[player.id] || 0;

    return {
      ...player,
      chips: Math.max(0, player.chips - committed),
    };
  });

  sidePots.forEach((pot, index) => {
    const winners = winnerSelections[index];
    const share = Math.floor(pot.amount / winners.length);
    let remainder = pot.amount - (share * winners.length);

    winners.forEach((winnerId, winnerIndex) => {
      const playerIndex = nextState.players.findIndex((player) => player.id === winnerId);

      if (playerIndex === -1) return;

      nextState.players[playerIndex].chips += share;

      if (remainder > 0 && winnerIndex === 0) {
        nextState.players[playerIndex].chips += remainder;
        remainder = 0;
      }
    });
  });

  nextState.players = nextState.players.map((player) => ({
    ...player,
    eliminated: player.chips <= 0,
    active: player.chips > 0,
  }));

  nextState.currentPot = 0;
  nextState.roundNumber += 1;
  nextState = moveDealerToNextActive(nextState);
  nextState = createHandStateWithBlinds(nextState);

  return {
    state: nextState,
    error: null,
  };
}
