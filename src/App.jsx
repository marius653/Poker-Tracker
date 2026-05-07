import './styles/room.css';

import { useEffect, useState } from 'react';
import RoundPage from './components/RoundPage.jsx';
import SetupPage from './components/SetupPage.jsx';
import TimerPage from './components/TimerPage.jsx';
import { useLevelSound } from './hooks/useLevelSound.js';
import { useWakeLock } from './hooks/useWakeLock.js';
import { startTournamentFromSetup, updateTimerFromClock } from './state/actions.js';
import { createInitialTournamentState } from './state/initialState.js';
import { getOrCreateRoomId, resetRoomId } from './sync/roomId.js';
import {
  clearLocalRoomState,
  loadActiveRoomData,
  loadLocalRoomState,
  saveLocalRoomState,
} from './sync/localRoomStorage.js';

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

  const { playLevelUpSound, primeLevelUpSound } = useLevelSound('/levelup.wav');

  const tournamentIsActive = page === 'timer' || page === 'round';
  useWakeLock(tournamentIsActive);

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

  if (page === 'round') {
    return (
      <main className="app-shell">
        <RoundPage
          roomId={roomId}
          tournamentState={tournamentState}
          setTournamentState={setTournamentState}
          onBackToTimer={() => setPage('timer')}
        />
      </main>
    );
  }

  if (page === 'timer') {
    return (
      <main className="app-shell">
        <TimerPage
          roomId={roomId}
          tournamentState={tournamentState}
          setTournamentState={setTournamentState}
          onReset={handleReset}
          onNewRoom={handleNewRoom}
          onLevelChangeSound={playLevelUpSound}
          onOpenRoundPage={() => setPage('round')}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <SetupPage onStartTournament={handleStartTournament} />
    </main>
  );
}
