import { CHIP_TYPES } from '../state/pokerConstants.js';
import { chipStateAmount, getRemainingChipsForPlayer } from '../state/pokerLogic.js';
import { formatNumber } from '../utils/format.js';

export default function RoundPlayerCard({
  player,
  handState,
  currentStreet,
  tournamentState,
  onAddChip,
  onRemoveChip,
  onSetFolded,
  onSetAllIn,
}) {
  const chips = currentStreet
    ? handState.streetBets[currentStreet][player.id]
    : null;

  const streetAmount = chips ? chipStateAmount(chips) : 0;
  const committed = handState.totalCommitted[player.id] || 0;
  const remaining = getRemainingChipsForPlayer(tournamentState, player.id);

  const isFolded = Boolean(handState.folded[player.id]);
  const isAllIn = Boolean(handState.allIn[player.id]);

  const cardClasses = [
    'round-player-card',
    player.eliminated ? 'eliminated' : '',
    isFolded ? 'folded' : '',
  ].join(' ');

  return (
    <div className={cardClasses}>
      <div className="round-player-head">
        <div>
          <div className="round-player-name">{player.name}</div>
          <div className="round-player-meta">
            {player.eliminated ? 'Slått ut' : player.currentPosition}
            {isAllIn && !player.eliminated ? ' • All-in' : ''}
          </div>
        </div>

        <div className="round-player-stack">
          Stack igjen: {formatNumber(remaining)}
        </div>
      </div>

      {currentStreet && (
        <>
          <div className="chip-row">
            {CHIP_TYPES.map((chip) => (
              <button
                type="button"
                key={chip.key}
                className={`chip-btn ${chip.className}`}
                onClick={() => onAddChip(player.id, chip.key)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  onRemoveChip(player.id, chip.key);
                }}
                title="Venstreklikk legger til. Høyreklikk trekker fra."
              >
                {chip.label}

                {chips?.[chip.key] > 0 && (
                  <span className="chip-count">{chips[chip.key]}</span>
                )}
              </button>
            ))}
          </div>

          <div className="round-player-summary">
            <div>
              Denne streeten: <strong>{formatNumber(streetAmount)}</strong>
            </div>
            <div>
              Totalt i potten: <strong>{formatNumber(committed)}</strong>
            </div>
          </div>

          <div className="round-player-controls">
            <label className="inline-check">
              <input
                type="checkbox"
                checked={isFolded}
                onChange={(event) => onSetFolded(player.id, event.target.checked)}
              />
              Fold
            </label>

            <label className="inline-check">
              <input
                type="checkbox"
                checked={isAllIn}
                onChange={(event) => onSetAllIn(player.id, event.target.checked)}
              />
              All-in
            </label>
          </div>
        </>
      )}
    </div>
  );
}
