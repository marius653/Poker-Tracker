import RoundPanelContent from './RoundPanelContent.jsx';
import RoundPanelErrorBoundary from './RoundPanelErrorBoundary.jsx';
import '../styles/roundPanel.css';

export default function RoundPanel({
  isOpen,
  tournamentState,
  setTournamentState,
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
      <div className="round-panel-modal">
        <RoundPanelErrorBoundary>
          <RoundPanelContent
            tournamentState={tournamentState}
            setTournamentState={setTournamentState}
            onClose={onClose}
          />
        </RoundPanelErrorBoundary>
      </div>
    </div>
  );
}
