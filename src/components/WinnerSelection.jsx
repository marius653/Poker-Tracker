import { buildSidePots } from '../state/pokerLogic.js';
import { formatNumber } from '../utils/format.js';

export default function WinnerSelection({
  tournamentState,
  onToggleWinner,
}) {
  const pots = buildSidePots(tournamentState);

  if (!pots.length) {
    return (
      <div className="winners-panel">
        <h3>Vinnerfordeling</h3>
        <p className="round-small-note">Ingen potter å fordele enda.</p>
      </div>
    );
  }

  return (
    <div className="winners-panel">
      <h3>Vinnerfordeling</h3>
      <p className="round-small-note">
        Sidepots beregnes automatisk ut fra total innsats og fold-status.
        Velg én eller flere vinnere per pot for split pot.
      </p>

      {pots.map((pot, potIndex) => {
        const selectedWinnerIds = tournamentState.handState.winnersByPot[potIndex] || [];
        const eligiblePlayers = tournamentState.players.filter((player) =>
          pot.eligiblePlayerIds.includes(player.id),
        );

        return (
          <div className="winner-group" key={potIndex}>
            <div className="winner-title">
              Pot {potIndex + 1}: {formatNumber(pot.amount)}
            </div>

            <div className="round-small-note">
              Kan vinnes av: {eligiblePlayers.map((player) => player.name).join(', ') || 'Ingen'}
            </div>

            <div className="winner-checkboxes">
              {eligiblePlayers.map((player) => (
                <label key={player.id}>
                  <input
                    type="checkbox"
                    checked={selectedWinnerIds.includes(player.id)}
                    onChange={(event) => onToggleWinner(
                      potIndex,
                      player.id,
                      event.target.checked,
                    )}
                  />
                  {player.name}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
