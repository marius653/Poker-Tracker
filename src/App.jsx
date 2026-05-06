import { useEffect, useState } from 'react';
import SetupPage from './components/SetupPage.jsx';
import TimerPage from './components/TimerPage.jsx';
import { useLevelSound } from './hooks/useLevelSound.js';
import { useWakeLock } from './hooks/useWakeLock.js';
import { startTournamentFromSetup, updateTimerFromClock } from './state/actions.js';
import { createInitialTournamentState } from './state/initialState.js';

export default function App() {
  const [page, setPage] = useState('setup');
  const [tournamentState, setTournamentState] = useState(createInitialTournamentState);
  const { playLevelUpSound, primeLevelUpSound } = useLevelSound('/levelup.wav');

  useWakeLock(page === 'timer');

  useEffect(() => {
    if (page !== 'timer') return undefined;

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
  }, [page, playLevelUpSound]);

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
    setTournamentState(createInitialTournamentState());
    setPage('setup');
  }

  if (page === 'timer') {
    return (
      <main className="app-shell">
        <TimerPage
          tournamentState={tournamentState}
          setTournamentState={setTournamentState}
          onReset={handleReset}
          onLevelChangeSound={playLevelUpSound}
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
