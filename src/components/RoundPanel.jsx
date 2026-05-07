import RoundPanelContent from './RoundPanelContent.jsx';
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
        <RoundPanelContent
          tournamentState={tournamentState}
          setTournamentState={setTournamentState}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
