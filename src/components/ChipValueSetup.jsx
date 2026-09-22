import ChipVisual from './ChipVisual.jsx';
import {
  DEFAULT_CHIP_VALUES,
  getChipTypes,
} from '../state/pokerConstants.js';

export default function ChipValueSetup({ chipValues, onChange }) {
  const chipTypes = getChipTypes(chipValues);

  function handleValueChange(key, rawValue) {
    const numericValue = Math.max(1, Math.round(Number(rawValue) || 0));

    onChange((currentValues) => ({
      ...currentValues,
      [key]: numericValue,
    }));
  }

  function handleReset() {
    onChange({ ...DEFAULT_CHIP_VALUES });
  }

  return (
    <section className="chip-value-panel panel">
      <div className="chip-value-heading">
        <div>
          <h3>Chipverdier</h3>
          <p className="muted">
            Verdiene brukes både i kontrollpanelet, potten og chipvisningen på timer-siden.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-gray btn-small"
          onClick={handleReset}
        >
          Standard
        </button>
      </div>

      <div className="chip-value-grid">
        {chipTypes.map((chip) => (
          <label className="chip-value-item" key={chip.key}>
            <ChipVisual chip={chip} size={58} />

            <span className="chip-value-name">{chip.name}</span>

            <input
              type="number"
              min="1"
              step="1"
              value={chipValues?.[chip.key] ?? chip.value}
              onChange={(event) => handleValueChange(chip.key, event.target.value)}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
