import { useEffect, useState } from 'react';
import DisplaySettingsModal from './DisplaySettingsModal.jsx';
import HandRankingsModal from './HandRankingsModal.jsx';
import LevelCard from './LevelCard.jsx';
import PositionBoard from './PositionBoard.jsx';
import RoomBadge from './RoomBadge.jsx';
import RoundPanel from './RoundPanel.jsx';
import StackModal from './StackModal.jsx';
import SyncStatusBadge from './SyncStatusBadge.jsx';
import TimerRing from './TimerRing.jsx';
import { useDisplaySettings } from '../hooks/useDisplaySettings.js';
import { changeLevel, saveEditedStacks, toggleTimer } from '../state/actions.js';
import { getCurrentLevel, getNextLevel } from '../state/pokerLogic.js';

export default function TimerPage({
  roomId,
  syncStatus,
  tournamentState,
  setTournamentState,
  onReset,
  onNewRoom,
  onLevelChangeSound,
  onOpenRoundPage,
  onOpenControlPage,
  onOpenJoinRoom,
}) {
  const [stackModalOpen, setStackModalOpen] = useState(false);
  const [handRankingsOpen, setHandRankingsOpen] = useState(false);
  const [displaySettingsOpen, setDisplaySettingsOpen] = useState(false);
  const [roundPanelOpen, setRoundPanelOpen] = useState(false);

  const {
    displaySettings,
    updateDisplaySetting,
    resetDisplaySettings,
  } = useDisplaySettings();

  const currentLevel = getCurrentLevel(tournamentState);
  const nextLevel = getNextLevel(tournamentState);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setStackModalOpen(false);
        setHandRankingsOpen(false);
        setDisplaySettingsOpen(false);
        setRoundPanelOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleToggleTimer() {
    setTournamentState((currentState) => toggleTimer(currentState));
  }

  function handleChangeLevel(delta) {
    setTournamentState((currentState) => changeLevel(currentState, delta));
    onLevelChangeSound?.();
  }

  function handleSaveStacks(stackValues) {
    setTournamentState((currentState) => saveEditedStacks(currentState, stackValues));
    setStackModalOpen(false);
  }

  return (
    <div className="timer-page">
      <div className="top-bar">
        <div className="button-cluster">
          <button type="button" className="btn btn-gray" onClick={() => handleChangeLevel(-1)}>
            &larr; Level
          </button>
          <button type="button" className="btn btn-gray" onClick={() => handleChangeLevel(1)}>
            Level &rarr;
          </button>
        </div>

        <div className="button-cluster">
          <RoomBadge roomId={roomId} />
          <SyncStatusBadge status={syncStatus} />
        </div>

        <div className="button-cluster">
          <button type="button" className="btn btn-gray" onClick={() => setRoundPanelOpen(true)}>
            Rundevindu
          </button>
          <button type="button" className="btn btn-gray" onClick={onOpenRoundPage}>
            Rundeside
          </button>
          <button type="button" className="btn btn-gray" onClick={onOpenControlPage}>
            Kontrollside
          </button>
          <button type="button" className="btn btn-gray" onClick={() => setHandRankingsOpen(true)}>
            Hand rankings
          </button>
          <button type="button" className="btn btn-gray" onClick={() => setDisplaySettingsOpen(true)}>
            Skjerm
          </button>
          <button type="button" className="btn btn-gray" onClick={() => setStackModalOpen(true)}>
            Endre stacks
          </button>
          <button type="button" className="btn btn-gray" onClick={onOpenJoinRoom}>
            Bli med
          </button>
          <button type="button" className="btn btn-gray" onClick={onNewRoom}>
            Nytt rom
          </button>
          <button type="button" className="btn btn-danger" onClick={onReset}>
            Avslutt
          </button>
        </div>
      </div>

      <div className="hero-grid">
        <LevelCard title="Nåværende level" level={currentLevel} />

        <section className="timer-stage">
          <TimerRing
            level={currentLevel}
            timeRemainingSec={tournamentState.timeRemainingSec}
            currentPot={tournamentState.currentPot}
            totalSegments={displaySettings.timerSegmentCount}
            timerRunning={tournamentState.timerRunning}
            onToggleTimer={handleToggleTimer}
          />
        </section>

        <LevelCard title="Neste level" level={nextLevel} />
      </div>

      <img
        src={`${import.meta.env.BASE_URL}chips1.png`}
        alt="Chips"
        className="chips-hero"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />

      <PositionBoard tournamentState={tournamentState} />

      <RoundPanel
        isOpen={roundPanelOpen}
        tournamentState={tournamentState}
        setTournamentState={setTournamentState}
        onClose={() => setRoundPanelOpen(false)}
      />

      <StackModal
        isOpen={stackModalOpen}
        players={tournamentState.players}
        onClose={() => setStackModalOpen(false)}
        onSave={handleSaveStacks}
      />

      <HandRankingsModal
        isOpen={handRankingsOpen}
        onClose={() => setHandRankingsOpen(false)}
      />

      <DisplaySettingsModal
        isOpen={displaySettingsOpen}
        displaySettings={displaySettings}
        onChange={updateDisplaySetting}
        onReset={resetDisplaySettings}
        onClose={() => setDisplaySettingsOpen(false)}
      />
    </div>
  );
}
