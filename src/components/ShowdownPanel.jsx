import { formatNumber } from '../utils/format.js';

function safeBuildSidePots(tournamentState) {
  const handState = tournamentState?.handState;

  if (!handState) return [];

  const contributors = tournamentState.players
    .map((player) => ({
      playerId: player.id,
      amount: Number(handState.totalCommitted?.[player.id]) || 0,
      folded: Boolean(handState.folded?.[player.id]),
    }))
    .filter((contributor) => contributor.amount > 0)
    .sort((a, b) => a.amount - b.amount);

  const sidePots = [];
  let previousAmount = 0;

  while (contributors.length > 0) {
    const minimumAmount = contributors[0].amount;
    const potLayer = minimumAmount - previousAmount;
    const activeLayer = contributors.filter((contributor) => contributor.amount >= minimumAmount);
    const totalPot = potLayer * activeLayer.length;
    const eligiblePlayerIds = activeLayer
      .filter((contributor) => !contributor.folded)
      .map((contributor) => contributor.playerId);

    if (totalPot > 0) {
      sidePots.push({
        amount: totalPot,
        eligiblePlayerIds,
      });
    }

    previousAmount = minimumAmount;

    while (contributors.length > 0 && contributors[0].amount === minimumAmount) {
      contributors.shift();
    }
  }

  return sidePots;
}

export default function ShowdownPanel({
  tournamentState,
  onToggleWinner,
}) {
  const handState = tournamentState?.handState;
  const pots = safeBuildSidePots(tournamentState);

  if (!handState) {
    return (
      <div className="winners-panel showdown-panel">
        <h3>Vinnerfordeling</h3>
        <p className="round-small-note">Ingen aktiv runde.</p>
      </div>
    );
  }

  if (pots.length === 0) {
    return (
      <div className="winners-panel showdown-panel">
        <h3>Vinnerfordeling</h3>
        <p className="round-small-note">
          Ingen potter å fordele enda. Gå tilbake og legg inn chips/blinds før
          du avslutter runden.
        </p>
      </div>
    );
  }

  return (
    <div className="winners-panel showdown-panel">
      <h3>Vinnerfordeling</h3>

      <p className="round-small-note">
        Velg én eller flere vinnere per pot. Ved split pot huker du av flere
        spillere.
      </p>

      {pots.map((pot, potIndex) => {
        const selectedWinnerIds = handState.winnersByPot?.[potIndex] || [];
        const eligiblePlayers = tournamentState.players.filter((player) =>
          pot.eligiblePlayerIds.includes(player.id),
        );

        return (
          <div className="winner-group" key={`pot-${potIndex}`}>
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
