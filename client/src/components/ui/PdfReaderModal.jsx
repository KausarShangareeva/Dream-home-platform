export default function PdfReaderModal({ title, pdfUrl, onClose }) {
  return (
    <div className="modal-backdrop open pdf-reader-backdrop" onClick={onClose}>
      <div className="pdf-reader-card" onClick={e => e.stopPropagation()}>
        <div className="pdf-reader-head">
          <span className="pdf-reader-title">{title}</span>
          <button type="button" className="pdf-reader-close" onClick={onClose}>✕</button>
        </div>
        <iframe title={title} src={pdfUrl} className="pdf-reader-frame" />
      </div>
    </div>
  );
}
