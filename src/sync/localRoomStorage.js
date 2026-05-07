const STORAGE_PREFIX = 'pokerTimerRoomState';
const ACTIVE_ROOM_KEY = 'pokerTimerActiveRoom';

export function getRoomStorageKey(roomId) {
  return `${STORAGE_PREFIX}:${roomId}`;
}

export function loadLocalRoomState(roomId) {
  try {
    const raw = localStorage.getItem(getRoomStorageKey(roomId));

    if (!raw) return null;

    return JSON.parse(raw);
  } catch (error) {
    console.warn('Kunne ikke lese lokal room-state.', error);
    return null;
  }
}

export function loadActiveRoomData() {
  try {
    const raw = localStorage.getItem(ACTIVE_ROOM_KEY);

    if (!raw) return null;

    return JSON.parse(raw);
  } catch (error) {
    console.warn('Kunne ikke lese aktiv room-state.', error);
    return null;
  }
}

export function saveLocalRoomState(roomId, data) {
  try {
    const payload = {
      ...data,
      roomId,
      savedAt: Date.now(),
    };

    localStorage.setItem(getRoomStorageKey(roomId), JSON.stringify(payload));
    localStorage.setItem(ACTIVE_ROOM_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Kunne ikke lagre lokal room-state.', error);
  }
}

export function clearLocalRoomState(roomId) {
  try {
    localStorage.removeItem(getRoomStorageKey(roomId));
    localStorage.removeItem(ACTIVE_ROOM_KEY);
  } catch (error) {
    console.warn('Kunne ikke slette lokal room-state.', error);
  }
}
