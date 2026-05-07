import { useEffect, useState } from 'react';
import '../styles/fullscreen.css';

function canUseFullscreen() {
  return Boolean(
    document.documentElement.requestFullscreen
      || document.documentElement.webkitRequestFullscreen,
  );
}

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }

        return;
      }

      const root = document.documentElement;

      if (root.requestFullscreen) {
        await root.requestFullscreen();
      } else if (root.webkitRequestFullscreen) {
        await root.webkitRequestFullscreen();
      }
    } catch (error) {
      console.warn('Kunne ikke endre fullskjerm.', error);
    }
  }

  if (!canUseFullscreen()) return null;

  return (
    <button
      type="button"
      className="btn btn-gray control-nav-btn fullscreen-btn"
      onClick={toggleFullscreen}
    >
      {isFullscreen ? 'Avslutt fullskjerm' : 'Fullskjerm'}
    </button>
  );
}
