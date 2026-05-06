import { getCurrentLevel } from '../state/pokerLogic.js';
import { formatNumber } from '../utils/format.js';

export default function PositionBoard({ tournamentState }) {
  const currentLevel = getCurrentLevel(tournamentState);
  const currentBb = currentLevel?.bb || 1;

  return (
    <section className="position-board panel">
      <div className="row position-board-head">
        <div className="round-label">
          Runde: <span>{tournamentState.roundNumber}</span>
        </div>
      </div>

      <div className="positions-grid">
        {tournamentState.players.map((player) => (
          <div
            className={`position-card ${player.eliminated ? 'eliminated' : ''} ${
              player.currentPosition === 'Dealer' ? 'dealer-highlight' : ''
            }`}
            key={player.id}
          >
            <div className="pos-name">
              {player.eliminated ? 'Slått ut' : player.currentPosition}
            </div>
            <div className="position-player-name">{player.name}</div>
            <div className="small-note">Stack: {formatNumber(player.chips)}</div>
            <div className="small-note">
              {player.chips > 0 ? Math.floor(player.chips / currentBb) : 0} BB
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
