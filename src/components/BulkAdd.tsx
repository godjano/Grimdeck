import { useState } from 'react';
import { db } from '../db';
import { ALL_PAINT_PRESETS } from '../db/paint-presets';
import { ALL_MODEL_PRESETS } from '../db/model-presets';

export function BulkAddPaints({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [brandFilter, setBrandFilter] = useState('');
  const [search, setSearch] = useState('');
  const brands = [...new Set(ALL_PAINT_PRESETS.map(p => p.brand))];

  const filtered = ALL_PAINT_PRESETS.filter(p =>
    (!brandFilter || p.brand === brandFilter) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (i: number) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  };

  const selectAll = () => setSelected(new Set(filtered.map((_, i) => ALL_PAINT_PRESETS.indexOf(filtered[i]))));

  const addSelected = async () => {
    const paints = [...selected].map(i => ALL_PAINT_PRESETS[i]);
    for (const p of paints) {
      await db.paints.add({ name: p.name, brand: p.brand, range: p.range, type: p.type, hexColor: p.hex, owned: true, quantity: 1, notes: '' });
    }
    onDone();
  };

  return (
    <div className="form-overlay">
      <div className="form-title">Bulk Add Paints ({selected.size} selected)</div>
      <div className="bulk-controls">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search paints..." className="bulk-search" />
        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="bulk-filter">
          <option value="">All brands</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <button className="btn btn-sm btn-ghost" onClick={selectAll}>Select all ({filtered.length})</button>
        <button className="btn btn-sm btn-ghost" onClick={() => setSelected(new Set())}>Clear</button>
      </div>
      <div className="bulk-grid">
        {filtered.map((p, _i) => {
          const idx = ALL_PAINT_PRESETS.indexOf(p);
          return (
            <div key={idx} className={`bulk-item ${selected.has(idx) ? 'selected' : ''}`} onClick={() => toggle(idx)}>
              <div className="bulk-swatch" style={{ background: p.hex }} />
              <div className="bulk-name">{p.name}</div>
              <div className="bulk-meta">{p.brand} · {p.type}</div>
            </div>
          );
        })}
      </div>
      <div className="form-actions" style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" onClick={onDone}>Cancel</button>
        <button className="btn btn-primary" onClick={addSelected} disabled={selected.size === 0}>Add {selected.size} Paints</button>
      </div>
    </div>
  );
}

export function BulkAddModels({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [factionFilter, setFactionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [forceOrgFilter, setForceOrgFilter] = useState('');
  const [search, setSearch] = useState('');
  const factions = [...new Set(ALL_MODEL_PRESETS.map(m => m.faction))].sort();
  const unitTypes = [...new Set(ALL_MODEL_PRESETS.map(m => m.unitType))].sort();
  const forceOrgs = [...new Set(ALL_MODEL_PRESETS.map(m => m.forceOrg).filter(Boolean))].sort();

  const filtered = ALL_MODEL_PRESETS.filter(m =>
    (!factionFilter || m.faction === factionFilter) &&
    (!typeFilter || m.unitType === typeFilter) &&
    (!forceOrgFilter || m.forceOrg === forceOrgFilter) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || m.faction.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (i: number) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  };

  const selectAll = () => setSelected(new Set(filtered.map((_, i) => ALL_MODEL_PRESETS.indexOf(filtered[i]))));

  const addSelected = async () => {
    const models = [...selected].map(i => ALL_MODEL_PRESETS[i]);
    for (const m of models) {
      await db.models.add({ name: m.name, faction: m.faction, unitType: m.unitType, quantity: m.defaultQty, status: 'unbuilt', notes: '', photoUrl: '', createdAt: Date.now(), manufacturer: 'Games Workshop', gameSystem: 'Warhammer 40K', countsAs: '', pricePaid: 0, wishlist: false, points: m.points || 0, forceOrg: m.forceOrg || 'Other' });
    }
    onDone();
  };

  return (
    <div className="form-overlay">
      <div className="form-title">Bulk Add Models ({selected.size} selected{selected.size > 0 ? ` · ${[...selected].reduce((s, i) => s + (ALL_MODEL_PRESETS[i]?.points || 0), 0)}pts` : ''})</div>
      <div className="bulk-controls">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search units or factions..." className="bulk-search" />
        <select value={factionFilter} onChange={e => setFactionFilter(e.target.value)} className="bulk-filter">
          <option value="">All factions ({factions.length})</option>
          {factions.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bulk-filter">
          <option value="">All unit types</option>
          {unitTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={forceOrgFilter} onChange={e => setForceOrgFilter(e.target.value)} className="bulk-filter">
          <option value="">All force org</option>
          {forceOrgs.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <button className="btn btn-sm btn-ghost" onClick={selectAll}>Select all ({filtered.length})</button>
        <button className="btn btn-sm btn-ghost" onClick={() => setSelected(new Set())}>Clear</button>
      </div>
      <div className="bulk-grid">
        {filtered.map((m, _i) => {
          const idx = ALL_MODEL_PRESETS.indexOf(m);
          return (
            <div key={idx} className={`bulk-item ${selected.has(idx) ? 'selected' : ''}`} onClick={() => toggle(idx)}>
              <div className="bulk-name">{m.name}</div>
              <div className="bulk-meta">{m.faction} · {m.unitType} · ×{m.defaultQty}{m.points ? ` · ${m.points}pts` : ''}</div>
            </div>
          );
        })}
      </div>
      <div className="form-actions" style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" onClick={onDone}>Cancel</button>
        <button className="btn btn-primary" onClick={addSelected} disabled={selected.size === 0}>Add {selected.size} Units</button>
      </div>
    </div>
  );
}
