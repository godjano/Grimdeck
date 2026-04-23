import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import GoldIcon from '../GoldIcon';

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

export default function PaintHeroDashboard() {
  const paints = useLiveQuery(() => db.paints.toArray()) ?? [];
  const links = useLiveQuery(() => db.modelPaintLinks.toArray()) ?? [];

  const brands = useMemo(() => [...new Set(paints.map(p => p.brand))], [paints]);
  const types = useMemo(() => {
    const counts: Record<string, number> = {};
    paints.forEach(p => { counts[p.type] = (counts[p.type] || 0) + 1; });
    return counts;
  }, [paints]);
  const lowStock = useMemo(() => paints.filter(p => p.quantity <= 1 && p.quantity >= 0), [paints]);

  // Usage counts
  const usageCount = useMemo(() => {
    const counts: Record<number, number> = {};
    links.forEach(l => { counts[l.paintId] = (counts[l.paintId] || 0) + 1; });
    return counts;
  }, [links]);

  const mostUsed = useMemo(() => {
    return paints
      .filter(p => (usageCount[p.id!] || 0) > 0)
      .sort((a, b) => usageCount[b.id!] - usageCount[a.id!])
      .slice(0, 5);
  }, [paints, usageCount]);

  // Colour spectrum — sort by hue
  const spectrumPaints = useMemo(() => {
    return [...paints]
      .filter(p => p.hexColor)
      .sort((a, b) => {
        const [h1, s1, l1] = hexToHsl(a.hexColor);
        const [h2, s2, l2] = hexToHsl(b.hexColor);
        if (s1 < 0.1 && s2 >= 0.1) return -1;
        if (s2 < 0.1 && s1 >= 0.1) return 1;
        if (Math.abs(h1 - h2) < 0.02) return l1 - l2;
        return h1 - h2;
      });
  }, [paints]);

  // Hue coverage — how many of 8 hue families + neutrals do we have?
  const hueCoverage = useMemo(() => {
    const segments = [0, 1, 2, 3, 4, 5, 6, 7]; // red, orange, yellow, green, teal, blue, purple, pink
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

    return { filled: filled.size, total: segments.length, hasNeutral, pct: Math.round(((filled.size + (hasNeutral ? 1 : 0)) / (segments.length + 1)) * 100) };
  }, [paints]);

  const typeEntries = useMemo(() => Object.entries(types).sort(([, a], [, b]) => b - a), [types]);

  return (
    <div className="paint-hero-dashboard">
      {/* Hero Banner */}
      <div className="paint-hero-banner">
        <div className="paint-hero-bg" />
        <div className="paint-hero-content">
          <div className="paint-hero-eyebrow">
            <GoldIcon name="paints" size={14} />
            Your Collection
          </div>
          <h2 className="paint-hero-title">Paint Rack</h2>
          <p className="paint-hero-sub">Catalog, track, and optimize your miniature paint collection across all brands</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="paint-hero-stats">
        <div className="paint-hero-stat">
          <div className="paint-hero-stat-icon">
            <GoldIcon name="paints" size={18} />
          </div>
          <div className="paint-hero-stat-info">
            <div className="paint-hero-stat-num">{paints.length}</div>
            <div className="paint-hero-stat-label">Total Paints</div>
          </div>
        </div>
        <div className="paint-hero-stat-divider" />
        <div className="paint-hero-stat">
          <div className="paint-hero-stat-icon">
            <GoldIcon name="star-shield2" size={18} />
          </div>
          <div className="paint-hero-stat-info">
            <div className="paint-hero-stat-num">{brands.length}</div>
            <div className="paint-hero-stat-label">Brands</div>
          </div>
        </div>
        <div className="paint-hero-stat-divider" />
        <div className="paint-hero-stat">
          <div className="paint-hero-stat-icon">
            <GoldIcon name="palette2" size={18} />
          </div>
          <div className="paint-hero-stat-info">
            <div className="paint-hero-stat-num">{hueCoverage.pct}%</div>
            <div className="paint-hero-stat-label">Colour Coverage</div>
          </div>
        </div>
        <div className="paint-hero-stat-divider" />
        <div className={`paint-hero-stat ${lowStock.length > 0 ? 'paint-hero-stat-warn' : ''}`}>
          <div className="paint-hero-stat-icon">
            <GoldIcon name="skull" size={18} />
          </div>
          <div className="paint-hero-stat-info">
            <div className={`paint-hero-stat-num ${lowStock.length > 0 ? 'paint-hero-num-warn' : ''}`}>{lowStock.length}</div>
            <div className="paint-hero-stat-label">Low Stock</div>
          </div>
        </div>
      </div>

      {/* Colour Spectrum */}
      {spectrumPaints.length > 0 && (
        <div className="paint-hero-spectrum">
          <div className="paint-hero-spectrum-label">
            <GoldIcon name="palette2" size={12} />
            Colour Spectrum
            <span className="paint-hero-spectrum-count">{spectrumPaints.length} colours</span>
          </div>
          <div className="paint-hero-spectrum-bar">
            {spectrumPaints.map((p, i) => (
              <div
                key={p.id}
                className="paint-hero-spectrum-seg"
                style={{
                  background: p.hexColor,
                  flex: '1 1 0',
                  minWidth: '2px',
                  animationDelay: `${i * 15}ms`,
                }}
                title={`${p.name}\n${p.brand} · ${p.type}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="paint-hero-alerts">
          <div className="paint-hero-alerts-header">
            <GoldIcon name="skull" size={14} />
            Low Stock Alerts
            <span className="paint-hero-alerts-pulse" />
          </div>
          <div className="paint-hero-alerts-list">
            {lowStock.slice(0, 6).map(p => (
              <div key={p.id} className="paint-hero-alert-item">
                <div className="paint-hero-alert-swatch" style={{ background: p.hexColor || '#555' }} />
                <div className="paint-hero-alert-name">{p.name}</div>
                <div className={`paint-hero-alert-qty ${p.quantity === 0 ? 'empty' : 'low'}`}>
                  {p.quantity === 0 ? 'EMPTY' : `${p.quantity} left`}
                </div>
                <button
                  className="paint-hero-alert-restock"
                  onClick={async () => { await db.paints.update(p.id!, { quantity: p.quantity + 1 }); }}
                >
                  +1
                </button>
              </div>
            ))}
            {lowStock.length > 6 && (
              <div className="paint-hero-alert-more">+{lowStock.length - 6} more need restocking</div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats Row: Most Used + Type Distribution */}
      <div className="paint-hero-bottom">
        {mostUsed.length > 0 && (
          <div className="paint-hero-section">
            <div className="paint-hero-section-title">Most Used in Recipes</div>
            <div className="paint-hero-used">
              {mostUsed.map(p => (
                <div key={p.id} className="paint-hero-used-item">
                  <div className="paint-hero-used-swatch" style={{ background: p.hexColor }} />
                  <span className="paint-hero-used-name">{p.name}</span>
                  <span className="paint-hero-used-count">{usageCount[p.id!]}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {typeEntries.length > 0 && (
          <div className="paint-hero-section">
            <div className="paint-hero-section-title">By Type</div>
            <div className="paint-hero-types">
              {typeEntries.slice(0, 5).map(([type, count]) => {
                const pct = Math.round((count / paints.length) * 100);
                return (
                  <div key={type} className="paint-hero-type">
                    <div className="paint-hero-type-label">{type}</div>
                    <div className="paint-hero-type-track">
                      <div className="paint-hero-type-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="paint-hero-type-count">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
