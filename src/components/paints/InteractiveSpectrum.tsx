import React, { useMemo, useState } from 'react';
import type { Paint } from '../../types';
import GoldIcon from '../GoldIcon';

interface InteractiveSpectrumProps {
  paints: Paint[];
  onSelectColor: (hue: number | null) => void;
  selectedHue: number | null;
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

export default function InteractiveSpectrum({ paints, onSelectColor, selectedHue }: InteractiveSpectrumProps) {
  const [tooltipPaint, setTooltipPaint] = useState<{ paint: Paint; x: number; y: number } | null>(null);

  const sortedPaints = useMemo(() => {
    return [...paints]
      .filter(p => p.hexColor)
      .sort((a, b) => {
        const [h1, s1, l1] = hexToHsl(a.hexColor);
        const [h2, s2, l2] = hexToHsl(b.hexColor);
        // Neutrals first
        if (s1 < 0.1 && s2 >= 0.1) return -1;
        if (s2 < 0.1 && s1 >= 0.1) return 1;
        // Then by hue, then lightness
        if (Math.abs(h1 - h2) > 0.02) return h1 - h2;
        return l1 - l2;
      });
  }, [paints]);

  const handleClick = (paint: Paint) => {
    const [h] = hexToHsl(paint.hexColor);
    // If already selected and clicking same paint, deselect
    if (selectedHue !== null && Math.abs(h - selectedHue) < 0.03) {
      onSelectColor(null);
    } else {
      onSelectColor(h);
    }
  };

  const isSegmentHighlighted = (paint: Paint) => {
    if (selectedHue === null) return false;
    const [h, s] = hexToHsl(paint.hexColor);
    if (s < 0.1) return selectedHue < 0.02; // neutrals
    return Math.abs(h - selectedHue) < 0.05;
  };

  const isDimmed = (paint: Paint) => {
    if (selectedHue === null) return false;
    return !isSegmentHighlighted(paint);
  };

  const handleSegmentHover = (e: React.MouseEvent, paint: Paint) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltipPaint({ paint, x: rect.left + rect.width / 2, y: rect.top - 8 });
  };

  const handleMouseLeave = () => {
    setTooltipPaint(null);
  };

  if (sortedPaints.length === 0) return null;

  return (
    <div className="interactive-spectrum">
      {/* Label */}
      <div className="interactive-spectrum-label">
        <GoldIcon name="palette2" size={12} />
        Colour Spectrum
        <span className="interactive-spectrum-count">{sortedPaints.length} colours</span>
        {selectedHue !== null && (
          <button
            className="interactive-spectrum-clear"
            onClick={() => onSelectColor(null)}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Spectrum Bar */}
      <div className="interactive-spectrum-bar">
        {/* Rainbow gradient background */}
        <div className="interactive-spectrum-rainbow" />

        {sortedPaints.map((p, i) => {
          const highlighted = isSegmentHighlighted(p);
          const dimmed = isDimmed(p);
          return (
            <div
              key={p.id}
              className={`interactive-spectrum-seg ${highlighted ? 'highlighted' : ''} ${dimmed ? 'dimmed' : ''}`}
              style={{
                background: p.hexColor,
                flex: '1 1 0',
                minWidth: '2px',
                animationDelay: `${i * 12}ms`,
                transform: highlighted ? 'scaleY(1.8)' : 'scaleY(1)',
              }}
              title={`${p.name}\n${p.brand} · ${p.type}`}
              onClick={() => handleClick(p)}
              onMouseEnter={(e) => handleSegmentHover(e, p)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltipPaint && !isDimmed(tooltipPaint.paint) && (
        <div
          className="interactive-spectrum-tooltip"
          style={{ left: tooltipPaint.x, top: tooltipPaint.y }}
        >
          <div className="interactive-spectrum-tooltip-swatch" style={{ background: tooltipPaint.paint.hexColor }} />
          <div className="interactive-spectrum-tooltip-name">{tooltipPaint.paint.name}</div>
          <div className="interactive-spectrum-tooltip-brand">{tooltipPaint.paint.brand}</div>
        </div>
      )}
    </div>
  );
}
