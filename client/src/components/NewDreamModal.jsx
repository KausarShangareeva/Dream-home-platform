import { useRef, useState } from 'react';

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

export default function NewDreamModal({
  open, onClose, onSave,
  modalTitle = '✨ Новая мечта', saveLabel = 'Добавить мечту', namePlaceholder = 'Название мечты',
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(RANDOM_ICONS[Math.floor(Math.random() * RANDOM_ICONS.length)]);
  const [target, setTarget] = useState('');
  const [photo, setPhoto] = useState(null);
  const fileInput = useRef(null);

  if (!open) return null;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(await compressImage(file));
  };

  const save = () => {
    if (!name.trim()) return alert('Впишите название');
    if (!target || Number(target) <= 0) return alert('Укажите цель больше 0');
    onSave({ title: name.trim(), target: Number(target), icon: icon || '🎯', photo });
    setName(''); setTarget(''); setPhoto(null);
    setIcon(RANDOM_ICONS[Math.floor(Math.random() * RANDOM_ICONS.length)]);
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
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

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={save}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}
