import { useEffect, useRef, useState } from 'react';

export default function TimerMenu({
  onOpenControlPage,
  onOpenDisplaySettings,
  onOpenStackModal,
  onOpenJoinRoom,
  onNewRoom,
  onReset,
}) {
  const [open, setOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef(null);

  const fullscreenSupported = Boolean(
    document.documentElement.requestFullscreen
      || document.documentElement.webkitRequestFullscreen,
  );

  useEffect(() => {
    function syncFullscreenState() {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    }

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    syncFullscreenState();

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', syncFullscreenState);
    document.addEventListener('webkitfullscreenchange', syncFullscreenState);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', syncFullscreenState);
      document.removeEventListener('webkitfullscreenchange', syncFullscreenState);
    };
  }, []);

  function runAction(action) {
    setOpen(false);
    action?.();
  }

  async function handleFullscreen() {
    try {
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;

      if (fullscreenElement) {
        const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
        await exitFullscreen?.call(document);
      } else {
        const root = document.documentElement;
        const requestFullscreen = root.requestFullscreen || root.webkitRequestFullscreen;
        await requestFullscreen?.call(root);
      }
    } catch (error) {
      console.warn('Kunne ikke endre fullskjermmodus.', error);
    } finally {
      setOpen(false);
    }
  }

  return (
    <div className="timer-menu" ref={menuRef}>
      <button
        type="button"
        className={`btn btn-gray timer-menu-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="timer-menu-icon" aria-hidden="true">☰</span>
        Meny
      </button>

      {open && (
        <div className="timer-menu-dropdown panel" role="menu">
          <button
            type="button"
            className="timer-menu-item"
            role="menuitem"
            onClick={() => runAction(onOpenControlPage)}
          >
            Kontrollpanel
          </button>

          <button
            type="button"
            className="timer-menu-item"
            role="menuitem"
            onClick={handleFullscreen}
            disabled={!fullscreenSupported}
          >
            {isFullscreen ? 'Avslutt fullskjerm' : 'Fullskjerm'}
          </button>

          <button
            type="button"
            className="timer-menu-item"
            role="menuitem"
            onClick={() => runAction(onOpenDisplaySettings)}
          >
            Skjerminnstillinger
          </button>

          <button
            type="button"
            className="timer-menu-item"
            role="menuitem"
            onClick={() => runAction(onOpenStackModal)}
          >
            Endre stacks
          </button>

          <button
            type="button"
            className="timer-menu-item"
            role="menuitem"
            onClick={() => runAction(onOpenJoinRoom)}
          >
            Bli med
          </button>

          <button
            type="button"
            className="timer-menu-item"
            role="menuitem"
            onClick={() => runAction(onNewRoom)}
          >
            Nytt rom
          </button>

          <div className="timer-menu-divider" aria-hidden="true" />

          <button
            type="button"
            className="timer-menu-item timer-menu-item-danger"
            role="menuitem"
            onClick={() => runAction(onReset)}
          >
            Avslutt turnering
          </button>
        </div>
      )}
    </div>
  );
}
