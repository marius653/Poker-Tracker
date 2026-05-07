import { useEffect, useRef, useState } from 'react';
import { getClientId } from './clientId.js';
import {
  publishFirebaseRoomState,
  subscribeToFirebaseRoom,
} from './firebaseRoomStorage.js';

function getSyncSignature(tournamentState) {
  if (!tournamentState) return '';

  // timeRemainingSec endres hvert tick lokalt på hver enhet.
  // Hvis vi publiserer den til Firebase hele tiden, kan PC-en overskrive
  // mobil/iPad-endringer som chips, fold, all-in og level-klikk.
  //
  // Derfor utelater vi timeRemainingSec fra signaturen.
  // Selve timeren synkes fortsatt via timerRunning + levelEndsAt.
  const {
    timeRemainingSec,
    ...stateWithoutLocalTick
  } = tournamentState;

  return JSON.stringify(stateWithoutLocalTick);
}

export function useFirebaseRoomSync({
  enabled,
  roomId,
  tournamentState,
  setTournamentState,
}) {
  const [syncStatus, setSyncStatus] = useState('offline');
  const clientIdRef = useRef(getClientId());
  const applyingRemoteRef = useRef(false);
  const publishTimerRef = useRef(null);
  const latestTournamentStateRef = useRef(tournamentState);
  const lastPublishedSignatureRef = useRef('');

  useEffect(() => {
    latestTournamentStateRef.current = tournamentState;
  }, [tournamentState]);

  useEffect(() => {
    if (!enabled || !roomId) {
      setSyncStatus('offline');
      return undefined;
    }

    setSyncStatus('connecting');

    const unsubscribe = subscribeToFirebaseRoom(roomId, (remoteRoom) => {
      if (!remoteRoom?.tournamentState) {
        setSyncStatus('connected');
        return;
      }

      setSyncStatus('connected');

      const localHasTournament = Boolean(
        latestTournamentStateRef.current?.players?.length,
      );

      const remoteIsFromThisClient = remoteRoom.clientId === clientIdRef.current;

      // Normalt ignorerer vi egne meldinger for å unngå loops.
      // Men ved testing i samme browser/StackBlitz-preview kan "iPad" og PC
      // ha samme clientId. Hvis lokal state er tom, må vi likevel hente rommet.
      if (remoteIsFromThisClient && localHasTournament) {
        return;
      }

      applyingRemoteRef.current = true;
      lastPublishedSignatureRef.current = getSyncSignature(remoteRoom.tournamentState);
      setTournamentState(remoteRoom.tournamentState);

      window.setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 0);
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, roomId, setTournamentState]);

  useEffect(() => {
    if (!enabled || !roomId) return undefined;
    if (applyingRemoteRef.current) return undefined;
    if (!tournamentState?.players?.length) return undefined;

    const nextSignature = getSyncSignature(tournamentState);

    // Ikke publiser rene lokale timer-ticks.
    // Publiser kun når noe "ekte" har endret seg:
    // start/pause, level, players, pot, chips, handState, osv.
    if (nextSignature === lastPublishedSignatureRef.current) {
      return undefined;
    }

    window.clearTimeout(publishTimerRef.current);

    publishTimerRef.current = window.setTimeout(() => {
      lastPublishedSignatureRef.current = nextSignature;

      publishFirebaseRoomState({
        roomId,
        clientId: clientIdRef.current,
        tournamentState,
      })
        .then(() => setSyncStatus('connected'))
        .catch((error) => {
          console.warn('Firebase sync feilet.', error);
          setSyncStatus('error');
        });
    }, 120);

    return () => window.clearTimeout(publishTimerRef.current);
  }, [enabled, roomId, tournamentState]);

  return {
    syncStatus,
    clientId: clientIdRef.current,
  };
}
