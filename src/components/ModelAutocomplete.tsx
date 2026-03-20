import { useState, useRef, useEffect } from 'react';
import { ALL_MODEL_PRESETS, type ModelPreset } from '../db/model-presets';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect: (preset: ModelPreset) => void;
}

export default function ModelAutocomplete({ value, onChange, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = value.length >= 2
    ? ALL_MODEL_PRESETS.filter(m =>
        m.name.toLowerCase().includes(value.toLowerCase()) ||
        m.faction.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Start typing a unit name or faction..."
      />
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: '8px', marginTop: 4, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {results.map((m, i) => (
            <div
              key={`${m.faction}-${m.name}-${i}`}
              onClick={() => { onSelect(m); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {m.faction} · {m.unitType} · Qty: {m.defaultQty}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
