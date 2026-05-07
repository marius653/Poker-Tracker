import { HAND_RANKINGS } from '../state/pokerConstants.js';
import '../styles/handRankingsScale.css';

export default function HandRankingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop active"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="hand-rankings-modal">
        <div className="hand-rankings-head">
          <div>
            <h2>Poker Hand Rankings</h2>
            <p className="muted"> </p>
          </div>
          <button type="button" className="btn btn-gray btn-small" onClick={onClose}>
            Lukk
          </button>
        </div>

        <div className="hand-rankings-grid">
          {HAND_RANKINGS.map((hand) => (
            <div className="hand-rank-card" key={hand.rank}>
              <div className="hand-rank-number">{hand.rank}</div>
              <div>
                <div className="hand-rank-title">{hand.title}</div>
                <div className="hand-rank-desc">{hand.desc}</div>
              </div>
              <div className="playing-cards">
                {hand.cards.map(([card, className], index) => (
                  <div className={`mini-card ${className}`} key={`${card}-${index}`}>
                    {card}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
