import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { PAINT_TYPES } from '../types';
import { BulkAddPaints } from '../components/BulkAdd';
import { Plus, Package, Search, Filter, Grid3X3, List, LayoutGrid, ChevronDown, ChevronRight, Trash2, X, Trophy, BarChart3 } from 'lucide-react';
import PaintAnalytics from '../components/paints/PaintAnalytics';
import PaintHeroDashboard from '../components/paints/PaintHeroDashboard';
import PaintGamification from '../components/paints/PaintGamification';
import EnhancedAddPaint from '../components/paints/EnhancedAddPaint';
import PaintDetailModal from '../components/paints/PaintDetailModal';
import InteractiveSpectrum from '../components/paints/InteractiveSpectrum';
import VisualFilters from '../components/paints/VisualFilters';

type ViewMode = 'list' | 'grid' | 'grouped' | 'analytics' | 'gamification';
type SortMode = 'name' | 'brand' | 'colour';

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

// Colour family: neutrals first, then rainbow order, then metallics
function colourFamily(h: number, s: number, l: number): number {
  if (l < 0.08) return 0;
  if (l > 0.92) return 1;
  if (s < 0.1) return 2;
  const deg = h * 360;
  if (deg < 15) return 10;
  if (deg < 40) return 11;
  if (deg < 70) return 12;
  if (deg < 160) return 13;
  if (deg < 200) return 14;
  if (deg < 260) return 15;
  if (deg < 310) return 16;
  return 10;
}

const FAMILY_NAMES: Record<number, string> = {
  0: 'Blacks', 1: 'Whites', 2: 'Greys',
  10: 'Reds', 11: 'Oranges', 12: 'Yellows',
  13: 'Greens', 14: 'Cyans', 15: 'Blues', 16: 'Purples',
};

const FAMILY_GRADIENTS: Record<number, string> = {
  0: 'linear-gradient(135deg, #1a1a1a, #333)',
  1: 'linear-gradient(135deg, #ddd, #fff)',
  2: 'linear-gradient(135deg, #666, #999)',
  10: 'linear-gradient(135deg, #8a0808, #c62828)',
  11: 'linear-gradient(135deg, #e65100, #f57c00)',
  12: 'linear-gradient(135deg, #f9a825, #fdd835)',
  13: 'linear-gradient(135deg, #1b5e20, #388e3c)',
  14: 'linear-gradient(135deg, #006064, #0097a7)',
  15: 'linear-gradient(135deg, #0d47a1, #1976d2)',
  16: 'linear-gradient(135deg, #4a148c, #7b1fa2)',
};

