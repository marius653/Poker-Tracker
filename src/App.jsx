import { useEffect, useState } from 'react';
import SetupPage from './components/SetupPage.jsx';
import TimerPage from './components/TimerPage.jsx';
import { createInitialTournamentState } from './state/initialState.js';
import { startTournamentFromSetup, updateTimerFromClock } from './state/actions.js';
import { useLevelSound } from './hooks/useLevelSound.js';
import { useWakeLock } from './hooks/useWakeLock.js';

export default function App() {
  const [page, setPage] = useState('setup');
  const [tournamentState, setTournamentState] = useState(createInitialTournamentState);
  const { playLevelUpSound, primeLevelUpSound } = useLevelSound('/levelup.wav');

  useWakeLock(page === 'timer');

  useEffect(() => {
    if (page !== 'timer') return;
    const id = window.setInterval(() => {
      setTournamentState((current) => {
        const result = updateTimerFromClock(current);
        if (result.levelChanged) playLevelUpSound();
        return result.state;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [page, playLevelUpSound]);

  function handleStartTournament(setupData) {
    const nextState = startTournamentFromSetup({ currentState: createInitialTournamentState(), ...setupData });
    setTournamentState(nextState);
    setPage('timer');
    primeLevelUpSound();
  }

  function handleReset() {
    setTournamentState(createInitialTournamentState());
    setPage('setup');
  }

  return (
    <main className="app-shell">
      {page === 'timer' ? (
        <TimerPage
          tournamentState={tournamentState}
          setTournamentState={setTournamentState}
          onReset={handleReset}
          onLevelChangeSound={playLevelUpSound}
        />
      ) : (
        <SetupPage onStartTournament={handleStartTournament} />
      )}
    </main>
  );
}
