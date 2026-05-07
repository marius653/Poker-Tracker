const STATUS_LABELS = {
  offline: 'Lokal',
  connecting: 'Kobler',
  connected: 'Live',
  error: 'Feil',
};

export default function SyncStatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;

  return (
    <div className={`sync-status-badge ${status}`}>
      <span className="sync-status-dot" />
      <span>{label}</span>
    </div>
  );
}
