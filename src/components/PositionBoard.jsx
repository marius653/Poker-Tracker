import ChipVisual from './ChipVisual.jsx';
import {
  getCurrentLevel,
  getFirstToActPlayerId,
} from '../state/pokerLogic.js';
import { getChipTypes } from '../state/pokerConstants.js';
import { formatNumber } from '../utils/format.js';
import '../styles/positionBoardToggle.css';
import '../styles/firstToAct.css';
import '../styles/positionBoardMarkers.css';

function isDealerPosition(position) {
  return position === 'Dealer' || position === 'Dealer / Small Blind';
}

function isSmallBlindPosition(position) {
  return position === 'Small Blind' || position === 'Dealer / Small Blind';
}

export default function PositionBoard({ tournamentState, onHide }) {
  const currentLevel = getCurrentLevel(tournamentState);
  const currentBb = currentLevel?.bb || 1;
  const firstToActPlayerId = getFirstToActPlayerId(tournamentState);
  const chipTypes = getChipTypes(tournamentState);

  const whiteChip = chipTypes.find((chip) => chip.key === 'white');
  const redChip = chipTypes.find((chip) => chip.key === 'red');

  const smallBlindMarkerChip = whiteChip
    ? {
        ...whiteChip,
        key: 'position-small-blind',
        name: 'Small Blind',
        value: 'SB',
      }
    : null;

  const bigBlindMarkerChip = redChip
    ? {
        ...redChip,
        key: 'position-big-blind',
        name: 'Big Blind',
        value: 'BB',
      }
    : null;

  return (
    <section className="position-board panel">
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

      <div className="positions-grid position-markers-grid">
        {tournamentState.players.map((player) => {
          const dealer = isDealerPosition(player.currentPosition);
          const smallBlind = isSmallBlindPosition(player.currentPosition);
          const bigBlind = player.currentPosition === 'Big Blind';
          const firstToAct = player.id === firstToActPlayerId;
          const showPositionText = player.eliminated || dealer || smallBlind || bigBlind;

          return (
            <div
              className={`position-card position-card-with-markers ${
                player.eliminated ? 'eliminated' : ''
              } ${dealer ? 'dealer-highlight' : ''} ${
                firstToAct ? 'first-to-act-highlight' : ''
              }`}
              key={player.id}
            >
              <div className="position-role-markers" aria-hidden="true">
                {dealer && (
                  <span className="position-dealer-button" title="Dealer">
                    D
                  </span>
                )}

                {smallBlind && smallBlindMarkerChip && (
                  <ChipVisual
                    chip={smallBlindMarkerChip}
                    size={46}
                    className="position-role-chip"
                  />
                )}

                {bigBlind && bigBlindMarkerChip && (
                  <ChipVisual
                    chip={bigBlindMarkerChip}
                    size={46}
                    className="position-role-chip"
                  />
                )}

                {firstToAct && (
                  <span
                    className="position-to-act-arrow"
                    title="Først til å handle"
                  />
                )}
              </div>

              <div
                className="pos-name"
                style={{ visibility: showPositionText ? 'visible' : 'hidden' }}
                aria-hidden={!showPositionText}
              >
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
