import { useEffect, useRef } from 'react';

export function useWakeLock(enabled) {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function requestWakeLock() {
      if (!enabled || !('wakeLock' in navigator) || wakeLockRef.current) return;

      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');

        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch (err) {
        console.warn(`Wake Lock feilet: ${err.name} - ${err.message}`);
      }
    }

    async function releaseWakeLock() {
      if (!wakeLockRef.current) return;

      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.warn(`Kunne ikke slippe Wake Lock: ${err.name} - ${err.message}`);
      } finally {
        wakeLockRef.current = null;
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && enabled && !cancelled) {
        requestWakeLock();
      }
    }

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [enabled]);
}
