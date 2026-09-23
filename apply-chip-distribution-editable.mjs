import fs from 'node:fs';

const setupPath = 'src/components/SetupPage.jsx';
const modalPath = 'src/components/ChipDistributionModal.jsx';
const cssPath = 'src/styles/chipDistribution.css';

if (!fs.existsSync(setupPath) || !fs.existsSync(modalPath) || !fs.existsSync(cssPath)) {
  throw new Error(
    'Fant ikke eksisterende sjetongfordeling. Installer den første sjetongfordeling-patchen først.',
  );
}

let setup = fs.readFileSync(setupPath, 'utf8');

const oldBlock = `      <ChipDistributionModal
        isOpen={chipDistributionOpen}
        playerCount={playerCount}
        startStack={startStack}
        chipValues={chipValues}
        blindLevels={blindLevels}
        onClose={() => setChipDistributionOpen(false)}
      />`;

const newBlock = `      <ChipDistributionModal
        isOpen={chipDistributionOpen}
        playerCount={playerCount}
        startStack={startStack}
        chipValues={chipValues}
        blindLevels={blindLevels}
        onClose={() => setChipDistributionOpen(false)}
        onSaveStack={(nextStartStack) => {
          setStartStack(nextStartStack);
          setChipDistributionOpen(false);
        }}
      />`;

if (!setup.includes(oldBlock)) {
  throw new Error(
    'Fant ikke forventet ChipDistributionModal-blokk i SetupPage. Ingen filer ble endret.',
  );
}

setup = setup.replace(oldBlock, newBlock);

fs.writeFileSync(setupPath, setup, 'utf8');
fs.copyFileSync('patch-files/ChipDistributionModal.jsx', modalPath);
fs.copyFileSync('patch-files/chipDistribution.css', cssPath);

console.log('Sjetongfordeling er oppdatert.');
console.log('Antall chips kan nå redigeres før stacken lagres.');
console.log('Kjør npm run build og test før commit.');
