import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import GoldIcon from '../GoldIcon';

interface Milestone {
  id: string;
  name: string;
  desc: string;
  icon: string;
  target: number;
  check: (val: number) => boolean;
}

function hexToHsl(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

export default function PaintGamification() {
  const paints = useLiveQuery(() => db.paints.toArray()) ?? [];

  const paintCount = paints.length;
  const brandCount = useMemo(() => new Set(paints.map(p => p.brand)).size, [paints]);

  // Hue coverage
  const hueFamilies = useMemo(() => {
    const centers = [0, 30, 55, 120, 170, 220, 270, 330];
    const filled = new Set<number>();
    let hasNeutral = false;
    paints.forEach(p => {
      if (!p.hexColor) return;
      const [h, s, l] = hexToHsl(p.hexColor);
      if (s < 0.12 || l < 0.1 || l > 0.9) { hasNeutral = true; return; }
      const deg = h * 360;
      let bestIdx = 0, bestDist = 999;
      centers.forEach((c, i) => {
        const dist = Math.min(Math.abs(deg - c), 360 - Math.abs(deg - c));
        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
      });
      filled.add(bestIdx);
    });
    return { families: filled.size + (hasNeutral ? 1 : 0), max: centers.length + 1 };
  }, [paints]);

  // Well-stocked (no low stock)
  const wellStocked = useMemo(() => paints.filter(p => p.quantity > 1).length, [paints]);
  const stockHealth = paintCount > 0 ? Math.round((wellStocked / paintCount) * 100) : 0;

  // Milestones
  const milestones: Milestone[] = [
    { id: 'first10', name: 'Foundation Coat', desc: 'Add your first 10 paints', icon: 'paints', target: 10, check: (n) => n >= 10 },
    { id: 'palette50', name: 'Palette Expansion', desc: 'Build a 50-paint collection', icon: 'palette2', target: 50, check: (n) => n >= 50 },
    { id: 'master100', name: 'Master Painter', desc: 'Reach 100 paints in your rack', icon: 'star-shield2', target: 100, check: (n) => n >= 100 },
    { id: 'hoarder200', name: 'Paint Hoarder', desc: 'Amass 200 paints', icon: 'hammer', target: 200, check: (n) => n >= 200 },
    { id: 'brand3', name: 'Brand Explorer', desc: 'Collect paints from 3 brands', icon: 'star-shield2', target: 3, check: () => brandCount >= 3 },
    { id: 'brand5', name: 'Brand Connoisseur', desc: 'Collect from 5 different brands', icon: 'star-shield2', target: 5, check: () => brandCount >= 5 },
    { id: 'colour_full', name: 'Full Spectrum', desc: 'Own paints across all 9 colour families', icon: 'palette2', target: 9, check: () => hueFamilies.families >= 9 },
    { id: 'wellstocked', name: 'Well Stocked', desc: 'Keep 90%+ of paints above 1 quantity', icon: 'paints', target: 90, check: () => stockHealth >= 90 },
  ];

  const unlockedCount = milestones.filter(m => m.check(paintCount)).length;

  // Brand completion (how many types per brand)
  const brandStats = useMemo(() => {
    const stats: Record<string, { total: number; types: Set<string> }> = {};
    paints.forEach(p => {
      if (!stats[p.brand]) stats[p.brand] = { total: 0, types: new Set() };
      stats[p.brand].total++;
      stats[p.brand].types.add(p.type);
    });
    return Object.entries(stats)
      .map(([brand, s]) => ({ brand, count: s.total, typeCount: s.types.size }))
      .sort((a, b) => b.count - a.count);
  }, [paints]);

  return (
    <div className="paint-gamification">
      {/* Collection Health Ring */}
      <div className="paint-gam-health">
        <div className="paint-gam-health-ring">
          <svg viewBox="0 0 100 100" className="paint-gam-ring-svg">
            <circle cx="50" cy="50" r="42" className="paint-gam-ring-bg" />
            <circle
              cx="50" cy="50" r="42"
              className="paint-gam-ring-fill"
              style={{
                strokeDasharray: `${2 * Math.PI * 42}`,
                strokeDashoffset: `${2 * Math.PI * 42 * (1 - stockHealth / 100)}`,
              }}
            />
          </svg>
          <div className="paint-gam-ring-label">
            <div className="paint-gam-ring-pct">{stockHealth}%</div>
            <div className="paint-gam-ring-text">Stocked</div>
          </div>
        </div>
        <div className="paint-gam-health-stats">
          <div className="paint-gam-health-item">
            <GoldIcon name="paints" size={14} />
            <span>{paintCount} paints</span>
          </div>
          <div className="paint-gam-health-item">
            <GoldIcon name="star-shield2" size={14} />
            <span>{brandCount} brands</span>
          </div>
          <div className="paint-gam-health-item">
            <GoldIcon name="palette2" size={14} />
            <span>{hueFamilies.families}/{hueFamilies.max} colour families</span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="paint-gam-milestones">
        <div className="paint-gam-milestones-title">
          <GoldIcon name="hammer" size={14} />
          Collection Milestones
          <span className="paint-gam-milestone-count">{unlockedCount}/{milestones.length}</span>
        </div>
        <div className="paint-gam-milestone-grid">
          {milestones.map(m => {
            const done = m.check(paintCount);
            const progress = m.id.startsWith('brand') || m.id === 'colour_full' || m.id === 'wellstocked'
              ? (done ? 100 : 0)
              : Math.min(100, Math.round((paintCount / m.target) * 100));
            return (
              <div key={m.id} className={`paint-gam-milestone ${done ? 'unlocked' : 'locked'}`}>
                <div className="paint-gam-milestone-icon">
                  <GoldIcon name={m.icon} size={20} />
                </div>
                <div className="paint-gam-milestone-info">
                  <div className="paint-gam-milestone-name">{m.name}</div>
                  <div className="paint-gam-milestone-desc">{m.desc}</div>
                  {!done && progress > 0 && (
                    <div className="paint-gam-milestone-bar">
                      <div className="paint-gam-milestone-fill" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </div>
                {done && <div className="paint-gam-milestone-check">✓</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand Breakdown */}
      {brandStats.length > 0 && (
        <div className="paint-gam-brands">
          <div className="paint-gam-brands-title">
            <GoldIcon name="star-shield2" size={14} />
            Brand Breakdown
          </div>
          <div className="paint-gam-brand-list">
            {brandStats.map(b => (
              <div key={b.brand} className="paint-gam-brand-item">
                <div className="paint-gam-brand-name">{b.brand}</div>
                <div className="paint-gam-brand-track">
                  <div
                    className="paint-gam-brand-fill"
                    style={{ width: `${Math.round((b.count / paintCount) * 100)}%` }}
                  />
                </div>
                <div className="paint-gam-brand-meta">
                  {b.count} paints · {b.typeCount} types
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
