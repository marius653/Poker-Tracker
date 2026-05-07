const ROOM_ID_KEY = 'pokerTimerRoomId';

export function normalizeRoomId(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12);
}

export function createRoomId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';

  for (let i = 0; i < 6; i += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return id;
}

export function getOrCreateRoomId() {
  const existing = localStorage.getItem(ROOM_ID_KEY);

  if (existing) return existing;

  const roomId = createRoomId();
  localStorage.setItem(ROOM_ID_KEY, roomId);

  return roomId;
}

export function setStoredRoomId(roomId) {
  const normalizedRoomId = normalizeRoomId(roomId);

  if (!normalizedRoomId) return null;

  localStorage.setItem(ROOM_ID_KEY, normalizedRoomId);

  return normalizedRoomId;
}

export function resetRoomId() {
  const roomId = createRoomId();
  localStorage.setItem(ROOM_ID_KEY, roomId);

  return roomId;
}
