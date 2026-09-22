import { useMemo, useState } from 'react';
import {
  BLIND_PACE_OPTIONS,
  formatScheduleMinutes,
  generateAutoBlindSchedule,
} from '../utils/autoBlindSchedule.js';
import '../styles/autoBlindSetup.css';

function padTime(value) {
  return String(value).padStart(2, '0');
}

function createDefaultTimes() {
  const now = new Date();
  const start = new Date(now);
  const minutesToNextQuarter = (15 - (start.getMinutes() % 15)) % 15;

  start.setMinutes(start.getMinutes() + minutesToNextQuarter, 0, 0);

  const end = new Date(start);
  end.setHours(end.getHours() + 4);

  return {
    start: `${padTime(start.getHours())}:${padTime(start.getMinutes())}`,
    end: `${padTime(end.getHours())}:${padTime(end.getMinutes())}`,
  };
}

export default function AutoBlindSetupModal({
  isOpen,
  playerCount,
  startStack,
  chipValues,
  onClose,
  onApply,
}) {
  const defaultTimes = useMemo(createDefaultTimes, []);
  const [startTime, setStartTime] = useState(defaultTimes.start);
  const [endTime, setEndTime] = useState(defaultTimes.end);
  const [breakCount, setBreakCount] = useState(1);
  const [breakDuration, setBreakDuration] = useState(10);
  const [pace, setPace] = useState('balanced');

  const result = useMemo(() => (
    generateAutoBlindSchedule({
      startTime,
      endTime,
      breakCount,
      breakDuration,
      pace,
      playerCount,
      startStack,
      chipValues,
    })
  ), [
    startTime,
    endTime,
    breakCount,
    breakDuration,
    pace,
    playerCount,
    startStack,
    chipValues,
  ]);

  if (!isOpen) return null;

  const summary = result.summary;

  return (
    <div className="modal-backdrop active auto-blind-backdrop" role="presentation">
      <section
        className="modal auto-blind-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auto-blind-title"
      >
        <div className="auto-blind-head">
          <div>
            <h2 id="auto-blind-title">⚙️ Automatisk oppsett</h2>
            <p className="muted">
              Lager blindstruktur ut fra tilgjengelig tid, stack og antall spillere.
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

        <div className="auto-blind-context">
          <span>{playerCount} spillere</span>
          <span>Start stack {Number(startStack) || 0}</span>
          {summary && <span>Minste chip {summary.smallestChip}</span>}
          <span>Sluttmål ≈ 15 totale BB</span>
        </div>

        <div className="auto-blind-fields">
          <div className="field">
            <label htmlFor="autoBlindStart">Starttidspunkt</label>
            <input
              id="autoBlindStart"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="autoBlindEnd">Sluttidspunkt</label>
            <input
              id="autoBlindEnd"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="autoBlindBreaks">Antall pauser</label>
            <input
              id="autoBlindBreaks"
              type="number"
              min="0"
              max="6"
              step="1"
              value={breakCount}
              onChange={(event) => setBreakCount(Number(event.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="autoBlindBreakDuration">Pause (min)</label>
            <input
              id="autoBlindBreakDuration"
              type="number"
              min="1"
              max="60"
              step="1"
              value={breakDuration}
              onChange={(event) => setBreakDuration(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="auto-blind-pace-section">
          <div className="auto-blind-section-label">Hvor ofte skal blindene endres?</div>

          <div className="auto-blind-pace-grid">
            {BLIND_PACE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.key}
                className={`auto-blind-pace-card ${pace === option.key ? 'is-selected' : ''}`}
                onClick={() => setPace(option.key)}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
                {option.key === 'balanced' && (
                  <em>Anbefalt</em>
                )}
              </button>
            ))}
          </div>
        </div>

        {result.error ? (
          <div className="auto-blind-error">{result.error}</div>
        ) : (
          <>
            <div className="auto-blind-summary">
              <div>
                <span>Total tid</span>
                <strong>{formatScheduleMinutes(summary.totalMinutes)}</strong>
              </div>

              <div>
                <span>Blindnivåer</span>
                <strong>{summary.levelCount}</strong>
              </div>

              <div>
                <span>Varighet per nivå</span>
                <strong>
                  {summary.minLevelDuration === summary.maxLevelDuration
                    ? `${summary.minLevelDuration} min`
                    : `${summary.minLevelDuration}–${summary.maxLevelDuration} min`}
                </strong>
              </div>

              <div>
                <span>Start blinds</span>
                <strong>{Math.floor(summary.startBb / 2)} / {summary.startBb}</strong>
              </div>

              <div>
                <span>Siste blinds</span>
                <strong>{Math.floor(summary.finalBb / 2)} / {summary.finalBb}</strong>
              </div>

              <div>
                <span>Pauser</span>
                <strong>{summary.breakCount}</strong>
              </div>
            </div>

            <div className="auto-blind-break-summary">
              {summary.breakAfterLevels.length
                ? `Pauser etter level ${summary.breakAfterLevels.join(', ')}.`
                : 'Ingen pauser.'}
            </div>

            <div className="auto-blind-preview">
              {result.schedule.map((entry, index) => (
                <div
                  className={`auto-blind-preview-row ${entry.isBreak ? 'is-break' : ''}`}
                  key={`${entry.isBreak ? 'break' : 'level'}-${index}`}
                >
                  <strong>{entry.isBreak ? 'Pause' : `Level ${entry.level}`}</strong>
                  <span>{entry.duration} min</span>
                  <span>
                    {entry.isBreak
                      ? `etter level ${entry.afterLevel}`
                      : `${Math.floor(entry.bb / 2)} / ${entry.bb}`}
                  </span>
                </div>
              ))}
            </div>

            <p className="auto-blind-estimate-note">
              Sluttidspunktet er et estimat. Siste planlagte nivå sikter mot
              omtrent 15 totale big blinds igjen, men faktisk sluttid avhenger
              av spillestil, antall hender og elimineringstakt.
            </p>
          </>
        )}

        <div className="auto-blind-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={Boolean(result.error)}
            onClick={() => onApply(result.schedule)}
          >
            Bruk automatisk oppsett
          </button>
        </div>
      </section>
    </div>
  );
}
