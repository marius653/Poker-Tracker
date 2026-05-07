import { useEffect, useState } from 'react';
import { createDisplaySettingsDefaults } from '../state/initialState.js';

const STORAGE_KEY = 'pokerTimerDisplaySettings';

export function useDisplaySettings() {
  const [displaySettings, setDisplaySettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

      return {
        ...createDisplaySettingsDefaults(),
        ...saved,
      };
    } catch {
      return createDisplaySettingsDefaults();
    }
  });

  useEffect(() => {
    const cssVariables = {
      '--timer-scale': displaySettings.timerScale,
      '--ring-segment-scale': displaySettings.ringSegmentScale,
      '--blind-scale': displaySettings.blindScale,
      '--position-scale': displaySettings.positionScale,
      '--setup-scale': displaySettings.setupScale,
      '--button-scale': displaySettings.buttonScale,
      '--hand-rankings-scale': displaySettings.handRankingsScale,
    };

    Object.entries(cssVariables).forEach(([name, value]) => {
      document.body.style.setProperty(name, value);
    });

    document.body.classList.add('tv-mode');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(displaySettings));
  }, [displaySettings]);

  function updateDisplaySetting(key, value) {
    setDisplaySettings((current) => ({
      ...current,
      [key]: key === 'timerSegmentCount'
        ? Math.round(Number(value))
        : Number(value),
    }));
  }

  function resetDisplaySettings() {
    setDisplaySettings(createDisplaySettingsDefaults());
  }

  return {
    displaySettings,
    updateDisplaySetting,
    resetDisplaySettings,
  };
}
