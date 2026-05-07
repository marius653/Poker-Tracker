import { useState } from 'react';
import { normalizeRoomId } from '../sync/roomId.js';

export default function JoinRoomModal({
  isOpen,
  onClose,
  onJoinRoom,
}) {
  const [roomCode, setRoomCode] = useState('');

  if (!isOpen) return null;

  function handleSubmit(event) {
    event.preventDefault();

    const normalizedRoomCode = normalizeRoomId(roomCode);

    if (!normalizedRoomCode) {
      window.alert('Skriv inn en gyldig room code.');
      return;
    }

    onJoinRoom(normalizedRoomCode);
  }

  return (
    <div
      className="modal-backdrop active"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="modal join-room-modal" onSubmit={handleSubmit}>
        <div className="utility-line">
          <div>
            <h3>Bli med i rom</h3>
            <p className="small-note modal-note">
              Skriv inn room code fra PC-en. Dette brukes for iPad/kontrollside.
            </p>
          </div>

          <button type="button" className="btn btn-gray btn-small" onClick={onClose}>
            Lukk
          </button>
        </div>

        <div className="field">
          <label htmlFor="roomCode">Room code</label>
          <input
            id="roomCode"
            type="text"
            autoFocus
            value={roomCode}
            placeholder="F.eks. K7P2XQ"
            onChange={(event) => setRoomCode(normalizeRoomId(event.target.value))}
          />
        </div>

        <div className="footer-actions align-end">
          <button type="submit" className="btn btn-primary">
            Bli med
          </button>
        </div>
      </form>
    </div>
  );
}
