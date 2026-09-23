import { useMemo, useState } from 'react';
import AutoBlindSetupModal from './AutoBlindSetupModal.jsx';
import ChipDistributionModal from './ChipDistributionModal.jsx';
import ChipValueSetup from './ChipValueSetup.jsx';
import DealerRollModal from './DealerRollModal.jsx';
import SeatRandomizerModal from './SeatRandomizerModal.jsx';
import { DEFAULT_BLINDS } from '../state/defaultBlinds.js';
import { DEFAULT_CHIP_VALUES } from '../state/pokerConstants.js';
import { calculateDynamicPositions } from '../state/pokerLogic.js';

function buildSeatPositions(playerCount, dealerIndex) {
  const labels = calculateDynamicPositions(playerCount);
  const positionsBySeat = Array.from({ length: playerCount }, () => 'Spiller');

  for (let offset = 0; offset < playerCount; offset += 1) {
    const seatIndex = (dealerIndex + offset) % playerCount;
    positionsBySeat[seatIndex] = labels[offset] || 'Spiller';
  }

  return positionsBySeat;
}

export default function SetupPage({ onStartTournament }) {
  const [playerCount, setPlayerCount] = useState(5);
  const [playerNames, setPlayerNames] = useState(
    Array.from({ length: 5 }, (_, index) => `Spiller ${index + 1}`),
  );
  const [blindLevels, setBlindLevels] = useState(DEFAULT_BLINDS);
  const [startStack, setStartStack] = useState(2500);
  const [chipValues, setChipValues] = useState(() => ({ ...DEFAULT_CHIP_VALUES }));
  const [dealerIndex, setDealerIndex] = useState(4);
  const [dealerRollOpen, setDealerRollOpen] = useState(false);
  const [seatRandomizerOpen, setSeatRandomizerOpen] = useState(false);
  const [autoBlindSetupOpen, setAutoBlindSetupOpen] = useState(false);
  const [chipDistributionOpen, setChipDistributionOpen] = useState(false);

  const positions = useMemo(
    () => buildSeatPositions(playerCount, dealerIndex),
    [playerCount, dealerIndex],
  );

  function handlePlayerCountChange(event) {
    const nextCount = Number(event.target.value);

    setPlayerCount(nextCount);
    setDealerIndex(nextCount - 1);
    setDealerRollOpen(false);
    setSeatRandomizerOpen(false);
    setPlayerNames((currentNames) =>
      Array.from({ length: nextCount }, (_, index) => {
        return currentNames[index] || `Spiller ${index + 1}`;
      }),
    );
  }

  function handlePlayerNameChange(index, value) {
    setPlayerNames((currentNames) =>
      currentNames.map((name, currentIndex) => {
        return currentIndex === index ? value : name;
      }),
    );
  }

  function handleBlindChange(index, field, value) {
    setBlindLevels((currentLevels) =>
      currentLevels.map((level, currentIndex) => {
        if (currentIndex !== index) return level;

        return {
          ...level,
          [field]: Number(value),
        };
      }),
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    onStartTournament({
      playerNames,
      blindLevels,
      startStack,
      chipValues,
      dealerIndex,
    });
  }

  return (
    <>
      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="setup-grid">
          <div className="setup-left-column">
            <section className="setup-left panel">
              <h1>Poker Timer Setup</h1>
              <p className="muted">Velg antall spillere, fyll inn navn, rull terning for å velge dealer og start turneringen.</p>

              <div className="field">
                <label htmlFor="playerCount">Antall spillere</label>
                <select id="playerCount" value={playerCount} onChange={handlePlayerCountChange}>
                  {[5, 6, 7, 8, 9].map((count) => (
                    <option key={count} value={count}>
                      {count} spillere
                    </option>
                  ))}
                </select>
              </div>

              <div className="player-form-grid">
                {playerNames.map((name, index) => (
                  <div className="player-input-row" key={index}>
                    <div className="position-pill">{positions[index] || 'Spiller'}</div>
                    <input
                      type="text"
                      placeholder={`Spiller ${index + 1}`}
                      value={name}
                      onChange={(event) => handlePlayerNameChange(index, event.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="dealer-select-row">
                <button
                  type="button"
                  className="btn btn-gray btn-small"
                  onClick={() => setSeatRandomizerOpen(true)}
                >
                  Velg plassering
                </button>

                <button
                  type="button"
                  className="btn btn-gray btn-small"
                  onClick={() => setDealerRollOpen(true)}
                >
                  Velg dealer
                </button>

                <div className="dealer-selection-status">
                  Dealer: <strong>{playerNames[dealerIndex] || `Spiller ${dealerIndex + 1}`}</strong>
                </div>
              </div>
            </section>

            <div className="stack-box panel">
              <div className="stack-box-actions">
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="startStack">Start stack</label>
                  <input
                    id="startStack"
                    type="number"
                    min="0"
                    step="100"
                    value={startStack}
                    onChange={(event) => setStartStack(Number(event.target.value))}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-gray btn-small"
                  onClick={() => setChipDistributionOpen(true)}
                >
                  Sjetongfordeling
                </button>
              </div>
            </div>

            <ChipValueSetup
              chipValues={chipValues}
              onChange={setChipValues}
            />

            <button type="submit" className="btn btn-primary btn-start-tournament">
              Start turnering
            </button>
          </div>

          <section className="setup-right panel">
            <div className="row setup-heading-row">
              <div>
                <h2>Blind setup</h2>
                <p className="muted">
                  Varighet og big blind kan redigeres. Small blind fylles automatisk som halvparten av big blind.
                </p>
              </div>

              <div className="row">
                <button
                  type="button"
                  className="btn btn-gray btn-small"
                  onClick={() => setAutoBlindSetupOpen(true)}
                >
                  Automatisk oppsett
                </button>

                <button
                  type="button"
                  className="btn btn-gray btn-small"
                  onClick={() => setBlindLevels(DEFAULT_BLINDS)}
                >
                  Nullstill defaults
                </button>
              </div>
            </div>

            <div className="blind-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Varighet (min)</th>
                    <th>Small Blind</th>
                    <th>Big Blind</th>
                  </tr>
                </thead>

                <tbody>
                  {blindLevels.map((entry, index) => (
                    <tr
                      key={`${entry.isBreak ? 'break' : 'level'}-${index}`}
                      className={entry.isBreak ? 'blind-break-row' : ''}
                    >
                      <td className={entry.isBreak ? 'blind-break-label' : ''}>
                        {entry.isBreak ? 'Pause' : entry.level}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={entry.duration}
                          onChange={(event) => handleBlindChange(index, 'duration', event.target.value)}
                        />
                      </td>
                      <td>
                        {entry.isBreak ? (
                          <span className="muted">—</span>
                        ) : (
                          <input type="number" value={Math.floor(entry.bb / 2)} disabled readOnly />
                        )}
                      </td>
                      <td>
                        {entry.isBreak ? (
                          <span className="muted">—</span>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={entry.bb}
                            onChange={(event) => handleBlindChange(index, 'bb', event.target.value)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </form>

      <ChipDistributionModal
        isOpen={chipDistributionOpen}
        playerCount={playerCount}
        startStack={startStack}
        chipValues={chipValues}
        blindLevels={blindLevels}
        onClose={() => setChipDistributionOpen(false)}
        onSaveStack={(nextStartStack) => {
          setStartStack(nextStartStack);
          setChipDistributionOpen(false);
        }}
      />

      <AutoBlindSetupModal
        isOpen={autoBlindSetupOpen}
        playerCount={playerCount}
        startStack={startStack}
        chipValues={chipValues}
        onClose={() => setAutoBlindSetupOpen(false)}
        onApply={(nextBlindLevels) => {
          setBlindLevels(nextBlindLevels);
          setAutoBlindSetupOpen(false);
        }}
      />

      <SeatRandomizerModal
        isOpen={seatRandomizerOpen}
        playerNames={playerNames}
        onClose={() => setSeatRandomizerOpen(false)}
        onApply={(seatOrder) => {
          const nextDealerIndex = seatOrder.indexOf(dealerIndex);

          setPlayerNames(seatOrder.map((playerIndex) => playerNames[playerIndex]));
          setDealerIndex(nextDealerIndex >= 0 ? nextDealerIndex : playerCount - 1);
          setSeatRandomizerOpen(false);
        }}
      />

      <DealerRollModal
        isOpen={dealerRollOpen}
        playerNames={playerNames}
        onClose={() => setDealerRollOpen(false)}
        onSelectDealer={(nextDealerIndex) => {
          setDealerIndex(nextDealerIndex);
          setDealerRollOpen(false);
        }}
      />
    </>
  );
}
