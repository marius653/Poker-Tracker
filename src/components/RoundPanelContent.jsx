import RoundPlayerCard from './RoundPlayerCard.jsx';
import ShowdownPanel from './ShowdownPanel.jsx';
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
import '../styles/showdownFix.css';

const STREET_LABELS = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

export default function RoundPanelContent({
  tournamentState,
  setTournamentState,
  onClose,
  headerAction = null,
  variant = 'default',
}) {
  const handState = tournamentState.handState;
  const isControlVariant = variant === 'control';

  if (!handState) {
    return (
      <div className="round-panel-inner">
        {!isControlVariant && (
          <div className="round-panel-head">
            <div>
              <h2>Rundevindu</h2>
              <p className="round-small-note">Ingen aktiv runde.</p>
            </div>

            {headerAction}
          </div>
        )}
      </div>
    );
  }

  const streetIndex = Number(handState.streetIndex) || 0;
  const currentStreet = streetIndex >= 0 && streetIndex < STREETS.length
    ? STREETS[streetIndex]
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
      const existing = new Set(nextState.handState.winnersByPot?.[potIndex] || []);

      if (!nextState.handState.winnersByPot) {
        nextState.handState.winnersByPot = {};
      }

      if (checked) {
        existing.add(playerId);
      } else {
        existing.delete(playerId);
      }

      nextState.handState.winnersByPot[potIndex] = [...existing];

      return nextState;
    });
  }

  const streetTabs = (
    <div className="street-tabs">
      {STREETS.map((street, index) => (
        <div
          className={`street-tab ${streetIndex === index ? 'active' : ''}`}
          key={street}
        >
          {street.toUpperCase()}
        </div>
      ))}

      <div className={`street-tab ${!currentStreet ? 'active' : ''}`}>
        SHOWDOWN
      </div>
    </div>
  );

  return (
    <div className={`round-panel-inner ${isControlVariant ? 'round-panel-inner-control' : ''}`}>
      {!isControlVariant && (
        <div className="round-panel-head">
          <div>
            <h2>Rundevindu</h2>
            <p className="round-small-note">
              Blinds legges automatisk på preflop ved ny runde.
              Trykk chip/pluss for å legge til. Minus trekker fra.
            </p>
          </div>

          <div className="round-panel-status">
            <div className="round-stage-title">{stageTitle}</div>
            <div className="round-small-note">
              Total pot: {formatNumber(tournamentState.currentPot)}
            </div>
          </div>

          {headerAction ?? (
            <button type="button" className="btn btn-gray btn-small" onClick={onClose}>
              Lukk
            </button>
          )}
        </div>
      )}

      {!isControlVariant && streetTabs}

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
        <ShowdownPanel
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
            disabled={streetIndex <= 0}
          >
            Tilbake
          </button>

          <button type="button" className="btn btn-yellow" onClick={handleNextStreet}>
            {currentStreet === 'river'
              ? 'Velg vinner'
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
  );
}
