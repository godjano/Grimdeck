import { useMemo } from 'react';
import type { Paint } from '../../types';

interface PaintAnalyticsProps {
  paints: Paint[];
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

export default function PaintAnalytics({ paints }: PaintAnalyticsProps) {
  // Colour coverage heatmap — divide hue wheel into 12 segments
  const hueSegments = useMemo(() => {
    const segments: { label: string; hue: number; paints: Paint[] }[] = [
      { label: 'Red', hue: 0, paints: [] },
      { label: 'Orange', hue: 30, paints: [] },
      { label: 'Yellow', hue: 55, paints: [] },
      { label: 'Green', hue: 120, paints: [] },
      { label: 'Teal', hue: 170, paints: [] },
      { label: 'Blue', hue: 220, paints: [] },
      { label: 'Purple', hue: 270, paints: [] },
      { label: 'Pink', hue: 330, paints: [] },
    ];
    const neutrals: Paint[] = [];

    paints.forEach(p => {
      if (!p.hexColor) return;
      const [h, s, l] = hexToHsl(p.hexColor);
      if (s < 0.12 || l < 0.1 || l > 0.9) {
        neutrals.push(p);
        return;
      }
      const deg = h * 360;
      let bestIdx = 0;
      let bestDist = 999;
      segments.forEach((seg, i) => {
        const dist = Math.abs(deg - seg.hue);
        const wrappedDist = Math.min(dist, 360 - dist);
        if (wrappedDist < bestDist) { bestDist = wrappedDist; bestIdx = i; }
      });
      segments[bestIdx].paints.push(p);
    });

    return { segments, neutrals };
  }, [paints]);

  const maxInSegment = Math.max(...hueSegments.segments.map(s => s.paints.length), 1);
  const totalWithColour = paints.filter(p => p.hexColor).length;

  // Brand distribution
  const brandDist = useMemo(() => {
    const counts: Record<string, number> = {};
    paints.forEach(p => { counts[p.brand] = (counts[p.brand] || 0) + 1; });
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [paints]);

  // Saturation analysis
  const satAnalysis = useMemo(() => {
    let saturated = 0, muted = 0, neutral = 0;
    paints.forEach(p => {
      if (!p.hexColor) return;
      const [, s] = hexToHsl(p.hexColor);
      if (s < 0.12) neutral++;
      else if (s < 0.4) muted++;
      else saturated++;
    });
    return { saturated, muted, neutral };
  }, [paints]);

  return (
    <div className="paint-analytics">
      <div className="paint-analytics-title">
        <h3>Collection Analytics</h3>
      </div>

      {/* Colour Coverage Heatmap */}
      <div className="paint-analytics-section">
        <div className="paint-analytics-label">Colour Coverage</div>
        <div className="paint-heatmap">
          {hueSegments.segments.map(seg => {
            const pct = Math.round((seg.paints.length / Math.max(maxInSegment, 1)) * 100);
            const deg = seg.hue;
            const hueColor = `hsl(${deg}, 60%, 50%)`;
            return (
              <div key={seg.label} className="paint-heatmap-cell">
                <div className="paint-heatmap-bar-container">
                  <div
                    className="paint-heatmap-bar"
                    style={{
                      width: `${Math.max(pct, 8)}%`,
                      background: seg.paints.length > 0
                        ? `linear-gradient(180deg, ${hueColor}, ${hueColor}88)`
                        : 'var(--surface3)',
                      opacity: seg.paints.length > 0 ? 1 : 0.3,
                    }}
                  />
                </div>
                <div className="paint-heatmap-label" style={{ color: seg.paints.length > 0 ? hueColor : 'var(--text-dim)' }}>
                  {seg.label}
                </div>
                <div className="paint-heatmap-count">{seg.paints.length}</div>
              </div>
            );
          })}
          {/* Neutrals */}
          <div className="paint-heatmap-cell">
            <div className="paint-heatmap-bar-container">
              <div
                className="paint-heatmap-bar"
                style={{
                  width: `${Math.max(Math.round((hueSegments.neutrals.length / Math.max(maxInSegment, 1)) * 100), 8)}%`,
                  background: hueSegments.neutrals.length > 0
                    ? 'linear-gradient(180deg, #888, #88888888)'
                    : 'var(--surface3)',
                  opacity: hueSegments.neutrals.length > 0 ? 1 : 0.3,
                }}
              />
            </div>
            <div className="paint-heatmap-label" style={{ color: hueSegments.neutrals.length > 0 ? '#aaa' : 'var(--text-dim)' }}>
              Neutral
            </div>
            <div className="paint-heatmap-count">{hueSegments.neutrals.length}</div>
          </div>
        </div>
        <div className="paint-analytics-note">
          {totalWithColour} paints with colour data across {hueSegments.segments.filter(s => s.paints.length > 0).length} hue families + {hueSegments.neutrals.length} neutrals
        </div>
      </div>

      {/* Saturation & Brand side by side */}
      <div className="paint-analytics-row">
        {/* Saturation Mix */}
        <div className="paint-analytics-section paint-analytics-half">
          <div className="paint-analytics-label">Saturation Mix</div>
          <div className="paint-sat-bar">
            {satAnalysis.saturated > 0 && (
              <div className="paint-sat-segment paint-sat-vivid" style={{ flex: satAnalysis.saturated }} title={`Vivid: ${satAnalysis.saturated}`} />
            )}
            {satAnalysis.muted > 0 && (
              <div className="paint-sat-segment paint-sat-muted" style={{ flex: satAnalysis.muted }} title={`Muted: ${satAnalysis.muted}`} />
            )}
            {satAnalysis.neutral > 0 && (
              <div className="paint-sat-segment paint-sat-neutral" style={{ flex: satAnalysis.neutral }} title={`Neutral: ${satAnalysis.neutral}`} />
            )}
          </div>
          <div className="paint-sat-legend">
            <span><span className="paint-sat-dot paint-sat-vivid" /> Vivid ({satAnalysis.saturated})</span>
            <span><span className="paint-sat-dot paint-sat-muted" /> Muted ({satAnalysis.muted})</span>
            <span><span className="paint-sat-dot paint-sat-neutral" /> Neutral ({satAnalysis.neutral})</span>
          </div>
        </div>

        {/* Brand Distribution */}
        {brandDist.length > 0 && (
          <div className="paint-analytics-section paint-analytics-half">
            <div className="paint-analytics-label">Brand Distribution</div>
            <div className="paint-brand-bars">
              {brandDist.slice(0, 5).map(([brand, count]) => {
                const pct = Math.round((count / paints.length) * 100);
                return (
                  <div key={brand} className="paint-brand-bar">
                    <div className="paint-brand-bar-label">{brand}</div>
                    <div className="paint-brand-bar-track">
                      <div className="paint-brand-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="paint-brand-bar-pct">{pct}%</div>
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
