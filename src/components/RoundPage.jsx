import RoomBadge from './RoomBadge.jsx';
import RoundPanelContent from './RoundPanelContent.jsx';
import RoundPanelErrorBoundary from './RoundPanelErrorBoundary.jsx';
import SyncStatusBadge from './SyncStatusBadge.jsx';
import '../styles/roundPanel.css';

export default function RoundPage({
  roomId,
  syncStatus,
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

        <div className="button-cluster">
          <RoomBadge roomId={roomId} label="Room" />
          <SyncStatusBadge status={syncStatus} />
        </div>

        <div className="round-page-title">
          Rundeside
        </div>
      </div>

      <div className="round-page-panel">
        <RoundPanelErrorBoundary>
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
        </RoundPanelErrorBoundary>
      </div>
    </div>
  );
}
