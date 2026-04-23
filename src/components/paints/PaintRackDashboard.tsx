import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import GoldIcon from '../GoldIcon';
import type { Paint } from '../../types';

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

interface PaintRackDashboardProps {
  paints: Paint[];
}

export default function PaintRackDashboard({ paints }: PaintRackDashboardProps) {
  const links = useLiveQuery(() => db.modelPaintLinks.toArray()) ?? [];

  // Collection stats
  const brands = useMemo(() => [...new Set(paints.map(p => p.brand))], [paints]);
  const types = useMemo(() => {
    const counts: Record<string, number> = {};
    paints.forEach(p => { counts[p.type] = (counts[p.type] || 0) + 1; });
    return counts;
  }, [paints]);

  // Low stock (quantity <= 1)
  const lowStock = useMemo(() => paints.filter(p => p.quantity <= 1 && p.quantity >= 0), [paints]);

  // Most used paints
  const usageCount = useMemo(() => {
    const counts: Record<number, number> = {};
    links.forEach(l => { counts[l.paintId] = (counts[l.paintId] || 0) + 1; });
    return counts;
  }, [links]);

  const mostUsed = useMemo(() => {
    return paints
      .filter(p => usageCount[p.id!] > 0)
      .sort((a, b) => usageCount[b.id!] - usageCount[a.id!])
      .slice(0, 5);
  }, [paints, usageCount]);

  // Colour spectrum — sort all paints by hue
  const spectrumPaints = useMemo(() => {
    return [...paints]
      .filter(p => p.hexColor)
      .sort((a, b) => {
        const [h1, s1, l1] = hexToHsl(a.hexColor);
        const [h2, s2, l2] = hexToHsl(b.hexColor);
        // Neutrals first (low saturation)
        if (s1 < 0.1 && s2 >= 0.1) return -1;
        if (s2 < 0.1 && s1 >= 0.1) return 1;
        // Then dark to light within each hue
        if (Math.abs(h1 - h2) < 0.02) return l1 - l2;
        return h1 - h2;
      });
  }, [paints]);

  // Type distribution for the mini bar chart
  const typeEntries = useMemo(() => Object.entries(types).sort(([,a], [,b]) => b - a), [types]);

  return (
    <div className="paint-dashboard">
      {/* Stats row */}
      <div className="paint-dash-stats">
        <div className="paint-dash-stat">
          <div className="paint-dash-stat-num">{paints.length}</div>
          <div className="paint-dash-stat-label">Total Paints</div>
        </div>
        <div className="paint-dash-stat">
          <div className="paint-dash-stat-num">{brands.length}</div>
          <div className="paint-dash-stat-label">Brands</div>
        </div>
        <div className="paint-dash-stat">
          <div className="paint-dash-stat-num">{typeEntries.length}</div>
          <div className="paint-dash-stat-label">Types</div>
        </div>
        <div className="paint-dash-stat paint-dash-stat-low">
          <div className="paint-dash-stat-num" style={{ color: lowStock.length > 0 ? '#f97316' : 'var(--success)' }}>{lowStock.length}</div>
          <div className="paint-dash-stat-label">Low Stock</div>
        </div>
        <div className="paint-dash-stat">
          <div className="paint-dash-stat-num">{links.length}</div>
          <div className="paint-dash-stat-label">Recipe Links</div>
        </div>
      </div>

      {/* Colour Spectrum */}
      {spectrumPaints.length > 0 && (
        <div className="paint-spectrum">
          <div className="paint-spectrum-label">
            <GoldIcon name="palette2" size={14} />
            Colour Spectrum
          </div>
          <div className="paint-spectrum-bar">
            {spectrumPaints.map(p => (
              <div
                key={p.id}
                className="paint-spectrum-segment"
                style={{ background: p.hexColor, flex: '1 1 0', minWidth: '3px' }}
                title={`${p.name}\n${p.brand}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom row: type breakdown + most used + low stock alerts */}
      <div className="paint-dash-bottom">
        {/* Type distribution */}
        {typeEntries.length > 0 && (
          <div className="paint-dash-section">
            <div className="paint-dash-section-title">Collection by Type</div>
            <div className="paint-type-bars">
              {typeEntries.slice(0, 6).map(([type, count]) => {
                const pct = Math.round((count / paints.length) * 100);
                return (
                  <div key={type} className="paint-type-bar">
                    <div className="paint-type-bar-label">{type}</div>
                    <div className="paint-type-bar-track">
                      <div className="paint-type-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="paint-type-bar-count">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Most Used */}
        {mostUsed.length > 0 && (
          <div className="paint-dash-section">
            <div className="paint-dash-section-title">Most Used</div>
            <div className="paint-most-used">
              {mostUsed.map(p => (
                <div key={p.id} className="paint-used-item">
                  <div className="paint-used-swatch" style={{ background: p.hexColor }} />
                  <div className="paint-used-name">{p.name}</div>
                  <div className="paint-used-count">{usageCount[p.id!]}×</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Stock Alerts */}
        {lowStock.length > 0 && (
          <div className="paint-dash-section">
            <div className="paint-dash-section-title">
              <GoldIcon name="skull" size={14} />
              Low Stock
            </div>
            <div className="paint-low-alerts">
              {lowStock.slice(0, 5).map(p => (
                <div key={p.id} className="paint-low-item">
                  <div className="paint-low-swatch" style={{ background: p.hexColor }} />
                  <div className="paint-low-name">{p.name}</div>
                  <div className="paint-low-qty">{p.quantity === 0 ? 'EMPTY' : `${p.quantity} left`}</div>
                </div>
              ))}
              {lowStock.length > 5 && (
                <div className="paint-low-more">+{lowStock.length - 5} more</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
