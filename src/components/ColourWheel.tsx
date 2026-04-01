import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import GoldIcon from './GoldIcon';

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function colorDist(hex1: string, hex2: string): number {
  const [h1, s1, l1] = hexToHsl(hex1);
  const [h2, s2, l2] = hexToHsl(hex2);
  const hd = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180;
  return Math.sqrt(hd * hd + ((s1 - s2) / 100) ** 2 + ((l1 - l2) / 100) ** 2);
}

const HARMONIES = {
  complementary: (h: number) => [(h + 180) % 360],
  'split-complementary': (h: number) => [(h + 150) % 360, (h + 210) % 360],
  triadic: (h: number) => [(h + 120) % 360, (h + 240) % 360],
  analogous: (h: number) => [(h + 30) % 360, (h + 330) % 360],
  tetradic: (h: number) => [(h + 90) % 360, (h + 180) % 360, (h + 270) % 360],
};

export default function ColourWheel() {
  const paints = useLiveQuery(() => db.paints.toArray()) ?? [];
  const [selectedHue, setSelectedHue] = useState(210);
  const [harmony, setHarmony] = useState<keyof typeof HARMONIES>('complementary');

  const harmonyHues = [selectedHue, ...HARMONIES[harmony](selectedHue)];

  const findClosest = (targetHue: number) => {
    const targetHex = `hsl(${targetHue}, 70%, 50%)`;
    // Convert target to hex for comparison
    const el = document.createElement('canvas').getContext('2d')!;
    el.fillStyle = targetHex;
    const hex = el.fillStyle;
    return paints
      .filter(p => p.hexColor && p.hexColor.length >= 7)
      .map(p => ({ paint: p, dist: colorDist(hex, p.hexColor) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 4);
  };

  return (
    <div className="tool-card">
      <h3><GoldIcon name="paints" size={18} /> Colour Wheel</h3>
      <p className="settings-desc">Pick a primary colour and see harmonious matches from your paint rack.</p>

      {/* Wheel */}
      <div style={{ position: 'relative', width: 200, height: 200, margin: '16px auto' }}>
        <svg viewBox="0 0 200 200" onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left - 100, y = e.clientY - rect.top - 100;
          const angle = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
          setSelectedHue(Math.round(angle));
        }}>
          {Array.from({ length: 360 }, (_, i) => (
            <line key={i} x1="100" y1="100" x2={100 + 95 * Math.cos(i * Math.PI / 180)} y2={100 + 95 * Math.sin(i * Math.PI / 180)}
              stroke={`hsl(${i}, 70%, 50%)`} strokeWidth="3" />
          ))}
          {/* Harmony markers */}
          {harmonyHues.map((h, i) => (
            <circle key={i} cx={100 + 80 * Math.cos(h * Math.PI / 180)} cy={100 + 80 * Math.sin(h * Math.PI / 180)}
              r={i === 0 ? 10 : 7} fill={`hsl(${h}, 70%, 50%)`} stroke="#fff" strokeWidth="2" />
          ))}
        </svg>
      </div>

      {/* Harmony selector */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.keys(HARMONIES).map(h => (
          <button key={h} className={`btn btn-sm ${harmony === h ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.68rem', padding: '3px 8px', textTransform: 'capitalize' }}
            onClick={() => setHarmony(h as any)}>{h}</button>
        ))}
      </div>

      {/* Results */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${harmonyHues.length}, 1fr)`, gap: 8 }}>
        {harmonyHues.map((hue, i) => {
          const matches = findClosest(hue);
          return (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `hsl(${hue}, 70%, 50%)`, margin: '0 auto 6px', border: '2px solid var(--border)' }} />
              <div style={{ fontSize: '0.65rem', color: 'var(--gold)', marginBottom: 4 }}>{i === 0 ? 'Primary' : `Harmony ${i}`}</div>
              {matches.map(({ paint: p }) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: p.hexColor, flexShrink: 0, border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: '0.62rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                </div>
              ))}
              {matches.length === 0 && <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>No paints</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
