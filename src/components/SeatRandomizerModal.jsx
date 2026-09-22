import { useEffect, useState } from 'react';
import '../styles/seatRandomizer.css';

function randomIndex(maxExclusive) {
  if (maxExclusive <= 1) return 0;

  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
}

function sameOrder(first, second) {
  if (!first || !second || first.length !== second.length) return false;
  return first.every((value, index) => value === second[index]);
}

function createShuffledOrder(playerCount, avoidOrder = null) {
  const order = Array.from({ length: playerCount }, (_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }

  if (order.length > 1 && sameOrder(order, avoidOrder)) {
    [order[0], order[1]] = [order[1], order[0]];
  }

  return order;
}

export default function SeatRandomizerModal({
  isOpen,
  playerNames,
  onClose,
  onApply,
}) {
  const [seatOrder, setSeatOrder] = useState([]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const currentOrder = playerNames.map((_, index) => index);
    setSeatOrder(createShuffledOrder(playerNames.length, currentOrder));

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, playerNames.length, onClose]);

  if (!isOpen) return null;

  function handleRandomizeAgain() {
    setSeatOrder((currentOrder) => (
      createShuffledOrder(playerNames.length, currentOrder)
    ));
  }

  return (
    <div className="modal-backdrop active seat-randomizer-backdrop" role="presentation">
      <section
        className="modal seat-randomizer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="seat-randomizer-title"
      >
        <div className="seat-randomizer-head">
          <div>
            <h2 id="seat-randomizer-title">🔀 Velg plassering</h2>
            <p className="muted">
              Tilfeldig rekkefølge rundt bordet. Plass 1 etterfølges av plass 2, osv.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-gray btn-small"
            onClick={onClose}
          >
            Lukk
          </button>
        </div>

        <div className="seat-randomizer-list" aria-live="polite">
          {seatOrder.map((playerIndex, seatIndex) => (
            <div className="seat-randomizer-row" key={playerIndex}>
              <div className="seat-randomizer-seat">Plass {seatIndex + 1}</div>
              <div className="seat-randomizer-player">
                {playerNames[playerIndex]?.trim() || `Spiller ${playerIndex + 1}`}
              </div>
            </div>
          ))}
        </div>

        <div className="seat-randomizer-note">
          Dealer velges separat og endrer ikke denne rekkefølgen.
        </div>

        <div className="seat-randomizer-actions">
          <button
            type="button"
            className="btn btn-yellow"
            onClick={handleRandomizeAgain}
          >
            🔀 Randomiser på nytt
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onApply(seatOrder)}
          >
            Bruk plassering
          </button>
        </div>
      </section>
    </div>
  );
}
