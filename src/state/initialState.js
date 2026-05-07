export function createInitialTournamentState() {
  return {
    players: [],
    blinds: [],
    startStack: 2500,
    currentLevelIndex: 0,
    timeRemainingSec: 0,
    levelEndsAt: null,
    timerRunning: false,
    currentPot: 0,
    roundNumber: 1,
    dealerIndex: -1,
    handState: null,
  };
}

export function createDisplaySettingsDefaults() {
  return {
    timerScale: 1.18,
    ringSegmentScale: 1.12,
    timerSegmentCount: 72,
    blindScale: 1.2,
    positionScale: 1.16,
    setupScale: 1.08,
    buttonScale: 1.12,
    handRankingsScale: 1,
    controlPanelScale: 1,
  };
}