export default function Paints() {
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortMode>('name');
  const [selectedPaint, setSelectedPaint] = useState<import('../types').Paint | null>(null);
  const [selectedHue, setSelectedHue] = useState<number | null>(null);

  const paints = useLiveQuery(() => db.paints.orderBy('name').toArray()) ?? [];
  const links = useLiveQuery(() => db.modelPaintLinks.toArray()) ?? [];
  const brands = [...new Set(paints.map(p => p.brand))].sort();

  const usageMap = new Map<number, number>();
  links.forEach(l => { usageMap.set(l.paintId, (usageMap.get(l.paintId) || 0) + 1); });

  const filtered = paints.filter(p =>
    (!filterBrand || p.brand === filterBrand) &&
    (!filterType || p.type === filterType) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'colour') {
      const [h1, s1, l1] = hexToHsl(a.hexColor || '#000000');
      const [h2, s2, l2] = hexToHsl(b.hexColor || '#000000');
      const f1 = colourFamily(h1, s1, l1), f2 = colourFamily(h2, s2, l2);
      if (f1 !== f2) return f1 - f2;
      if (Math.abs(h1 - h2) > 0.02) return h1 - h2;
      return l1 - l2;
    }
    if (sortBy === 'brand') return (a.brand + a.name).localeCompare(b.brand + b.name);
    return a.name.localeCompare(b.name);
  });

  const deletePaint = async (id: number) => {
    await db.paints.delete(id);
    await db.modelPaintLinks.where('paintId').equals(id).delete();
  };

  const toggleGroup = (key: string) => {
    const next = new Set(collapsed);
    next.has(key) ? next.delete(key) : next.add(key);
    setCollapsed(next);
  };

  const groups: Record<string, typeof filtered> = {};
  for (const p of filtered) {
    const key = `${p.brand} · ${p.type}`;
    (groups[key] ??= []).push(p);
  }

  // Colour family groups for grouped-by-colour (used in grid colour sort)
  const colourGroups: Record<number, typeof filtered> = {};
  for (const p of filtered) {
    if (!p.hexColor) continue;
    const [h, s, l] = hexToHsl(p.hexColor);
    const family = colourFamily(h, s, l);
    (colourGroups[family] ??= []).push(p);
  }

  const activeFilters = [filterBrand, filterType].filter(Boolean).length;

  // Filter paints by selected hue from spectrum
  const hueFiltered = selectedHue !== null
    ? filtered.filter(p => {
        if (!p.hexColor) return false;
        const [h, s] = hexToHsl(p.hexColor);
        if (s < 0.1) return selectedHue < 0.02;
        return Math.abs(h - selectedHue) < 0.05;
      })
    : filtered;

  const displayPaints = selectedHue !== null ? hueFiltered : filtered;

  let viewContent: React.ReactNode = null;
  if (displayPaints.length === 0 && filtered.length > 0 && selectedHue !== null) {
    // No paints match hue filter but there are filtered paints
    viewContent = (
      <div className="md-empty-tab" style={{ marginTop: 40 }}>
        <p>No paints match the selected colour range.</p>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setSelectedHue(null)}>Show all paints</button>
      </div>
    );
  } else if (displayPaints.length === 0) {
    viewContent = (
      <div className="md-empty-tab" style={{ marginTop: 40 }}>
        <img src={`${import.meta.env.BASE_URL}banners/empty-collection.png`} alt="" style={{ width: 200, height: 'auto', borderRadius: 12, opacity: 0.6, marginBottom: 12 }} />
        <p>{paints.length === 0 ? 'Add your first paint to start your rack.' : 'No paints match your filters.'}</p>
      </div>
    );
  } else if (view === 'analytics') {
    viewContent = <PaintAnalytics paints={paints} />;
  } else if (view === 'gamification') {
    viewContent = <PaintGamification />;
  } else if (view === 'list') {
    viewContent = (
      <div className="pr-list">
        {displayPaints.map((p, i) => {
          const recipeCount = usageMap.get(p.id!) || 0;
          return (
            <div key={p.id} className="pr-list-item" style={{ animationDelay: `${i * 30}ms` }} onClick={() => setSelectedPaint(p)}>
              <div className="pr-list-accent" style={{ background: p.hexColor || '#555' }} />
              <div className="pr-list-swatch" style={{ background: p.hexColor || '#555' }} />
              <div className="pr-list-info">
                <div className="pr-list-name">
                  {p.name}
                  {p.quantity <= 1 && <span className="paint-low-badge">LOW</span>}
                  {p.quantity === 0 && <span className="paint-empty-badge">EMPTY</span>}
                </div>
                <div className="pr-list-meta">{p.brand}{p.range ? ` · ${p.range}` : ''} · {p.type}</div>
                <div className="pr-list-hex">{p.hexColor}</div>
              </div>
              <div className="pr-list-right">
                {recipeCount > 0 && <div className="pr-list-usage">{recipeCount} recipes</div>}
                <div className="pr-list-qty-controls">
                  <button onClick={e => { e.stopPropagation(); if (p.quantity > 0) db.paints.update(p.id!, { quantity: p.quantity - 1 }); }}>-</button>
                  <span>{p.quantity}</span>
                  <button onClick={e => { e.stopPropagation(); db.paints.update(p.id!, { quantity: p.quantity + 1 }); }}>+</button>
                </div>
              </div>
              <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); deletePaint(p.id!); }}><Trash2 size={14} /></button>
            </div>
          );
        })}
      </div>
    );
  } else if (view === 'grouped') {
    viewContent = sortBy === 'colour'
      ? <div className="pr-grouped-view">
          {Object.entries(colourGroups).sort(([a], [b]) => Number(a) - Number(b)).map(([family, items]) => {
            const fNum = Number(family);
            const familyName = FAMILY_NAMES[fNum] || 'Other';
            const gradient = FAMILY_GRADIENTS[fNum] || 'linear-gradient(135deg, #333, #555)';
            const key = `colour-${familyName}`;
            return (
              <div key={key} className="pr-colour-group">
                <div className="pr-colour-group-header" onClick={() => toggleGroup(key)}>
                  {collapsed.has(key) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  <div className="pr-colour-group-swatch" style={{ background: gradient }} />
                  <span className="pr-colour-group-title">{familyName}</span>
                  <span className="ml-group-count">{items.length}</span>
                </div>
                {!collapsed.has(key) && (
                  <div className="pr-chips">
                    {items.map(p => (
                      <div key={p.id} className="pr-chip" onClick={() => setSelectedPaint(p)}>
                        <div className="pr-chip-dot" style={{ background: p.hexColor || '#555' }} />
                        <span className="pr-chip-name">{p.name}</span>
                        <button className="pr-chip-del" onClick={(e) => { e.stopPropagation(); deletePaint(p.id!); }}><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      : <div className="pr-grouped-view">
          {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([key, items]) => (
            <div key={key} className="pr-group">
              <div className="ml-group-header" onClick={() => toggleGroup(key)}>
                {collapsed.has(key) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                <span className="ml-group-title">{key}</span>
                <span className="ml-group-count">{items.length}</span>
              </div>
              {!collapsed.has(key) && (
                <div className="pr-chips">
                  {items.map(p => (
                    <div key={p.id} className="pr-chip" onClick={() => setSelectedPaint(p)}>
                      <div className="pr-chip-dot" style={{ background: p.hexColor || '#555' }} />
                      <span className="pr-chip-name">{p.name}</span>
                      <button className="pr-chip-del" onClick={(e) => { e.stopPropagation(); deletePaint(p.id!); }}><X size={10} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>;
  } else {
    const maxCols = typeof window !== 'undefined' && window.innerWidth < 600 ? 5 : 8;
    const cols = Math.min(maxCols, displayPaints.length) || 1;
    const rows: typeof displayPaints[] = [];
    for (let i = 0; i < displayPaints.length; i += cols) rows.push(displayPaints.slice(i, i + cols));
    viewContent = (
      <div className="pr-rack">
        {rows.map((row, ri) => (
          <div key={ri} className="pr-shelf">
            <div className="pr-shelf-pots">
              {row.map((p, pi) => {
                const recipeCount = usageMap.get(p.id!) || 0;
                return (
                  <div key={p.id} className="pr-pot" style={{ animationDelay: `${(ri * cols + pi) * 40}ms` }} onClick={() => setSelectedPaint(p)}>
                    <div className="pr-pot-cap" style={{ background: p.hexColor || '#555' }}>
                      <div className="pr-pot-shine" />
                    </div>
                    <div className="pr-pot-body">
                      <div className="pr-pot-name">{p.name}</div>
                      <div className="pr-pot-brand">{p.brand}</div>
                      <div className="pr-pot-qty">
                        <button onClick={e => { e.stopPropagation(); if (p.quantity > 0) db.paints.update(p.id!, { quantity: p.quantity - 1 }); }}>-</button>
                        <span>{p.quantity}</span>
                        <button onClick={e => { e.stopPropagation(); db.paints.update(p.id!, { quantity: p.quantity + 1 }); }}>+</button>
                      </div>
                    </div>
                    <div className="pr-pot-hover">
                      <div className="pr-pot-hover-swatch" style={{ background: p.hexColor || '#555' }} />
                      <div className="pr-pot-hover-info">
                        <div className="pr-pot-hover-name">{p.name}</div>
                        <div className="pr-pot-hover-meta">{p.brand}{p.range ? ` · ${p.range}` : ''} · {p.type}</div>
                        <div className="pr-pot-hover-hex">{p.hexColor}</div>
                        {recipeCount > 0 && (
                          <div className="pr-pot-hover-usage">Used in {recipeCount} recipe{recipeCount > 1 ? 's' : ''}</div>
                        )}
                      </div>
                    </div>
                    <button className="pr-pot-del" onClick={(e) => { e.stopPropagation(); deletePaint(p.id!); }}><Trash2 size={10} /></button>
                    {p.quantity <= 1 && <div className="pr-pot-low-badge">LOW</div>}
                  </div>
                );
              })}
            </div>
            <div className="pr-shelf-board" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Hero Dashboard — always visible */}
      <PaintHeroDashboard />

      {/* Interactive Colour Spectrum */}
      <InteractiveSpectrum paints={paints} onSelectColor={setSelectedHue} selectedHue={selectedHue} />

      <div className="paint-page-controls">
        <div className="paint-page-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => { setShowBulk(!showBulk); setShowForm(false); }}>
            <Package size={16} /> Bulk
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); setShowBulk(false); }}>
            {showForm ? <X size={16} /> : <><Plus size={16} /> Add</>}
          </button>
        </div>
      </div>

      {showBulk && <BulkAddPaints onDone={() => setShowBulk(false)} />}
      {showForm && <EnhancedAddPaint onDone={() => { setShowForm(false); }} />}

      {/* Visual Filter Chips — replaces brand pills */}
      <VisualFilters
        brands={brands}
        paints={paints}
        selectedBrand={filterBrand}
        selectedType={filterType}
        onBrandChange={setFilterBrand}
        onTypeChange={setFilterType}
        activeCount={activeFilters}
        onClearAll={() => { setFilterBrand(''); setFilterType(''); }}
      />

      {/* Search + filters + view toggle */}
      <div className="ml-search-row">
        <div className="ml-search-wrap">
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search paints..." />
        </div>
        <button className={`btn btn-sm btn-ghost ${activeFilters ? 'ml-filter-active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={14} />
        </button>
        <div className="ml-view-toggle">
          <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Grid3X3 size={14} /></button>
          <button className={view === 'grouped' ? 'active' : ''} onClick={() => setView('grouped')}><LayoutGrid size={14} /></button>
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={14} /></button>
          <button className={view === 'analytics' ? 'active' : ''} onClick={() => setView('analytics')} title="Analytics">
            <BarChart3 size={14} />
          </button>
          <button className={view === 'gamification' ? 'active' : ''} onClick={() => setView('gamification')} title="Milestones">
            <Trophy size={14} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="ml-filters">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All types</option>
            {PAINT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {activeFilters > 0 && <button className="btn btn-sm btn-ghost" onClick={() => { setFilterBrand(''); setFilterType(''); }}>Clear</button>}
        </div>
      )}

      <div className="ml-results">
        <span>{displayPaints.length}{displayPaints.length !== filtered.length ? ` of ${filtered.length}` : ''} paints</span>
        <select className="pr-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as SortMode)}>
          <option value="name">Sort: Name</option>
          <option value="brand">Sort: Brand</option>
          <option value="colour">Sort: Colour</option>
        </select>
      </div>

      {viewContent}

      {/* Paint Detail Modal */}
      {selectedPaint && (
        <PaintDetailModal
          paint={selectedPaint}
          onClose={() => setSelectedPaint(null)}
          usageCount={usageMap.get(selectedPaint.id!) || 0}
        />
      )}
    </div>
  );
}
