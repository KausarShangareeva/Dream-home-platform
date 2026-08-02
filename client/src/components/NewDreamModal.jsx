import { useRef, useState, useEffect } from 'react';

const RANDOM_ICONS = ['🎯', '⭐', '🌟', '🎁', '🏆', '🎈', '🌈', '💎', '🚀', '🎨', '🏕️', '🎪'];

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 480;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Parses a CSS object-position string like "50% 30%" or "center" into {x, y} percentages.
function parsePos(pos) {
  if (!pos || pos === 'center') return { x: 50, y: 50 };
  const parts = pos.trim().split(/\s+/).map(v => parseFloat(v));
  return { x: Number.isFinite(parts[0]) ? parts[0] : 50, y: Number.isFinite(parts[1]) ? parts[1] : 50 };
}

export default function NewDreamModal({
  open, onClose, onSave,
  modalTitle = '✨ Новая мечта', saveLabel = 'Добавить мечту', namePlaceholder = 'Название мечты',
  editingDream = null, // pass an existing dream/trip object to edit it instead of creating a new one
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(RANDOM_ICONS[Math.floor(Math.random() * RANDOM_ICONS.length)]);
  const [target, setTarget] = useState('');
  const [photo, setPhoto] = useState(null);
  const [posY, setPosY] = useState(50);
  const fileInput = useRef(null);

  // Pre-fill fields when opening in edit mode.
  useEffect(() => {
    if (open && editingDream) {
      setName(editingDream.title || '');
      setIcon(editingDream.icon || '🎯');
      setTarget(editingDream.target ? String(editingDream.target) : '');
      setPhoto(editingDream.photo || null);
      const { y } = parsePos(editingDream.pos);
      setPosY(y);
    } else if (open && !editingDream) {
      setName(''); setTarget(''); setPhoto(null); setPosY(50);
      setIcon(RANDOM_ICONS[Math.floor(Math.random() * RANDOM_ICONS.length)]);
    }
  }, [open, editingDream]);

  if (!open) return null;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(await compressImage(file));
    setPosY(50); // reset focal point for the new photo
  };

  const save = () => {
    if (!name.trim()) return alert('Впишите название');
    if (!target || Number(target) <= 0) return alert('Укажите цель больше 0');
    onSave({
      title: name.trim(),
      target: Number(target),
      icon: icon || '🎯',
      photo,
      pos: photo ? `50% ${posY}%` : 'center',
    });
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-card form-modal" onClick={e => e.stopPropagation()}>
        <h3>{modalTitle}</h3>

        <div className="modal-section field">
          <input value={name} onChange={e => setName(e.target.value)} placeholder={namePlaceholder} />
        </div>

        <div className="modal-section form-row" style={{ margin: 0 }}>
          <div className="field" style={{ maxWidth: 90 }}>
            <input value={icon} onChange={e => setIcon(e.target.value)} maxLength={4} />
          </div>
          <div className="field">
            <input type="number" min="1" value={target} onChange={e => setTarget(e.target.value)} placeholder="Сколько нужно накопить" />
          </div>
        </div>

        <div className="modal-section field">
          <input ref={fileInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => fileInput.current.click()}
          >
            📷 Загрузить фото {photo ? '(выбрано)' : ''}
          </button>
        </div>

        {photo && (
          <div className="modal-section field">
            <label>Как обрезать фото на карточке</label>
            <div className="dream-photo-preview">
              <img src={photo} alt="" style={{ objectPosition: `50% ${posY}%` }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              <label style={{ fontSize: 11, color: 'var(--ink-soft)' }}>По вертикали</label>
              <input type="range" min="0" max="100" value={posY} onChange={e => setPosY(Number(e.target.value))} />
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={save}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}
