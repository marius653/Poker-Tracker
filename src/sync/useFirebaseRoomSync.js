import { useEffect, useRef, useState } from 'react';
import { getClientId } from './clientId.js';
import {
  publishFirebaseRoomState,
  subscribeToFirebaseRoom,
} from './firebaseRoomStorage.js';

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

      if (remoteRoom.clientId === clientIdRef.current) {
        return;
      }

      applyingRemoteRef.current = true;
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
    if (!enabled || !roomId) return;
    if (applyingRemoteRef.current) return;
    if (!tournamentState?.players?.length) return;

    window.clearTimeout(publishTimerRef.current);

    publishTimerRef.current = window.setTimeout(() => {
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
