import GoldIcon from './GoldIcon';
import { ALL_PAINT_PRESETS } from '../db/paint-presets';

function hexToRgb(hex: string): [number, number, number] {
  const h = (hex || '#888').replace('#', '');
  return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0];
}

function colorDist(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function findEquivalents(paintName: string, maxResults = 5): { name: string; brand: string; hex: string; distance: number }[] {
  const source = ALL_PAINT_PRESETS.find(p => p.name.toLowerCase() === paintName.toLowerCase());
  if (!source) return [];

  return ALL_PAINT_PRESETS
    .filter(p => p.name !== source.name && p.brand !== source.brand)
    .map(p => ({ name: p.name, brand: p.brand, hex: p.hex, distance: colorDist(source.hex, p.hex) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults);
}

import { useState } from 'react';

export default function PaintMatcher() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<ReturnType<typeof findEquivalents>>([]);
  const [sourcePaint, setSourcePaint] = useState<typeof ALL_PAINT_PRESETS[0] | null>(null);

  const doSearch = () => {
    const paint = ALL_PAINT_PRESETS.find(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (paint) {
      setSourcePaint(paint);
      setResults(findEquivalents(paint.name, 8));
    }
  };

  return (
    <div className="tool-card">
      <h3><GoldIcon name="settings" size={18} /> Paint Matcher</h3>
      <p className="settings-desc">Find equivalent paints across brands. Type a paint name to see matches.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="e.g. Mephiston Red" className="tool-input" style={{ marginBottom: 0 }} onKeyDown={e => e.key === 'Enter' && doSearch()} />
        <button className="btn btn-sm btn-primary" onClick={doSearch}>Match</button>
      </div>
      {sourcePaint && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: sourcePaint.hex, border: '2px solid var(--border)' }} />
            <span style={{ fontWeight: 600 }}>{sourcePaint.name}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{sourcePaint.brand}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 8 }}>Closest matches from other brands:</div>
          {results.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: r.hex, border: '1px solid var(--border)' }} />
              <span style={{ fontWeight: 500, fontSize: '0.85rem', flex: 1 }}>{r.name}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{r.brand}</span>
              <span style={{ fontSize: '0.65rem', color: r.distance < 30 ? 'var(--success)' : r.distance < 60 ? 'var(--gold)' : 'var(--text-dim)' }}>
                {r.distance < 30 ? '★ Very close' : r.distance < 60 ? '● Close' : '○ Similar'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
