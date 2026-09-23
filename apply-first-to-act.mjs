import fs from 'node:fs';

const positionBoardPath = 'src/components/PositionBoard.jsx';
const pokerLogicPath = 'src/state/pokerLogic.js';

let positionBoard = fs.readFileSync(positionBoardPath, 'utf8');
let pokerLogic = fs.readFileSync(pokerLogicPath, 'utf8');

function replaceRequired(text, from, to, label) {
  if (!text.includes(from)) {
    throw new Error(
      `Fant ikke forventet kode for "${label}". Ingen eksisterende filer ble skrevet.`,
    );
  }

  return text.replace(from, to);
}

pokerLogic = replaceRequired(
  pokerLogic,
  `    winnersByPot: {},
  };`,
  `    winnersByPot: {},
    firstToActByStreet: {},
  };`,
  'firstToActByStreet state',
);

pokerLogic = replaceRequired(
  pokerLogic,
  `export function createHandStateWithBlinds(state) {
  const nextState = cloneState(state);
  nextState.handState = createHandState(nextState.players);

  return autoPostBlinds(nextState);
}`,
  `export function createHandStateWithBlinds(state) {
  let nextState = cloneState(state);
  nextState.handState = createHandState(nextState.players);
  nextState = autoPostBlinds(nextState);

  snapshotFirstToActForStreetInPlace(nextState, 'preflop');

  return nextState;
}`,
  'preflop first actor snapshot',
);

pokerLogic = replaceRequired(
  pokerLogic,
  `export function getStreetName(state) {
  return STREETS[state.handState?.streetIndex];
}`,
  `export function getStreetName(state) {
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
}`,
  'first actor helpers',
);

pokerLogic = replaceRequired(
  pokerLogic,
  `export function nextStreet(state) {
  const nextState = cloneState(state);

  if (nextState.handState.streetIndex < STREETS.length - 1) {
    nextState.handState.streetIndex += 1;
    return nextState;
  }

  nextState.handState.streetIndex = STREETS.length;

  return nextState;
}`,
  `export function nextStreet(state) {
  const nextState = cloneState(state);

  if (nextState.handState.streetIndex < STREETS.length - 1) {
    nextState.handState.streetIndex += 1;

    const street = STREETS[nextState.handState.streetIndex];
    snapshotFirstToActForStreetInPlace(nextState, street);

    return nextState;
  }

  nextState.handState.streetIndex = STREETS.length;

  return nextState;
}`,
  'street first actor snapshot',
);

positionBoard = replaceRequired(
  positionBoard,
  `import { getCurrentLevel } from '../state/pokerLogic.js';`,
  `import {
  getCurrentLevel,
  getFirstToActPlayerId,
} from '../state/pokerLogic.js';`,
  'PositionBoard pokerLogic import',
);

positionBoard = replaceRequired(
  positionBoard,
  `import '../styles/positionBoardToggle.css';`,
  `import '../styles/positionBoardToggle.css';
import '../styles/firstToAct.css';`,
  'firstToAct stylesheet import',
);

positionBoard = replaceRequired(
  positionBoard,
  `  const currentLevel = getCurrentLevel(tournamentState);
  const currentBb = currentLevel?.bb || 1;`,
  `  const currentLevel = getCurrentLevel(tournamentState);
  const currentBb = currentLevel?.bb || 1;
  const firstToActPlayerId = getFirstToActPlayerId(tournamentState);`,
  'first actor lookup',
);

positionBoard = replaceRequired(
  positionBoard,
  `            className={\`position-card \${player.eliminated ? 'eliminated' : ''} \${
              player.currentPosition === 'Dealer' ? 'dealer-highlight' : ''
            }\`}`,
  `            className={\`position-card \${player.eliminated ? 'eliminated' : ''} \${
              player.currentPosition === 'Dealer' ? 'dealer-highlight' : ''
            } \${
              player.id === firstToActPlayerId ? 'first-to-act-highlight' : ''
            }\`}`,
  'first actor card class',
);

fs.writeFileSync(pokerLogicPath, pokerLogic, 'utf8');
fs.writeFileSync(positionBoardPath, positionBoard, 'utf8');

console.log('Første spiller til å handle er lagt inn på spillerpanelet.');
console.log('Markeringen låses per street og flytter seg først ved neste street.');
console.log('Kjør npm run build og test før commit.');
