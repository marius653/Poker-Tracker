import { useMemo, useState } from 'react';
import { DEFAULT_BLINDS } from '../state/defaultBlinds.js';
import { POSITION_MAP } from '../state/pokerConstants.js';

export default function SetupPage({ onStartTournament }) {
  const [playerCount, setPlayerCount] = useState(5);
  const [playerNames, setPlayerNames] = useState(
    Array.from({ length: 5 }, (_, index) => `Spiller ${index + 1}`),
  );
  const [blindLevels, setBlindLevels] = useState(DEFAULT_BLINDS);
  const [startStack, setStartStack] = useState(2500);

  const positions = useMemo(() => POSITION_MAP[playerCount] || [], [playerCount]);

  function handlePlayerCountChange(event) {
    const nextCount = Number(event.target.value);

    setPlayerCount(nextCount);
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
    });
  }

  return (
    <form className="setup-form" onSubmit={handleSubmit}>
      <div className="setup-grid">
        <div className="setup-left-column">
          <section className="setup-left panel">
            <h1>Poker Timer Setup</h1>
            <p className="muted">Velg antall spillere, fyll inn navn, og start turneringen.</p>

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
          </section>

          <div className="stack-box panel">
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
          </div>

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

            <button
              type="button"
              className="btn btn-gray btn-small"
              onClick={() => setBlindLevels(DEFAULT_BLINDS)}
            >
              Nullstill defaults
            </button>
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
                  <tr key={entry.level}>
                    <td>{entry.level}</td>
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
                      <input type="number" value={Math.floor(entry.bb / 2)} disabled readOnly />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={entry.bb}
                        onChange={(event) => handleBlindChange(index, 'bb', event.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </form>
  );
}
