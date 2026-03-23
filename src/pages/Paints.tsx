import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { PAINT_TYPES } from '../types';
import PaintAutocomplete from '../components/PaintAutocomplete';
import type { PaintPreset } from '../db/paint-presets';
import { BulkAddPaints } from '../components/BulkAdd';
import { Plus, Package, Search, Filter, Grid3X3, List, LayoutGrid, ChevronDown, ChevronRight, Trash2, Droplets, X } from 'lucide-react';

type ViewMode = 'list' | 'grid' | 'grouped';
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

  const paints = useLiveQuery(() => db.paints.orderBy('name').toArray()) ?? [];
  const brands = [...new Set(paints.map(p => p.brand))].sort();

  const filtered = paints.filter(p =>
    (!filterBrand || p.brand === filterBrand) &&
    (!filterType || p.type === filterType) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'colour') {
      const [h1, s1, l1] = hexToHsl(a.hexColor || '#000000');
      const [h2, s2, l2] = hexToHsl(b.hexColor || '#000000');
      return h1 - h2 || s1 - s2 || l1 - l2;
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

  const activeFilters = [filterBrand, filterType].filter(Boolean).length;

  return (
    <div>
      <div className="page-header">
        <h2>Paint Rack</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setShowBulk(!showBulk); setShowForm(false); }}>
            <Package size={16} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); setShowBulk(false); }}>
            {showForm ? <X size={16} /> : <><Plus size={16} /> Add</>}
          </button>
        </div>
      </div>

      {showBulk && <BulkAddPaints onDone={() => setShowBulk(false)} />}
      {showForm && <AddPaintForm onDone={() => setShowForm(false)} />}

      {/* Brand pills */}
      <div className="pr-brand-pills">
        <button className={`pr-brand-pill ${!filterBrand ? 'active' : ''}`} onClick={() => setFilterBrand('')}>
          All <span>{paints.length}</span>
        </button>
        {brands.map(b => (
          <button key={b} className={`pr-brand-pill ${filterBrand === b ? 'active' : ''}`} onClick={() => setFilterBrand(filterBrand === b ? '' : b)}>
            {b} <span>{paints.filter(p => p.brand === b).length}</span>
          </button>
        ))}
      </div>

      {/* Search + filters */}
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
        <span>{filtered.length} paints</span>
        <select className="pr-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as SortMode)}>
          <option value="name">Sort: Name</option>
          <option value="brand">Sort: Brand</option>
          <option value="colour">Sort: Colour 🎨</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="md-empty-tab" style={{ marginTop: 40 }}>
          <Droplets size={48} strokeWidth={1} style={{ opacity: 0.15, marginBottom: 12 }} />
          <p>{paints.length === 0 ? 'Add your first paint to start your rack.' : 'No paints match your filters.'}</p>
        </div>
      ) : view === 'grid' ? (
        /* Paint rack — shelves with pots */
        <div className="pr-rack">
          {(() => {
            const cols = typeof window !== 'undefined' && window.innerWidth < 600 ? 5 : 8;
            const rows: typeof filtered[] = [];
            for (let i = 0; i < filtered.length; i += cols) rows.push(filtered.slice(i, i + cols));
            return rows.map((row, ri) => (
              <div key={ri} className="pr-shelf">
                <div className="pr-shelf-pots">
                  {row.map(p => (
                    <div key={p.id} className="pr-pot" title={`${p.name}\n${p.brand} · ${p.range} · ${p.type}`}>
                      <div className="pr-pot-cap" style={{ background: p.hexColor || '#555' }}>
                        <div className="pr-pot-shine" />
                      </div>
                      <div className="pr-pot-body">
                        <div className="pr-pot-name">{p.name}</div>
                        <div className="pr-pot-brand">{p.brand}</div>
                      </div>
                      <button className="pr-pot-del" onClick={(e) => { e.stopPropagation(); deletePaint(p.id!); }}><Trash2 size={10} /></button>
                    </div>
                  ))}
                </div>
                <div className="pr-shelf-board" />
              </div>
            ));
          })()}
        </div>
      ) : view === 'grouped' ? (
        Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([key, items]) => (
          <div key={key} className="pr-group">
            <div className="ml-group-header" onClick={() => toggleGroup(key)}>
              {collapsed.has(key) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              <span className="ml-group-title">{key}</span>
              <span className="ml-group-count">{items.length}</span>
            </div>
            {!collapsed.has(key) && (
              <div className="pr-chips">
                {items.map(p => (
                  <div key={p.id} className="pr-chip">
                    <div className="pr-chip-dot" style={{ background: p.hexColor || '#555' }} />
                    <span className="pr-chip-name">{p.name}</span>
                    <button className="pr-chip-del" onClick={() => deletePaint(p.id!)}><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="pr-list">
          {filtered.map(p => (
            <div key={p.id} className="pr-list-item">
              <div className="pr-list-swatch" style={{ background: p.hexColor || '#555' }} />
              <div className="pr-list-info">
                <div className="pr-list-name">{p.name}</div>
                <div className="pr-list-meta">{p.brand}{p.range ? ` · ${p.range}` : ''} · {p.type}</div>
              </div>
              <button className="btn-icon-sm" onClick={() => deletePaint(p.id!)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddPaintForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Citadel');
  const [range, setRange] = useState('');
  const [type, setType] = useState('Base');
  const [hex, setHex] = useState('#888888');

  const handlePreset = (preset: PaintPreset) => {
    setName(preset.name); setBrand(preset.brand);
    if (preset.range) setRange(preset.range);
    if (preset.type) setType(preset.type);
    if (preset.hex) setHex(preset.hex);
  };

  const submit = async () => {
    if (!name.trim()) return;
    await db.paints.add({ name: name.trim(), brand, range: range.trim(), type: type as any, hexColor: hex, quantity: 1, owned: true, notes: '' });
    onDone();
  };

  return (
    <div className="detail-section" style={{ marginBottom: 20 }}>
      <h3 style={{ marginBottom: 12 }}>Add Paint</h3>
      <div className="field"><label>Name</label><PaintAutocomplete value={name} onChange={setName} onSelect={handlePreset} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field"><label>Brand</label>
          <select value={brand} onChange={e => setBrand(e.target.value)}>
            {['Citadel', 'Vallejo', 'Army Painter', 'AK Interactive', 'Scale75', 'ProAcryl', 'Turbo Dork', 'Monument', 'Kimera'].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="field"><label>Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {PAINT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="field"><label>Range</label><input value={range} onChange={e => setRange(e.target.value)} placeholder="e.g. Contrast, Model Color" /></div>
      <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label>Colour</label>
        <input type="color" value={hex} onChange={e => setHex(e.target.value)} style={{ width: 48, height: 36, border: 'none', cursor: 'pointer' }} />
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{hex}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn btn-primary" onClick={submit}>Add Paint</button>
        <button className="btn btn-ghost" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}
