import {
  get,
  off,
  onValue,
  ref,
  serverTimestamp,
  set,
} from 'firebase/database';
import { firebaseDatabase } from '../firebase/firebaseConfig.js';

export function getFirebaseRoomRef(roomId) {
  return ref(firebaseDatabase, `rooms/${roomId}`);
}

export async function getFirebaseRoomState(roomId) {
  const snapshot = await get(getFirebaseRoomRef(roomId));

  if (!snapshot.exists()) return null;

  return snapshot.val();
}

export async function publishFirebaseRoomState({
  roomId,
  clientId,
  tournamentState,
}) {
  if (!roomId || !tournamentState) return;

  await set(getFirebaseRoomRef(roomId), {
    roomId,
    clientId,
    updatedAt: serverTimestamp(),
    tournamentState,
  });
}

export function subscribeToFirebaseRoom(roomId, callback) {
  const roomRef = getFirebaseRoomRef(roomId);

  onValue(roomRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });

  return () => off(roomRef);
}
