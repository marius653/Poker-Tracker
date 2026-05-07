export default function RoomBadge({ roomId, label = 'Room' }) {
  return (
    <div className="room-badge" title="Dette blir brukt når vi kobler på iPad/Firebase senere.">
      <span className="room-badge-label">{label}</span>
      <span className="room-badge-code">{roomId}</span>
    </div>
  );
}
