import { useMemo } from 'react';
import type { Paint } from '../../types';
import { PAINT_TYPES } from '../../types';
import GoldIcon from '../GoldIcon';

interface VisualFiltersProps {
  brands: string[];
  paints: Paint[];
  selectedBrand: string;
  selectedType: string;
  onBrandChange: (b: string) => void;
  onTypeChange: (t: string) => void;
  activeCount: number;
  onClearAll: () => void;
}

export default function VisualFilters({
  brands,
  paints,
  selectedBrand,
  selectedType,
  onBrandChange,
  onTypeChange,
  activeCount,
  onClearAll,
}: VisualFiltersProps) {
  // Get the first paint hex color per brand for the color dot
  const brandColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of paints) {
      if (p.hexColor && !map[p.brand]) {
        map[p.brand] = p.hexColor;
      }
    }
    return map;
  }, [paints]);

  // Brand counts
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    paints.forEach(p => { counts[p.brand] = (counts[p.brand] || 0) + 1; });
    return counts;
  }, [paints]);

  // Type counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    paints.forEach(p => { counts[p.type] = (counts[p.type] || 0) + 1; });
    return counts;
  }, [paints]);

  // Only show types that actually have paints
  const activeTypes = PAINT_TYPES.filter(t => typeCounts[t] > 0);

  return (
    <div className="visual-filters">
      {/* Brand Pills */}
      <div className="visual-filters-brands">
        <button
          className={`visual-filter-brand-pill ${!selectedBrand ? 'active' : ''}`}
          onClick={() => onBrandChange('')}
        >
          <GoldIcon name="paints" size={14} />
          All
          <span className="visual-filter-pill-count">{paints.length}</span>
        </button>
        {brands.map(b => (
          <button
            key={b}
            className={`visual-filter-brand-pill ${selectedBrand === b ? 'active' : ''}`}
            onClick={() => onBrandChange(selectedBrand === b ? '' : b)}
          >
            <span
              className="visual-filter-brand-dot"
              style={{ background: brandColors[b] || '#888' }}
            />
            {b}
            <span className="visual-filter-pill-count">{brandCounts[b] || 0}</span>
          </button>
        ))}
      </div>

      {/* Type Chips */}
      {activeTypes.length > 0 && (
        <div className="visual-filters-types">
          <span className="visual-filters-types-label">
            <GoldIcon name="target" size={12} />
            Type
          </span>
          {activeTypes.map(t => (
            <button
              key={t}
              className={`visual-filter-type-chip ${selectedType === t ? 'active' : ''}`}
              onClick={() => onTypeChange(selectedType === t ? '' : t)}
            >
              {t}
              <span className="visual-filter-chip-count">{typeCounts[t] || 0}</span>
            </button>
          ))}
        </div>
      )}

      {/* Clear All */}
      {activeCount > 0 && (
        <div className="visual-filters-clear">
          <button className="visual-filter-clear-btn" onClick={onClearAll}>
            ✕ Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
