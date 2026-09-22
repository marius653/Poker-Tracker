import { useEffect, useRef, useState } from 'react';
import '../styles/dealerRoll.css';

function randomDie() {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return (values[0] % 6) + 1;
  }

  return Math.floor(Math.random() * 6) + 1;
}

function getPipPositions(value) {
  const patterns = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
  };

  return patterns[value] || [];
}

function renderDie(value) {
  const activePips = getPipPositions(value);

  return (
    <span className="dealer-die" aria-label={`Terning ${value}`}>
      {Array.from({ length: 9 }, (_, index) => {
        const cell = index + 1;
        const active = activePips.includes(cell);

        return (
          <span
            key={cell}
            className={`dealer-die-pip ${active ? 'active' : ''}`}
          />
        );
      })}
    </span>
  );
}

function rollDice() {
  const dice = [randomDie(), randomDie()];

  return {
    dice,
    total: dice[0] + dice[1],
  };
}

function createEmptyRolls(playerCount) {
  return Array.from({ length: playerCount }, () => null);
}

export default function DealerRollModal({
  isOpen,
  playerNames,
  onClose,
  onSelectDealer,
}) {
  const [rolls, setRolls] = useState(() => createEmptyRolls(playerNames.length));
  const [eligibleIndices, setEligibleIndices] = useState(
    () => playerNames.map((_, index) => index),
  );
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [rolling, setRolling] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    setRolls(createEmptyRolls(playerNames.length));
    setEligibleIndices(playerNames.map((_, index) => index));
    setWinnerIndex(null);
    setRolling(false);

    return undefined;
  }, [isOpen, playerNames.length]);

  useEffect(() => {
    return () => {
      window.clearInterval(intervalRef.current);
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const tieInProgress = winnerIndex === null && eligibleIndices.length < playerNames.length;

  function handleRoll() {
    if (rolling) return;

    setRolling(true);
    setWinnerIndex(null);

    window.clearInterval(intervalRef.current);
    window.clearTimeout(timeoutRef.current);

    intervalRef.current = window.setInterval(() => {
      setRolls((currentRolls) => {
        const nextRolls = [...currentRolls];

        eligibleIndices.forEach((playerIndex) => {
          nextRolls[playerIndex] = rollDice();
        });

        return nextRolls;
      });
    }, 90);

    timeoutRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);

      const finalRolls = {};
      eligibleIndices.forEach((playerIndex) => {
        finalRolls[playerIndex] = rollDice();
      });

      setRolls((currentRolls) => {
        const nextRolls = [...currentRolls];

        eligibleIndices.forEach((playerIndex) => {
          nextRolls[playerIndex] = finalRolls[playerIndex];
        });

        return nextRolls;
      });

      const highestTotal = Math.max(
        ...eligibleIndices.map((playerIndex) => finalRolls[playerIndex].total),
      );

      const highestIndices = eligibleIndices.filter(
        (playerIndex) => finalRolls[playerIndex].total === highestTotal,
      );

      if (highestIndices.length === 1) {
        setWinnerIndex(highestIndices[0]);
        setEligibleIndices(highestIndices);
      } else {
        setEligibleIndices(highestIndices);
      }

      setRolling(false);
    }, 1050);
  }

  const winnerName = winnerIndex !== null
    ? (playerNames[winnerIndex] || `Spiller ${winnerIndex + 1}`)
    : null;

  return (
    <div className="modal-backdrop active dealer-roll-backdrop" role="presentation">
      <section
        className="modal dealer-roll-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dealer-roll-title"
      >
        <div className="dealer-roll-head">
          <div>
            <h2 id="dealer-roll-title">🎲 Velg dealer</h2>
            <p className="muted">
              Alle kaster to terninger. Høyeste sum blir dealer.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-gray btn-small"
            onClick={onClose}
            disabled={rolling}
          >
            Lukk
          </button>
        </div>

        <div className="dealer-roll-grid">
          {playerNames.map((name, index) => {
            const roll = rolls[index];
            const stillEligible = eligibleIndices.includes(index);
            const isWinner = winnerIndex === index;

            return (
              <div
                className={[
                  'dealer-roll-card',
                  !stillEligible && rolls[index] ? 'is-out' : '',
                  isWinner ? 'is-winner' : '',
                ].filter(Boolean).join(' ')}
                key={index}
              >
                <div className="dealer-roll-name">
                  {name?.trim() || `Spiller ${index + 1}`}
                </div>

                <div className="dealer-dice">
                  {roll ? (
                    <>
                      {renderDie(roll.dice[0])}
                      {renderDie(roll.dice[1])}
                    </>
                  ) : (
                    <>
                      <span className="dealer-die dealer-die-empty">–</span>
                      <span className="dealer-die dealer-die-empty">–</span>
                    </>
                  )}
                </div>

                <div className="dealer-roll-total">
                  {roll ? `Sum ${roll.total}` : 'Ikke kastet'}
                </div>

                {!stillEligible && roll && (
                  <div className="dealer-roll-state">Ute</div>
                )}

                {isWinner && (
                  <div className="dealer-roll-state dealer-roll-winner-label">
                    DEALER
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="dealer-roll-result" aria-live="polite">
          {rolling && 'Kaster terninger…'}

          {!rolling && winnerName && (
            <strong>{winnerName} blir dealer.</strong>
          )}

          {!rolling && !winnerName && tieInProgress && (
            <strong>
              Lik høyeste sum. Kast om mellom{' '}
              {eligibleIndices
                .map((index) => playerNames[index] || `Spiller ${index + 1}`)
                .join(' og ')}.
            </strong>
          )}

          {!rolling && !winnerName && !tieInProgress && (
            <span>Trykk «Kast terninger» for å velge dealer.</span>
          )}
        </div>

        <div className="dealer-roll-actions">
          <button
            type="button"
            className="btn btn-yellow"
            onClick={handleRoll}
            disabled={rolling || winnerIndex !== null}
          >
            {tieInProgress ? '🎲 Kast om' : '🎲 Kast terninger'}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={winnerIndex === null || rolling}
            onClick={() => onSelectDealer(winnerIndex)}
          >
            Bruk valgt dealer
          </button>
        </div>
      </section>
    </div>
  );
}
