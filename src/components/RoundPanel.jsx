import RoundPlayerCard from './RoundPlayerCard.jsx';
import WinnerSelection from './WinnerSelection.jsx';
import { STREETS } from '../state/pokerConstants.js';
import {
  addChipToPlayer,
  createHandStateWithBlinds,
  finalizeRound,
  nextStreet,
  prevStreet,
  removeChipFromPlayer,
  setAllIn,
  setFolded,
} from '../state/pokerLogic.js';
import { formatNumber } from '../utils/format.js';
import '../styles/roundPanel.css';

const STREET_LABELS = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

export default function RoundPanel({
  isOpen,
  tournamentState,
  setTournamentState,
  onClose,
}) {
  if (!isOpen) return null;

  const handState = tournamentState.handState;
  const currentStreet = handState.streetIndex < STREETS.length
    ? STREETS[handState.streetIndex]
    : null;

  const stageTitle = currentStreet
    ? STREET_LABELS[currentStreet]
    : 'Velg vinner(e)';

  function updateState(updater) {
    setTournamentState((currentState) => updater(currentState));
  }

  function handleAddChip(playerId, chipKey) {
    updateState((currentState) => addChipToPlayer(currentState, playerId, chipKey));
  }

  function handleRemoveChip(playerId, chipKey) {
    updateState((currentState) => removeChipFromPlayer(currentState, playerId, chipKey));
  }

  function handleSetFolded(playerId, folded) {
    updateState((currentState) => setFolded(currentState, playerId, folded));
  }

  function handleSetAllIn(playerId, allIn) {
    updateState((currentState) => setAllIn(currentState, playerId, allIn));
  }

  function handlePrevStreet() {
    updateState((currentState) => prevStreet(currentState));
  }

  function handleNextStreet() {
    if (currentStreet) {
      updateState((currentState) => nextStreet(currentState));
      return;
    }

    setTournamentState((currentState) => {
      const result = finalizeRound(currentState);

      if (result.error) {
        window.alert(result.error);
        return currentState;
      }

      return result.state;
    });
  }

  function handleResetRound() {
    const confirmed = window.confirm('Vil du resette denne runden? Blinds legges inn på nytt.');

    if (!confirmed) return;

    setTournamentState((currentState) => createHandStateWithBlinds({
      ...currentState,
      currentPot: 0,
    }));
  }

  function handleToggleWinner(potIndex, playerId, checked) {
    setTournamentState((currentState) => {
      const nextState = structuredClone(currentState);
      const existing = new Set(nextState.handState.winnersByPot[potIndex] || []);

      if (checked) {
        existing.add(playerId);
      } else {
        existing.delete(playerId);
      }

      nextState.handState.winnersByPot[potIndex] = [...existing];

      return nextState;
    });
  }

  return (
    <div
      className="modal-backdrop active"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="round-panel-modal">
        <div className="round-panel-head">
          <div>
            <h2>Rundevindu</h2>
            <p className="round-small-note">
              Blinds legges automatisk på preflop ved ny runde.
              Venstreklikk på chip legger til, høyreklikk trekker fra.
            </p>
          </div>

          <div className="round-panel-status">
            <div className="round-stage-title">{stageTitle}</div>
            <div className="round-small-note">
              Total pot: {formatNumber(tournamentState.currentPot)}
            </div>
          </div>

          <button type="button" className="btn btn-gray btn-small" onClick={onClose}>
            Lukk
          </button>
        </div>

        <div className="street-tabs">
          {STREETS.map((street, index) => (
            <div
              className={`street-tab ${handState.streetIndex === index ? 'active' : ''}`}
              key={street}
            >
              {street.toUpperCase()}
            </div>
          ))}

          <div className={`street-tab ${!currentStreet ? 'active' : ''}`}>
            SHOWDOWN
          </div>
        </div>

        {currentStreet ? (
          <div className="round-chip-grid">
            {tournamentState.players.map((player) => (
              <RoundPlayerCard
                key={player.id}
                player={player}
                handState={handState}
                currentStreet={currentStreet}
                tournamentState={tournamentState}
                onAddChip={handleAddChip}
                onRemoveChip={handleRemoveChip}
                onSetFolded={handleSetFolded}
                onSetAllIn={handleSetAllIn}
              />
            ))}
          </div>
        ) : (
          <WinnerSelection
            tournamentState={tournamentState}
            onToggleWinner={handleToggleWinner}
          />
        )}

        <div className="round-panel-footer">
          <div className="round-footer-left">
            <button
              type="button"
              className="btn btn-gray"
              onClick={handlePrevStreet}
              disabled={handState.streetIndex <= 0}
            >
              Tilbake
            </button>

            <button type="button" className="btn btn-yellow" onClick={handleNextStreet}>
              {currentStreet === 'river'
                ? 'Neste (velg vinner)'
                : currentStreet
                  ? 'Neste'
                  : 'Avslutt runde'}
            </button>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleResetRound}>
            Reset runde
          </button>
        </div>
      </div>
    </div>
  );
}
