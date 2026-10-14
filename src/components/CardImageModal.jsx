import '../styles/cardImageModal.css';

export default function CardImageModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop active"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal card-image-modal">
        <div className="card-image-modal-head">
          <h2>♣️10</h2>

          <button type="button" className="btn btn-gray btn-small" onClick={onClose}>
            Lukk
          </button>
        </div>

        <img
          className="card-image-modal-image"
          src={`${import.meta.env.BASE_URL}kort.png`}
          alt="Kort"
        />
      </div>
    </div>
  );
}
