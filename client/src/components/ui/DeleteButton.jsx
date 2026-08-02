import { useRef, useState } from 'react';

export default function DeleteButton({ onConfirm, title = 'Удалить' }) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef(null);

  const handleClick = () => {
    if (confirming) {
      clearTimeout(timerRef.current);
      setConfirming(false);
      onConfirm();
    } else {
      setConfirming(true);
      timerRef.current = setTimeout(() => setConfirming(false), 2500);
    }
  };

  return (
    <button
      type="button"
      className={`icon-del${confirming ? ' confirm' : ''}`}
      title={confirming ? 'Нажмите ещё раз для подтверждения' : title}
      onClick={handleClick}
    >
      ✕
    </button>
  );
}
