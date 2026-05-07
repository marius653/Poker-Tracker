import RoundPanelContent from './RoundPanelContent.jsx';
import '../styles/roundPanel.css';

export default function RoundPage({
  tournamentState,
  setTournamentState,
  onBackToTimer,
}) {
  return (
    <div className="round-page">
      <div className="round-page-topbar">
        <button type="button" className="btn btn-gray" onClick={onBackToTimer}>
          &larr; Til timer
        </button>

        <div className="round-page-title">
          Rundeside
        </div>
      </div>

      <div className="round-page-panel">
        <RoundPanelContent
          tournamentState={tournamentState}
          setTournamentState={setTournamentState}
          onClose={onBackToTimer}
          headerAction={(
            <button type="button" className="btn btn-gray btn-small" onClick={onBackToTimer}>
              Til timer
            </button>
          )}
        />
      </div>
    </div>
  );
}
