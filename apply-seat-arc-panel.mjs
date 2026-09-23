import fs from 'node:fs';

const filePath = 'src/components/PositionBoard.jsx';

if (!fs.existsSync(filePath)) {
  throw new Error(`Fant ikke ${filePath}`);
}

let text = fs.readFileSync(filePath, 'utf8');

function replaceRequired(from, to, label) {
  if (!text.includes(from)) {
    throw new Error(
      `Fant ikke forventet kode for "${label}". PositionBoard.jsx ble ikke skrevet.`,
    );
  }

  text = text.replace(from, to);
}

if (!text.includes("import '../styles/positionBoardArc.css';")) {
  replaceRequired(
    "import '../styles/firstToAct.css';",
    "import '../styles/firstToAct.css';\nimport '../styles/positionBoardArc.css';",
    'CSS-import',
  );
}

if (!text.includes('const seatCount = tournamentState.players.length;')) {
  replaceRequired(
    '  const firstToActPlayerId = getFirstToActPlayerId(tournamentState);',
    `  const firstToActPlayerId = getFirstToActPlayerId(tournamentState);
  const seatCount = tournamentState.players.length;`,
    'seatCount',
  );
}

if (!text.includes('tournamentState.players.map((player, seatIndex) => (')) {
  replaceRequired(
    'tournamentState.players.map((player) => (',
    'tournamentState.players.map((player, seatIndex) => (',
    'seatIndex',
  );
}

const oldCardOpen = `          <div
            className={\`position-card \${player.eliminated ? 'eliminated' : ''} \${
              player.currentPosition === 'Dealer' ? 'dealer-highlight' : ''
            } \${
              player.id === firstToActPlayerId ? 'first-to-act-highlight' : ''
            }\`}
            key={player.id}
          >`;

const newCardOpen = `          <div
            className={\`position-card arc-seat \${player.eliminated ? 'eliminated' : ''} \${
              player.currentPosition === 'Dealer' ? 'dealer-highlight' : ''
            } \${
              player.id === firstToActPlayerId ? 'first-to-act-highlight' : ''
            }\`}
            key={player.id}
            style={{
              '--seat-lift': \`\${Math.max(
                0,
                Math.round(
                  (
                    1
                    - (
                      Math.abs(seatIndex - ((seatCount - 1) / 2))
                      / Math.max(1, (seatCount - 1) / 2)
                    )
                  ) * 28,
                ),
              )}px\`,
            }}
          >
            <div className="position-seat-markers">
              {player.currentPosition === 'Dealer' && (
                <span className="position-marker marker-dealer">D</span>
              )}
              {player.currentPosition === 'Small Blind' && (
                <span className="position-marker marker-small-blind">SB</span>
              )}
              {player.currentPosition === 'Big Blind' && (
                <span className="position-marker marker-big-blind">BB</span>
              )}
              {player.id === firstToActPlayerId && (
                <span className="position-marker marker-to-act">Act</span>
              )}
            </div>`;

if (!text.includes('className="position-seat-markers"')) {
  replaceRequired(oldCardOpen, newCardOpen, 'position-card');
}

fs.writeFileSync(filePath, text, 'utf8');

console.log('Seat-arc player panel er lagt inn.');
console.log('Kjør npm run build.');
