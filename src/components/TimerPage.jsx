import { useEffect, useState } from 'react';
import ChipVisual from './ChipVisual.jsx';
import DisplaySettingsModal from './DisplaySettingsModal.jsx';
import HandRankingsModal from './HandRankingsModal.jsx';
import LevelCard from './LevelCard.jsx';
import PositionBoard from './PositionBoard.jsx';
import RoomBadge from './RoomBadge.jsx';
import RoundPanel from './RoundPanel.jsx';
import StackModal from './StackModal.jsx';
import SyncStatusBadge from './SyncStatusBadge.jsx';
import TimerMenu from './TimerMenu.jsx';
import TimerRing from './TimerRing.jsx';
import { useDisplaySettings } from '../hooks/useDisplaySettings.js';
import { changeLevel, saveEditedStacks, toggleTimer } from '../state/actions.js';
import { getChipTypes } from '../state/pokerConstants.js';
import { getCurrentLevel, getNextLevel } from '../state/pokerLogic.js';
import '../styles/timerUiOverrides.css';
import '../styles/timerMenu.css';

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
  const [displaySettingsOpen, setDisplaySettingsOpen] = useState(false);
  const [roundPanelOpen, setRoundPanelOpen] = useState(false);
  const [positionBoardVisible, setPositionBoardVisible] = useState(true);

  const {
    displaySettings,
    updateDisplaySetting,
    resetDisplaySettings,
  } = useDisplaySettings();

  const currentLevel = getCurrentLevel(tournamentState);
  const nextLevel = getNextLevel(tournamentState);
  const chipTypes = getChipTypes(tournamentState);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setStackModalOpen(false);
        setTournamentState((currentState) => ({
          ...currentState,
          handRankingsOpen: false,
        }));
        setDisplaySettingsOpen(false);
        setRoundPanelOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setTournamentState]);

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

  function handleSetHandRankingsOpen(isOpen) {
    setTournamentState((currentState) => ({
      ...currentState,
      handRankingsOpen: isOpen,
    }));
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
          <button
            type="button"
            className="btn btn-gray"
            onClick={() => handleSetHandRankingsOpen(true)}
          >
            Hand rankings
          </button>
        </div>

        <div className="button-cluster">
          <RoomBadge roomId={roomId} />
          <SyncStatusBadge status={syncStatus} />

          <TimerMenu
            onOpenControlPage={onOpenControlPage}
            onOpenDisplaySettings={() => setDisplaySettingsOpen(true)}
            onOpenStackModal={() => setStackModalOpen(true)}
            onOpenJoinRoom={onOpenJoinRoom}
            onNewRoom={onNewRoom}
            onReset={onReset}
            positionBoardVisible={positionBoardVisible}
            onShowPositionBoard={() => setPositionBoardVisible(true)}
          />
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

      <div className="chips-hero chips-hero-dynamic" aria-label="Chipverdier">
        {chipTypes.map((chip) => (
          <ChipVisual chip={chip} key={chip.key} />
        ))}
      </div>

      {positionBoardVisible && (
        <PositionBoard
          tournamentState={tournamentState}
          onHide={() => setPositionBoardVisible(false)}
        />
      )}

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
        isOpen={Boolean(tournamentState.handRankingsOpen)}
        onClose={() => handleSetHandRankingsOpen(false)}
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
