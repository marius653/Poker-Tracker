import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advancePositionsForNextHand,
  applyPositionsForRound,
  createHandStateWithBlinds,
  getFirstToActPlayerId,
} from './pokerLogic.js';

function makeState(playerCount = 5, dealerIndex = 0) {
  const players = Array.from({ length: playerCount }, (_, index) => ({
    id: `p${index}`,
    seatIndex: index,
    name: `P${index}`,
    chips: 1000,
    active: true,
    eliminated: false,
    currentPosition: '',
  }));

  let state = {
    players,
    blinds: [{ level: 1, duration: 20, sb: 10, bb: 20 }],
    currentLevelIndex: 0,
    currentPot: 0,
    roundNumber: 1,
    dealerIndex,
    smallBlindIndex: -1,
    bigBlindIndex: -1,
    handState: null,
  };

  state = applyPositionsForRound(state);
  state = createHandStateWithBlinds(state);
  return state;
}

function bust(state, ...indices) {
  const next = structuredClone(state);

  indices.forEach((index) => {
    next.players[index].chips = 0;
    next.players[index].eliminated = true;
    next.players[index].active = false;
  });

  return next;
}

test('initial hand derives D/SB/BB from selected dealer', () => {
  const state = makeState(5, 2);

  assert.equal(state.dealerIndex, 2);
  assert.equal(state.smallBlindIndex, 3);
  assert.equal(state.bigBlindIndex, 4);
  assert.equal(state.currentPot, 30);
  assert.equal(state.handState.totalCommitted.p3, 10);
  assert.equal(state.handState.totalCommitted.p4, 20);
});

test('dealer bust does not jump button to an unrelated seat', () => {
  const state = bust(makeState(), 0);
  const next = advancePositionsForNextHand(state);

  assert.equal(next.dealerIndex, 1);
  assert.equal(next.smallBlindIndex, 2);
  assert.equal(next.bigBlindIndex, 3);
});

test('small blind bust creates a dead dealer while BB still advances normally', () => {
  const state = bust(makeState(), 1);
  const next = advancePositionsForNextHand(state);

  assert.equal(next.dealerIndex, 1);
  assert.equal(next.smallBlindIndex, 2);
  assert.equal(next.bigBlindIndex, 3);
  assert.equal(next.players[1].currentPosition, 'Slått ut');
});

test('big blind bust creates a dead small blind and next live player gets BB', () => {
  const state = bust(makeState(), 2);
  let next = advancePositionsForNextHand(state);

  assert.equal(next.dealerIndex, 1);
  assert.equal(next.smallBlindIndex, 2);
  assert.equal(next.bigBlindIndex, 3);

  next = createHandStateWithBlinds(next);

  assert.equal(next.handState.totalCommitted.p2, 0);
  assert.equal(next.handState.totalCommitted.p3, 20);
  assert.equal(next.currentPot, 20);
});

test('a busted future BB seat is skipped without skipping a live player', () => {
  const state = bust(makeState(), 3);
  const next = advancePositionsForNextHand(state);

  assert.equal(next.dealerIndex, 1);
  assert.equal(next.smallBlindIndex, 2);
  assert.equal(next.bigBlindIndex, 4);
});

test('multiple busts may produce both a dead dealer and dead small blind', () => {
  const state = bust(makeState(), 1, 2);
  const next = advancePositionsForNextHand(state);

  assert.equal(next.dealerIndex, 1);
  assert.equal(next.smallBlindIndex, 2);
  assert.equal(next.bigBlindIndex, 3);
});

test('dead positions continue moving on following hands', () => {
  const state = bust(makeState(), 2);
  const handTwo = advancePositionsForNextHand(state);
  const handThree = advancePositionsForNextHand(handTwo);

  assert.equal(handTwo.dealerIndex, 1);
  assert.equal(handTwo.smallBlindIndex, 2);
  assert.equal(handTwo.bigBlindIndex, 3);

  assert.equal(handThree.dealerIndex, 2);
  assert.equal(handThree.smallBlindIndex, 3);
  assert.equal(handThree.bigBlindIndex, 4);
});

test('transition to heads-up uses previous BB as anchor even after multiple busts', () => {
  const state = bust(makeState(4), 0, 2);
  const next = advancePositionsForNextHand(state);

  assert.equal(next.bigBlindIndex, 3);
  assert.equal(next.dealerIndex, 1);
  assert.equal(next.smallBlindIndex, 1);
});

test('transition from three players to heads-up prevents consecutive BB', () => {
  const state = bust(makeState(3), 1);
  const next = advancePositionsForNextHand(state);

  assert.equal(next.bigBlindIndex, 0);
  assert.equal(next.dealerIndex, 2);
  assert.equal(next.smallBlindIndex, 2);
});

test('heads-up alternates BB and keeps dealer equal to SB', () => {
  const state = bust(makeState(3), 1);
  const headsUp = advancePositionsForNextHand(state);
  const next = advancePositionsForNextHand(headsUp);

  assert.equal(headsUp.bigBlindIndex, 0);
  assert.equal(next.bigBlindIndex, 2);
  assert.equal(next.dealerIndex, 0);
  assert.equal(next.smallBlindIndex, 0);
});


test('old saved tournaments migrate blind indices from currentPosition', () => {
  const state = makeState();
  const legacy = structuredClone(state);

  delete legacy.smallBlindIndex;
  delete legacy.bigBlindIndex;
  legacy.players[2].chips = 0;
  legacy.players[2].eliminated = true;
  legacy.players[2].active = false;

  const next = advancePositionsForNextHand(legacy);

  assert.equal(next.dealerIndex, 1);
  assert.equal(next.smallBlindIndex, 2);
  assert.equal(next.bigBlindIndex, 3);
});

test('preflop first-to-act follows BB and heads-up dealer acts first', () => {
  const five = makeState(5);
  assert.equal(getFirstToActPlayerId(five), 'p3');

  const three = bust(makeState(3), 1);
  const headsUp = createHandStateWithBlinds(advancePositionsForNextHand(three));
  assert.equal(getFirstToActPlayerId(headsUp), 'p2');
});
