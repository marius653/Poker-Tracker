import RoomBadge from './RoomBadge.jsx';
import RoundPanelContent from './RoundPanelContent.jsx';
import RoundPanelErrorBoundary from './RoundPanelErrorBoundary.jsx';
import SyncStatusBadge from './SyncStatusBadge.jsx';
import TimerRing from './TimerRing.jsx';
import { useDisplaySettings } from '../hooks/useDisplaySettings.js';
import { changeLevel, toggleTimer } from '../state/actions.js';
import { getCurrentLevel, getNextLevel } from '../state/pokerLogic.js';
import { formatTime } from '../utils/format.js';
import '../styles/controlPage.css';

export default function ControlPage({
  roomId,
  syncStatus,
  tournamentState,
  setTournamentState,
  onBackToTimer,
  onOpenRoundPage,
  onLevelChangeSound,
}) {
  const { displaySettings } = useDisplaySettings();

  const currentLevel = getCurrentLevel(tournamentState);
  const nextLevel = getNextLevel(tournamentState);

  function handleToggleTimer() {
    setTournamentState((currentState) => toggleTimer(currentState));
  }

  function handleChangeLevel(delta) {
    setTournamentState((currentState) => changeLevel(currentState, delta));
    onLevelChangeSound?.();
  }

  return (
    <div className="control-page">
      <div className="control-topbar">
        <button type="button" className="btn btn-gray control-nav-btn" onClick={onBackToTimer}>
          &larr; Timer
        </button>

        <div className="button-cluster">
          <RoomBadge roomId={roomId} />
          <SyncStatusBadge status={syncStatus} />
        </div>

        <button type="button" className="btn btn-gray control-nav-btn" onClick={onOpenRoundPage}>
          Rundeside
        </button>
      </div>

      <section className="control-hero panel">
        <div className="control-level-pill">
          LEVEL {currentLevel?.level}
        </div>

        <div className="control-time">
          {formatTime(tournamentState.timeRemainingSec)}
        </div>

        <div className="control-blinds">
          <div>
            <span>SB</span>
            <strong>{currentLevel?.sb}</strong>
          </div>
          <div className="control-blind-divider">/</div>
          <div>
            <span>BB</span>
            <strong>{currentLevel?.bb}</strong>
          </div>
        </div>

        <div className="control-next-level">
          Neste: {nextLevel?.sb}/{nextLevel?.bb} · {nextLevel?.duration} min
        </div>

        <div className="control-main-actions">
          <button
            type="button"
            className={`btn control-big-btn ${tournamentState.timerRunning ? 'btn-green' : 'btn-blue'}`}
            onClick={handleToggleTimer}
          >
            {tournamentState.timerRunning ? 'Pause' : 'Start'}
          </button>
        </div>

        <div className="control-level-actions">
          <button type="button" className="btn btn-gray control-wide-btn" onClick={() => handleChangeLevel(-1)}>
            &larr; Level ned
          </button>
          <button type="button" className="btn btn-gray control-wide-btn" onClick={() => handleChangeLevel(1)}>
            Level opp &rarr;
          </button>
        </div>
      </section>

      <section className="control-status-grid">
        <div className="control-status-card panel">
          <div className="control-status-label">Pot</div>
          <div className="control-status-value">{tournamentState.currentPot}</div>
        </div>

        <div className="control-status-card panel">
          <div className="control-status-label">Runde</div>
          <div className="control-status-value">{tournamentState.roundNumber}</div>
        </div>

        <div className="control-status-card panel">
          <div className="control-status-label">Spillere</div>
          <div className="control-status-value">
            {tournamentState.players.filter((player) => !player.eliminated).length}
          </div>
        </div>
      </section>

      <section className="control-mini-timer">
        <TimerRing
          level={currentLevel}
          timeRemainingSec={tournamentState.timeRemainingSec}
          currentPot={tournamentState.currentPot}
          totalSegments={displaySettings.timerSegmentCount}
          timerRunning={tournamentState.timerRunning}
          onToggleTimer={handleToggleTimer}
        />
      </section>

      <section className="control-round-panel panel">
        <RoundPanelErrorBoundary>
          <RoundPanelContent
            tournamentState={tournamentState}
            setTournamentState={setTournamentState}
            onClose={onBackToTimer}
            headerAction={(
              <button type="button" className="btn btn-gray btn-small" onClick={onOpenRoundPage}>
                Stor rundeside
              </button>
            )}
          />
        </RoundPanelErrorBoundary>
      </section>
    </div>
  );
}
