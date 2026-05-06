import { useCallback, useRef } from 'react';

export function useLevelSound(src) {
  const audioRef = useRef(null);

  function getAudio() {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.preload = 'auto';
    }

    return audioRef.current;
  }

  const primeLevelUpSound = useCallback(() => {
    const audio = getAudio();
    const originalVolume = audio.volume;

    audio.volume = 0;

    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = originalVolume;
      })
      .catch(() => {
        audio.volume = originalVolume;
      });
  }, [src]);

  const playLevelUpSound = useCallback(() => {
    const audio = getAudio();
    audio.currentTime = 0;

    audio.play().catch((err) => {
      console.warn('Kunne ikke spille av level-lyd.', err);
    });
  }, [src]);

  return {
    primeLevelUpSound,
    playLevelUpSound,
  };
}
