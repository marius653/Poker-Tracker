import {
  getCurrentLevel,
  getFirstToActPlayerId,
} from '../state/pokerLogic.js';
import { formatNumber } from '../utils/format.js';
import '../styles/positionBoardToggle.css';
import '../styles/firstToAct.css';
import '../styles/positionBoardArc.css';

export default function PositionBoard({ tournamentState, onHide }) {
  const currentLevel = getCurrentLevel(tournamentState);
  const currentBb = currentLevel?.bb || 1;
  const firstToActPlayerId = getFirstToActPlayerId(tournamentState);
  const displayedPlayers = [...tournamentState.players].reverse();
  const seatCount = displayedPlayers.length;

  return (
    <section className="position-board panel arc-board-shell">
      {onHide && (
        <button
          type="button"
          className="position-board-close"
          onClick={onHide}
          aria-label="Skjul spillerpanel"
          title="Skjul spillerpanel"
        >
          ×
        </button>
      )}

      <div className="row position-board-head">
        <div className="round-label">
          Runde: <span>{tournamentState.roundNumber}</span>
        </div>
      </div>

      <div className="positions-grid arc-positions-grid">
        {displayedPlayers.map((player, seatIndex) => {
          const centerIndex = (seatCount - 1) / 2;
          const normalizedDistance = Math.abs(seatIndex - centerIndex) / Math.max(1, centerIndex);
          const seatDrop = Math.round((1 - normalizedDistance) * 22);

          return (
            <div
              className={`position-card arc-seat ${player.eliminated ? 'eliminated' : ''} ${
                player.currentPosition === 'Dealer' ? 'dealer-highlight' : ''
              } ${
                player.id === firstToActPlayerId ? 'first-to-act-highlight' : ''
              }`}
              key={player.id}
              style={{ '--seat-drop': `${seatDrop}px` }}
            >
              <div className="position-seat-markers">
                {player.currentPosition === 'Dealer' && (
                  <span className="position-marker marker-dealer" title="Dealer" aria-label="Dealer">D</span>
                )}
                {player.currentPosition === 'Small Blind' && (
                  <span className="position-marker marker-small-blind" title="Small Blind" aria-label="Small Blind">SB</span>
                )}
                {player.currentPosition === 'Big Blind' && (
                  <span className="position-marker marker-big-blind" title="Big Blind" aria-label="Big Blind">BB</span>
                )}
                {player.id === firstToActPlayerId && (
                  <span className="position-marker marker-to-act" title="To act" aria-label="To act" />
                )}
              </div>

              <div className="pos-name">
                {player.eliminated ? 'Slått ut' : player.currentPosition}
              </div>
              <div className="position-player-name">{player.name}</div>
              <div className="small-note">Stack: {formatNumber(player.chips)}</div>
              <div className="small-note">
                {player.chips > 0 ? Math.floor(player.chips / currentBb) : 0} BB
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
