import { useEffect, useRef, useState } from 'react';
import { getClientId } from './clientId.js';
import {
  publishFirebaseRoomState,
  subscribeToFirebaseRoom,
} from './firebaseRoomStorage.js';

function getClockAdjustedState(tournamentState, now = Date.now()) {
  if (!tournamentState) return tournamentState;

  if (!tournamentState.timerRunning || !tournamentState.levelEndsAt) {
    return tournamentState;
  }

  return {
    ...tournamentState,
    timeRemainingSec: Math.max(
      0,
      Math.ceil((tournamentState.levelEndsAt - now) / 1000),
    ),
  };
}

function getSyncSignature(tournamentState) {
  if (!tournamentState) return '';

  // timeRemainingSec er en lokal visningsverdi som endres hvert tick.
  // levelEndsAt + timerRunning er den egentlige sync-kilden for timeren.
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

      const adjustedRemoteState = getClockAdjustedState(remoteRoom.tournamentState);

      applyingRemoteRef.current = true;
      lastPublishedSignatureRef.current = getSyncSignature(adjustedRemoteState);
      setTournamentState(adjustedRemoteState);

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

    const publishState = getClockAdjustedState(tournamentState);
    const nextSignature = getSyncSignature(publishState);

    // Ikke publiser rene lokale timer-ticks.
    if (nextSignature === lastPublishedSignatureRef.current) {
      return undefined;
    }

    window.clearTimeout(publishTimerRef.current);

    publishTimerRef.current = window.setTimeout(() => {
      lastPublishedSignatureRef.current = nextSignature;

      publishFirebaseRoomState({
        roomId,
        clientId: clientIdRef.current,
        tournamentState: publishState,
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
