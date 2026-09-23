import { useEffect, useMemo, useState } from 'react';
import ChipVisual from './ChipVisual.jsx';
import { calculateChipDistribution } from '../utils/chipDistribution.js';
import '../styles/chipDistribution.css';

function formatNumber(value) {
  return new Intl.NumberFormat('nb-NO').format(Number(value) || 0);
}

export default function ChipDistributionModal({
  isOpen,
  playerCount,
  startStack,
  chipValues,
  blindLevels,
  onClose,
  onSaveStack,
}) {
  const result = useMemo(() => (
    calculateChipDistribution({
      playerCount,
      startStack,
      chipValues,
      blindLevels,
    })
  ), [
    playerCount,
    startStack,
    chipValues,
    blindLevels,
  ]);

  const [countsByKey, setCountsByKey] = useState({});

  useEffect(() => {
    if (!isOpen || result.error) return;

    setCountsByKey(
      Object.fromEntries(
        result.distribution.map((item) => [item.key, item.count]),
      ),
    );
  }, [isOpen, result]);

  if (!isOpen) return null;

  const getCount = (item) => {
    const savedCount = countsByKey[item.key];

    return Number.isFinite(savedCount) ? savedCount : item.count;
  };

  const totalStackValue = result.error
    ? 0
    : result.distribution.reduce((sum, item) => {
      return sum + (getCount(item) * item.value);
    }, 0);

  const totalChipCount = result.error
    ? 0
    : result.distribution.reduce((sum, item) => {
      return sum + getCount(item);
    }, 0);

  function handleCountChange(key, rawValue) {
    const nextCount = Math.max(0, Math.round(Number(rawValue) || 0));

    setCountsByKey((current) => ({
      ...current,
      [key]: nextCount,
    }));
  }

  function handleResetRecommendation() {
    if (result.error) return;

    setCountsByKey(
      Object.fromEntries(
        result.distribution.map((item) => [item.key, item.count]),
      ),
    );
  }

  return (
    <div className="modal-backdrop active chip-distribution-backdrop" role="presentation">
      <section
        className="modal chip-distribution-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chip-distribution-title"
      >
        <div className="chip-distribution-head">
          <h2 id="chip-distribution-title">🪙 Sjetongfordeling</h2>

          <button
            type="button"
            className="btn btn-gray btn-small"
            onClick={onClose}
          >
            Lukk
          </button>
        </div>

        {result.error ? (
          <div className="chip-distribution-error">{result.error}</div>
        ) : (
          <>
            <div className="chip-distribution-context">
              <span>{result.summary.playerCount} spillere</span>
              <span>Start stack {formatNumber(startStack)}</span>
            </div>

            <div className="chip-distribution-table-wrap">
              <table className="chip-distribution-table">
                <thead>
                  <tr>
                    <th>Chip</th>
                    <th>Verdi</th>
                    <th>Antall</th>
                    <th>Verdi i stack</th>
                  </tr>
                </thead>

                <tbody>
                  {result.distribution.map((item) => {
                    const count = getCount(item);
                    const rowValue = count * item.value;

                    return (
                      <tr key={item.key}>
                        <td>
                          <div className="chip-distribution-chip">
                            <ChipVisual chip={item} size={42} />
                            <span>{item.name}</span>
                          </div>
                        </td>

                        <td>{formatNumber(item.value)}</td>

                        <td>
                          <input
                            className="chip-distribution-count-input"
                            type="number"
                            min="0"
                            step="1"
                            value={count}
                            onChange={(event) => {
                              handleCountChange(item.key, event.target.value);
                            }}
                          />
                        </td>

                        <td>{formatNumber(rowValue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="chip-distribution-stack-total">
              <div>
                <span>Chips per spiller</span>
                <strong>{totalChipCount}</strong>
              </div>

              <div>
                <span>Stack totalt</span>
                <strong>{formatNumber(totalStackValue)}</strong>
              </div>
            </div>

            <div className="chip-distribution-actions">
              <button
                type="button"
                className="btn btn-gray"
                onClick={handleResetRecommendation}
              >
                Tilbakestill forslag
              </button>

              <button
                type="button"
                className="btn btn-primary"
                disabled={totalStackValue <= 0}
                onClick={() => onSaveStack(totalStackValue)}
              >
                Lagre stack
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
