const CLIENT_ID_KEY = 'pokerTimerClientId';

export function getClientId() {
  const existing = localStorage.getItem(CLIENT_ID_KEY);

  if (existing) return existing;

  const id = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `client_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(CLIENT_ID_KEY, id);

  return id;
}
