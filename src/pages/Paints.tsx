import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { PaintType } from '../types';
import { PAINT_TYPES, PAINT_BRANDS } from '../types';
import PaintAutocomplete from '../components/PaintAutocomplete';
import type { PaintPreset } from '../db/paint-presets';
import { BulkAddPaints } from '../components/BulkAdd';

type ViewMode = 'list' | 'grid' | 'grouped';

export default function Paints() {
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('grouped');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const paints = useLiveQuery(() => db.paints.orderBy('name').toArray()) ?? [];
  const brands = [...new Set(paints.map(p => p.brand))].sort();

  const filtered = paints.filter(p =>
    (!filterBrand || p.brand === filterBrand) &&
    (!filterType || p.type === filterType) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const deletePaint = async (id: number) => {
    await db.paints.delete(id);
    await db.modelPaintLinks.where('paintId').equals(id).delete();
  };

  const toggleGroup = (key: string) => {
    const next = new Set(collapsed);
    next.has(key) ? next.delete(key) : next.add(key);
    setCollapsed(next);
  };

  // Group by brand then type
  const groups: Record<string, typeof filtered> = {};
  for (const p of filtered) {
    const key = `${p.brand} · ${p.type}`;
    (groups[key] ??= []).push(p);
  }

  return (
    <div>
      <div className="page-header">
        <h2>My Paints</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => { setShowBulk(!showBulk); setShowForm(false); }}>📦 Bulk</button>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setShowBulk(false); }}>
            {showForm ? '✕' : '+ Add'}
          </button>
        </div>
      </div>

      {showBulk && <BulkAddPaints onDone={() => setShowBulk(false)} />}
      {showForm && <AddPaintForm onDone={() => setShowForm(false)} />}

      <div className="stats">
        <div className="stat"><div className="stat-num">{paints.length}</div><div className="stat-label">Total</div></div>
        {brands.map(b => (
          <div className="stat" key={b}><div className="stat-num">{paints.filter(p => p.brand === b).length}</div><div className="stat-label">{b}</div></div>
        ))}
      </div>

      <div className="filters">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search..." className="filter-search" />
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
          <option value="">All brands</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All types</option>
          {PAINT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="view-toggle">
          <button className={`view-btn ${view === 'grouped' ? 'active' : ''}`} onClick={() => setView('grouped')} title="Grouped">▤</button>
          <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} title="Grid">▦</button>
          <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} title="List">☰</button>
        </div>
      </div>

      <div className="results-count">{filtered.length} paints</div>

      {filtered.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">🎨</span>
          <p className="empty-text">No paints found. {paints.length === 0 ? 'Add your first!' : 'Try a different filter.'}</p>
        </div>
      ) : view === 'grid' ? (
        <div className="paint-grid">
          {filtered.map(p => (
            <div key={p.id} className="paint-tile" title={`${p.name}\n${p.brand} · ${p.range} · ${p.type}`}>
              <div className="paint-tile-swatch" style={{ background: p.hexColor || '#555' }} />
              <div className="paint-tile-name">{p.name}</div>
              <div className="paint-tile-meta">{p.brand}</div>
              <button className="paint-tile-del" onClick={(e) => { e.stopPropagation(); deletePaint(p.id!); }}>✕</button>
            </div>
          ))}
        </div>
      ) : view === 'grouped' ? (
        Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([key, items]) => (
          <div key={key} className="paint-group">
            <div className="paint-group-header" onClick={() => toggleGroup(key)}>
              <span className="paint-group-toggle">{collapsed.has(key) ? '▸' : '▾'}</span>
              <span className="paint-group-title">{key}</span>
              <span className="paint-group-count">{items.length}</span>
            </div>
            {!collapsed.has(key) && (
              <div className="paint-group-items">
                {items.map(p => (
                  <div key={p.id} className="paint-chip">
                    <div className="paint-chip-swatch" style={{ background: p.hexColor || '#555' }} />
                    <span className="paint-chip-name">{p.name}</span>
                    <button className="paint-chip-del" onClick={() => deletePaint(p.id!)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        filtered.map(p => (
          <div className="card" key={p.id}>
            <div className="swatch" style={{ background: p.hexColor || '#555' }} />
            <div className="card-body">
              <div className="card-title">{p.name}</div>
              <div className="card-sub">{p.brand}{p.range ? ` · ${p.range}` : ''} · {p.type}</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => deletePaint(p.id!)}>🗑</button>
          </div>
        ))
      )}
    </div>
  );
}

function AddPaintForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Citadel');
  const [range, setRange] = useState('');
  const [type, setType] = useState<PaintType>('base');
  const [hexColor, setHexColor] = useState('#888888');

  const handlePresetSelect = (preset: PaintPreset) => {
    setName(preset.name); setBrand(preset.brand); setRange(preset.range); setType(preset.type); setHexColor(preset.hex);
  };

  const save = async () => {
    if (!name.trim()) return;
    await db.paints.add({ name: name.trim(), brand, range: range.trim(), type, hexColor, owned: true, quantity: 1, notes: '' });
    onDone();
  };

  return (
    <div className="form-overlay">
      <div className="form-title">Add New Paint</div>
      <div className="form-grid">
        <div className="field full-width">
          <label>Paint Name * (type to search)</label>
          <PaintAutocomplete value={name} onChange={setName} onSelect={handlePresetSelect} />
        </div>
        <div className="field">
          <label>Brand</label>
          <select value={brand} onChange={e => setBrand(e.target.value)}>
            {PAINT_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="field"><label>Range</label><input value={range} onChange={e => setRange(e.target.value)} placeholder="e.g. Game Color" /></div>
        <div className="field">
          <label>Type</label>
          <select value={type} onChange={e => setType(e.target.value as PaintType)}>
            {PAINT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Color</label>
          <div className="color-picker-row">
            <input type="color" value={hexColor} onChange={e => setHexColor(e.target.value)} />
            <input value={hexColor} onChange={e => setHexColor(e.target.value)} placeholder="#FF0000" style={{ flex: 1 }} />
          </div>
        </div>
        <div className="field full-width form-actions" style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>
          <button className="btn btn-ghost" onClick={onDone}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={!name.trim()}>Save Paint</button>
        </div>
      </div>
    </div>
  );
}
