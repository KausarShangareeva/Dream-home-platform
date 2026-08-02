import { useEffect, useRef, useState } from 'react';
import Flag from './Flag.jsx';

// A dropdown that looks and behaves like a <select> but isn't one — native <option>
// elements can only render plain text, so flag icons (SVG or emoji) never show up
// reliably inside them across platforms. This renders real <Flag> icons instead.
export default function LanguageSelect({ value, options, onChange, returnField = 'name', style }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const current = options.find(o => o.name === value || o.key === value) || options[0];

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="lang-select ac-wrap" ref={wrapRef} style={style}>
      <button type="button" className="lang-select-trigger" onClick={() => setOpen(o => !o)}>
        <Flag langKey={current?.key} />
        <span>{current?.name || 'Выберите...'}</span>
        <span className="lang-select-caret">▾</span>
      </button>
      <div className={`ac-dropdown${open ? ' open' : ''}`}>
        {options.map(o => (
          <div
            key={o.key}
            className="ac-item lang-select-item"
            onClick={() => { onChange(o[returnField]); setOpen(false); }}
          >
            <Flag langKey={o.key} /> {o.name}
          </div>
        ))}
      </div>
    </div>
  );
}
