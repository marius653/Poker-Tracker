import './styles/room.css';
import './styles/sync.css';

import { useEffect, useState } from 'react';
import ControlPage from './components/ControlPage.jsx';
import JoinRoomModal from './components/JoinRoomModal.jsx';
import RoundPage from './components/RoundPage.jsx';
import SetupPage from './components/SetupPage.jsx';
import TimerPage from './components/TimerPage.jsx';
import { useLevelSound } from './hooks/useLevelSound.js';
import { useWakeLock } from './hooks/useWakeLock.js';
import { startTournamentFromSetup, updateTimerFromClock } from './state/actions.js';
import { createInitialTournamentState } from './state/initialState.js';
import {
  getOrCreateRoomId,
  resetRoomId,
  setStoredRoomId,
} from './sync/roomId.js';
import {
  clearLocalRoomState,
  loadActiveRoomData,
  loadLocalRoomState,
  saveLocalRoomState,
} from './sync/localRoomStorage.js';
import { useFirebaseRoomSync } from './sync/useFirebaseRoomSync.js';

function getInitialRoomData() {
  const activeRoomData = loadActiveRoomData();

  if (activeRoomData?.roomId) {
    return activeRoomData;
  }

  const roomId = getOrCreateRoomId();
  const roomData = loadLocalRoomState(roomId);

  return {
    roomId,
    page: roomData?.page || 'setup',
    tournamentState: roomData?.tournamentState || createInitialTournamentState(),
  };
}

export default function App() {
  const [initialRoomData] = useState(getInitialRoomData);

  const [roomId, setRoomId] = useState(initialRoomData.roomId);
  const [page, setPage] = useState(initialRoomData.page || 'setup');
  const [tournamentState, setTournamentState] = useState(() => {
    return initialRoomData.tournamentState || createInitialTournamentState();
  });
  const [joinRoomModalOpen, setJoinRoomModalOpen] = useState(false);

  const { playLevelUpSound, primeLevelUpSound } = useLevelSound('/levelup.wav');

  const tournamentIsActive = page === 'timer' || page === 'round' || page === 'control';
  useWakeLock(tournamentIsActive);

  const { syncStatus } = useFirebaseRoomSync({
    enabled: tournamentIsActive,
    roomId,
    tournamentState,
    setTournamentState,
  });

  useEffect(() => {
    saveLocalRoomState(roomId, {
      page,
      tournamentState,
    });
  }, [roomId, page, tournamentState]);

  useEffect(() => {
    if (!tournamentIsActive) return undefined;

    const intervalId = window.setInterval(() => {
      setTournamentState((currentState) => {
        const result = updateTimerFromClock(currentState);

        if (result.levelChanged) {
          playLevelUpSound();
        }

        return result.state;
      });
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [tournamentIsActive, playLevelUpSound]);

  function handleStartTournament(setupData) {
    const nextState = startTournamentFromSetup({
      currentState: createInitialTournamentState(),
      ...setupData,
    });

    setTournamentState(nextState);
    setPage('timer');
    primeLevelUpSound();
  }

  function handleReset() {
    const confirmed = window.confirm('Vil du avslutte turneringen og gå tilbake til setup?');

    if (!confirmed) return;

    setTournamentState(createInitialTournamentState());
    setPage('setup');
  }

  function handleNewRoom() {
    const confirmed = window.confirm(
      'Vil du lage nytt rom? Dette starter en helt ny lokal room-state.',
    );

    if (!confirmed) return;

    const nextRoomId = resetRoomId();
    clearLocalRoomState(roomId);
    setRoomId(nextRoomId);
    setTournamentState(createInitialTournamentState());
    setPage('setup');
  }

  function handleJoinRoom(nextRoomId) {
    const storedRoomId = setStoredRoomId(nextRoomId);

    if (!storedRoomId) return;

    setRoomId(storedRoomId);
    setTournamentState(createInitialTournamentState());
    setPage('control');
    setJoinRoomModalOpen(false);
  }

  const sharedPageProps = {
    roomId,
    syncStatus,
    tournamentState,
    setTournamentState,
    onLevelChangeSound: playLevelUpSound,
  };

  if (page === 'control') {
    return (
      <main className="app-shell">
        <ControlPage
          {...sharedPageProps}
          onBackToTimer={() => setPage('timer')}
          onOpenRoundPage={() => setPage('round')}
        />

        <JoinRoomModal
          isOpen={joinRoomModalOpen}
          onClose={() => setJoinRoomModalOpen(false)}
          onJoinRoom={handleJoinRoom}
        />
      </main>
    );
  }

  if (page === 'round') {
    return (
      <main className="app-shell">
        <RoundPage
          roomId={roomId}
          syncStatus={syncStatus}
          tournamentState={tournamentState}
          setTournamentState={setTournamentState}
          onBackToTimer={() => setPage('timer')}
        />

        <JoinRoomModal
          isOpen={joinRoomModalOpen}
          onClose={() => setJoinRoomModalOpen(false)}
          onJoinRoom={handleJoinRoom}
        />
      </main>
    );
  }

  if (page === 'timer') {
    return (
      <main className="app-shell">
        <TimerPage
          {...sharedPageProps}
          onReset={handleReset}
          onNewRoom={handleNewRoom}
          onOpenRoundPage={() => setPage('round')}
          onOpenControlPage={() => setPage('control')}
          onOpenJoinRoom={() => setJoinRoomModalOpen(true)}
        />

        <JoinRoomModal
          isOpen={joinRoomModalOpen}
          onClose={() => setJoinRoomModalOpen(false)}
          onJoinRoom={handleJoinRoom}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="setup-with-room-actions">
        <div className="setup-room-actions panel">
          <div>
            <h3>Bli med fra iPad?</h3>
            <p className="muted">
              For kontrollside på en annen enhet: skriv inn room code fra PC-en.
            </p>
          </div>

          <button type="button" className="btn btn-gray" onClick={() => setJoinRoomModalOpen(true)}>
            Bli med i rom
          </button>
        </div>

        <SetupPage onStartTournament={handleStartTournament} />
      </div>

      <JoinRoomModal
        isOpen={joinRoomModalOpen}
        onClose={() => setJoinRoomModalOpen(false)}
        onJoinRoom={handleJoinRoom}
      />
    </main>
  );
}
