import { useMemo } from 'react';
import { formatTime } from '../utils/format.js';

export default function TimerRing({
  level,
  timeRemainingSec,
  currentPot,
  totalSegments = 72,
  timerRunning,
  onToggleTimer,
}) {
  const totalSec = Math.max(1, (level?.duration || 1) * 60);
  const elapsedSec = Math.max(0, totalSec - timeRemainingSec);
  const filledCount = Math.round((elapsedSec / totalSec) * totalSegments);

  const segments = useMemo(() => {
    const radius = 46;
    const center = 50;

    return Array.from({ length: totalSegments }, (_, index) => {
      const angle = (index / totalSegments) * 360;
      const x = center + radius * Math.cos(((angle - 90) * Math.PI) / 180);
      const y = center + radius * Math.sin(((angle - 90) * Math.PI) / 180);

      return {
        index,
        angle,
        x,
        y,
      };
    });
  }, [totalSegments]);

  return (
    <div
      className="timer-ring-wrap"
      onClick={onToggleTimer}
      role="button"
      tabIndex={0}
      aria-label={timerRunning ? 'Pause timer' : 'Start timer'}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggleTimer();
        }
      }}
    >
      {segments.map((segment) => (
        <div
          key={segment.index}
          className={`timer-segment ${segment.index < filledCount ? 'filled' : ''}`}
          style={{
            left: `${segment.x}%`,
            top: `${segment.y}%`,
            transform: `translate(-50%, -50%) rotate(${segment.angle}deg)`,
          }}
        />
      ))}

      <button
        type="button"
        className={`timer-inner-play ${timerRunning ? 'is-pause' : 'is-play'}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggleTimer();
        }}
        aria-label={timerRunning ? 'Pause' : 'Start'}
      >
        <span className="play-icon" />
        <span className="pause-icon" />
      </button>

      <div className="timer-core">
        <div className="timer-content">
          <div className="timer-level-title">LEVEL {level?.level}</div>
          <div className="timer-value">{formatTime(timeRemainingSec)}</div>

          <div className="pot-area">
            <div className="pot-label">Pot</div>
            <div className="pot-value">{currentPot}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
