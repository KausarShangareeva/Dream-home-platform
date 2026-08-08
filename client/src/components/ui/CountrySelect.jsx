import { useEffect, useRef, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';

export default function CountrySelect({ value, options, onChange, style }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const current = options.find(o => o.code === value);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="lang-select ac-wrap" ref={wrapRef} style={style}>
      <button type="button" className="lang-select-trigger compact" onClick={() => setOpen(o => !o)} title={current?.name || 'Страна не указана'}>
        {current
          ? <ReactCountryFlag countryCode={current.code} svg style={{ width: '1.3em', height: '1.3em' }} />
          : <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>—</span>}
        <span className="lang-select-caret">▾</span>
      </button>
      <div className={`ac-dropdown${open ? ' open' : ''}`}>
        <div className="ac-item lang-select-item" onClick={() => { onChange(''); setOpen(false); }}>— не указано —</div>
        {options.map(o => (
          <div key={o.code} className="ac-item lang-select-item" onClick={() => { onChange(o.code); setOpen(false); }}>
            <ReactCountryFlag countryCode={o.code} svg style={{ width: '1.2em', height: '1.2em' }} /> {o.name}
          </div>
        ))}
      </div>
    </div>
  );
}
