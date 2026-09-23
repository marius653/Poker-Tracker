import fs from 'node:fs';

const path = 'src/components/SetupPage.jsx';
let text = fs.readFileSync(path, 'utf8');

function replaceRequired(from, to, label) {
  if (!text.includes(from)) {
    throw new Error(`Fant ikke forventet kode for "${label}". SetupPage ble ikke skrevet.`);
  }

  text = text.replace(from, to);
}

replaceRequired(
  `import ChipValueSetup from './ChipValueSetup.jsx';`,
  `import ChipDistributionModal from './ChipDistributionModal.jsx';\nimport ChipValueSetup from './ChipValueSetup.jsx';`,
  'ChipDistributionModal import',
);

replaceRequired(
  `  const [autoBlindSetupOpen, setAutoBlindSetupOpen] = useState(false);`,
  `  const [autoBlindSetupOpen, setAutoBlindSetupOpen] = useState(false);\n  const [chipDistributionOpen, setChipDistributionOpen] = useState(false);`,
  'chip distribution modal state',
);

replaceRequired(
  `            <div className="stack-box panel">\n              <div className="field" style={{ marginBottom: 0 }}>\n                <label htmlFor="startStack">Start stack</label>\n                <input\n                  id="startStack"\n                  type="number"\n                  min="0"\n                  step="100"\n                  value={startStack}\n                  onChange={(event) => setStartStack(Number(event.target.value))}\n                />\n              </div>\n            </div>`,
  `            <div className="stack-box panel">\n              <div className="stack-box-actions">\n                <div className="field" style={{ marginBottom: 0 }}>\n                  <label htmlFor="startStack">Start stack</label>\n                  <input\n                    id="startStack"\n                    type="number"\n                    min="0"\n                    step="100"\n                    value={startStack}\n                    onChange={(event) => setStartStack(Number(event.target.value))}\n                  />\n                </div>\n\n                <button\n                  type="button"\n                  className="btn btn-gray"\n                  onClick={() => setChipDistributionOpen(true)}\n                >\n                  🪙 Sjetongfordeling\n                </button>\n              </div>\n            </div>`,
  'start stack helper button',
);

replaceRequired(
  `      <AutoBlindSetupModal\n        isOpen={autoBlindSetupOpen}`,
  `      <ChipDistributionModal\n        isOpen={chipDistributionOpen}\n        playerCount={playerCount}\n        startStack={startStack}\n        chipValues={chipValues}\n        blindLevels={blindLevels}\n        onClose={() => setChipDistributionOpen(false)}\n      />\n\n      <AutoBlindSetupModal\n        isOpen={autoBlindSetupOpen}`,
  'ChipDistributionModal render',
);

fs.writeFileSync(path, text, 'utf8');

console.log('Sjetongfordeling er lagt inn i Setup.');
console.log('Kjør npm run build og test før commit.');
