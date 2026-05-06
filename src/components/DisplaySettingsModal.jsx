const SETTINGS = [
  {
    key: 'timerScale',
    title: 'Timer',
    help: 'Størrelse på timer-ringen og teksten inni.',
    min: 0.85,
    max: 1.55,
    step: 0.01,
  },
  {
    key: 'ringSegmentScale',
    title: 'Ring-streker',
    help: 'Tykkelse/størrelse på strekene rundt timeren.',
    min: 0.8,
    max: 1.45,
    step: 0.01,
  },
  {
    key: 'timerSegmentCount',
    title: 'Antall streker',
    help: 'Flere streker gjør ringen tettere på stor skjerm.',
    min: 48,
    max: 96,
    step: 1,
  },
  {
    key: 'blindScale',
    title: 'Blind-paneler',
    help: 'Størrelse på nåværende/neste level-panelene.',
    min: 0.85,
    max: 1.55,
    step: 0.01,
  },
  {
    key: 'positionScale',
    title: 'Posisjonskort',
    help: 'Størrelse på spillerkortene nederst.',
    min: 0.85,
    max: 1.55,
    step: 0.01,
  },
  {
    key: 'setupScale',
    title: 'Setup',
    help: 'Størrelse på setup-skjermen.',
    min: 0.85,
    max: 1.35,
    step: 0.01,
  },
  {
    key: 'buttonScale',
    title: 'Knapper',
    help: 'Generell knappestørrelse og play/pause-knappen.',
    min: 0.85,
    max: 1.45,
    step: 0.01,
  },
];

export default function DisplaySettingsModal({
  isOpen,
  displaySettings,
  onChange,
  onReset,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop active"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal display-settings-modal">
        <div className="utility-line">
          <div>
            <h3>Skjerm</h3>
            <p className="small-note modal-note">Juster visningen live for TV, projektor eller PC.</p>
          </div>
          <button type="button" className="btn btn-gray btn-small" onClick={onClose}>
            Lukk
          </button>
        </div>

        <div className="display-settings-grid">
          {SETTINGS.map((setting) => {
            const value = displaySettings[setting.key];

            return (
              <div className="display-setting-row" key={setting.key}>
                <div>
                  <div className="display-setting-name">{setting.title}</div>
                  <div className="display-setting-help">{setting.help}</div>
                </div>

                <input
                  type="range"
                  min={setting.min}
                  max={setting.max}
                  step={setting.step}
                  value={value}
                  onChange={(event) => onChange(setting.key, event.target.value)}
                />

                <div className="display-setting-value">
                  {setting.key === 'timerSegmentCount'
                    ? Math.round(value)
                    : Number(value).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="display-settings-actions">
          <button type="button" className="btn btn-gray" onClick={onReset}>
            Nullstill skjerm
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Ferdig
          </button>
        </div>
      </div>
    </div>
  );
}
