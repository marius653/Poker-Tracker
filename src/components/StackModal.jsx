import { useEffect, useState } from 'react';

export default function StackModal({ isOpen, players, onClose, onSave }) {
  const [stackValues, setStackValues] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStackValues(players.map((player) => player.chips));
    }
  }, [isOpen, players]);

  if (!isOpen) return null;

  function handleStackChange(index, value) {
    setStackValues((currentValues) =>
      currentValues.map((currentValue, currentIndex) => {
        return currentIndex === index ? value : currentValue;
      }),
    );
  }

  return (
    <div
      className="modal-backdrop active"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="utility-line">
          <div>
            <h3>Endre stacks</h3>
            <p className="small-note modal-note">Sett stack til 0 for å slå ut spiller.</p>
          </div>
          <button type="button" className="btn btn-gray btn-small" onClick={onClose}>
            Lukk
          </button>
        </div>

        <div className="edit-grid">
          {players.map((player, index) => (
            <div className="edit-card" key={player.id}>
              <div className="edit-card-name">{player.name}</div>
              <div className="small-note modal-note">
                {player.eliminated ? 'Slått ut' : player.currentPosition}
              </div>
              <input
                type="number"
                min="0"
                step="10"
                value={stackValues[index] ?? 0}
                onChange={(event) => handleStackChange(index, event.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="footer-actions align-end">
          <button type="button" className="btn btn-primary" onClick={() => onSave(stackValues)}>
            Lagre
          </button>
        </div>
      </div>
    </div>
  );
}
