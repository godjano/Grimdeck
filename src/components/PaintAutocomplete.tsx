import { useState, useRef, useEffect } from 'react';
import { ALL_PAINT_PRESETS, type PaintPreset } from '../db/paint-presets';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect: (preset: PaintPreset) => void;
}

export default function PaintAutocomplete({ value, onChange, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = value.length >= 2
    ? ALL_PAINT_PRESETS.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase())
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
        placeholder="Start typing a paint name..."
      />
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: '8px', marginTop: 4, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {results.map((p, i) => (
            <div
              key={`${p.brand}-${p.name}-${i}`}
              onClick={() => { onSelect(p); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: p.hex, border: '2px solid var(--border)', flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {p.brand} · {p.range} · {p.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
