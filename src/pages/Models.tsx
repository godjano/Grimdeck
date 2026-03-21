import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import type { ModelStatus } from '../types';
import { MODEL_STATUSES, MANUFACTURERS, GAME_SYSTEMS, FORCE_ORG } from '../types';
import ModelAutocomplete from '../components/ModelAutocomplete';
import type { ModelPreset } from '../db/model-presets';
import { BulkAddModels } from '../components/BulkAdd';
import { PhotoUpload } from '../components/PhotoUpload';
import { getGWSearchUrl } from '../db/external-links';

type ViewMode = 'list' | 'grid' | 'grouped';

export default function Models() {
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [search, setSearch] = useState('');
  const [filterFaction, setFilterFaction] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSystem, setFilterSystem] = useState('');
  const [showWishlist, setShowWishlist] = useState(false);
  const [view, setView] = useState<ViewMode>('grouped');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(['__ALL_COLLAPSED__']));
  
  const nav = useNavigate();

  const models = useLiveQuery(() => db.models.orderBy('createdAt').reverse().toArray()) ?? [];
  const factions = [...new Set(models.map(m => m.faction))].sort();

  // Initialize collapsed with all factions on first render
  const allCollapsed = collapsed.has('__ALL_COLLAPSED__');

  const toggleGroup = (key: string) => {
    const next = new Set(collapsed);
    next.delete('__ALL_COLLAPSED__');
    next.has(key) ? next.delete(key) : next.add(key);
    setCollapsed(next);
  };

  const collapseAll = () => {
    setCollapsed(new Set([...factions, '__ALL_COLLAPSED__']));
  };

  const expandAll = () => {
    setCollapsed(new Set());
  };

  const filtered = models.filter(m =>
    (!filterFaction || m.faction === filterFaction) &&
    (!filterStatus || m.status === filterStatus) &&
    (!filterSystem || m.gameSystem === filterSystem) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || m.faction.toLowerCase().includes(search.toLowerCase())) &&
    (showWishlist ? m.wishlist : !m.wishlist)
  );

  const statusCounts = MODEL_STATUSES.reduce((acc, s) => {
    acc[s] = models.filter(m => m.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const deleteModel = async (id: number) => {
    await db.models.delete(id);
    await db.modelPaintLinks.where('modelId').equals(id).delete();
  };

  const updateStatus = async (id: number, status: ModelStatus) => {
    await db.models.update(id, { status });
  };

  // Group by faction
  const groups: Record<string, typeof filtered> = {};
  for (const m of filtered) {
    (groups[m.faction] ??= []).push(m);
  }

  return (
    <div>
      <div className="page-header">
        <h2>My Models</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => { setShowBulk(!showBulk); setShowForm(false); }}>📦 Bulk</button>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setShowBulk(false); }}>
            {showForm ? '✕' : '+ Add'}
          </button>
        </div>
      </div>

      {showBulk && <BulkAddModels onDone={() => setShowBulk(false)} />}
      {showForm && <AddModelForm onDone={() => setShowForm(false)} />}

      <div className="stats">
        {MODEL_STATUSES.map(s => (
          <div className="stat" key={s}><div className="stat-num">{statusCounts[s] || 0}</div><div className="stat-label">{s}</div></div>
        ))}
      </div>

      <div className="filters">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search..." className="filter-search" />
        <button className={`btn btn-sm ${showWishlist ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setShowWishlist(!showWishlist)}>
          {showWishlist ? '⭐ Wishlist' : '📦 Collection'}
        </button>
        <select value={filterFaction} onChange={e => setFilterFaction(e.target.value)}>
          <option value="">All factions</option>
          {factions.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {MODEL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterSystem} onChange={e => setFilterSystem(e.target.value)}>
          <option value="">All game systems</option>
          {GAME_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="view-toggle">
          <button className={`view-btn ${view === 'grouped' ? 'active' : ''}`} onClick={() => setView('grouped')}>▤</button>
          <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>▦</button>
          <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>☰</button>
        </div>
      </div>

      <div className="results-bar">
        <div className="results-count">{filtered.length} {showWishlist ? 'wishlisted' : 'owned'} models · {filtered.reduce((s, m) => s + m.quantity, 0)} minis · {filtered.reduce((s, m) => s + (m.points || 0), 0)}pts</div>
        {view === 'grouped' && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-sm btn-ghost" onClick={expandAll}>Expand all</button>
            <button className="btn btn-sm btn-ghost" onClick={collapseAll}>Collapse all</button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">🛡️</span>
          <p className="empty-text">No models found. {models.length === 0 ? 'Add your first!' : 'Try a different filter.'}</p>
        </div>
      ) : view === 'grid' ? (
        <div className="model-grid">
          {filtered.map(m => (
            <div key={m.id} className={`model-tile status-border-${m.status}`}>
              {m.photoUrl ? (
                <img src={m.photoUrl} alt={m.name} className="model-tile-photo" />
              ) : (
                <div className="model-tile-placeholder">🛡️</div>
              )}
              <div className="model-tile-info">
                <div className="model-tile-name">{m.name}</div>
                <div className="model-tile-meta">{m.faction} · ×{m.quantity}</div>
                <span className={`status status-${m.status}`}>{m.status}</span>
              </div>
            </div>
          ))}
        </div>
      ) : view === 'grouped' ? (
        Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([faction, items]) => {
          const isCollapsed = allCollapsed || collapsed.has(faction);
          return (
          <div key={faction} className="paint-group">
            <div className="paint-group-header" onClick={() => toggleGroup(faction)}>
              <span className="paint-group-toggle">{isCollapsed ? '▸' : '▾'}</span>
              <span className="paint-group-title">{faction}</span>
              <span className="paint-group-count">{items.length} units · {items.reduce((s, m) => s + m.quantity, 0)} minis</span>
            </div>
            {!isCollapsed && items.map(m => (
              <div className="card" key={m.id} onClick={() => nav(`/model/${m.id}`)} style={{ cursor: "pointer" }}>
                {m.photoUrl && <img src={m.photoUrl} alt={m.name} className="card-photo" />}
                <div className="card-body">
                  <div className="card-title">{m.name} {m.quantity > 1 && <span className="qty-badge">×{m.quantity}</span>}</div>
                  <div className="card-sub">{m.unitType}{m.points ? ` · ${m.points}pts` : ''}</div>
                  <select className="status-select" value={m.status} onChange={e => updateStatus(m.id!, e.target.value as ModelStatus)}>
                    {MODEL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <span className={`status status-${m.status}`}>{m.status}</span>
                <a href={getGWSearchUrl(m.name)} target="_blank" rel="noreferrer" className="gw-link-sm" onClick={e => e.stopPropagation()} title="View on GW">🔗</a>
                <PhotoUpload modelId={m.id!} currentPhoto={m.photoUrl || undefined} />
                <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); deleteModel(m.id!); }}>🗑</button>
              </div>
            ))}
          </div>
        );})
      ) : (
        filtered.map(m => (
          <div className="card" key={m.id} onClick={() => nav(`/model/${m.id}`)} style={{ cursor: "pointer" }}>
            {m.photoUrl && <img src={m.photoUrl} alt={m.name} className="card-photo" />}
            <div className="card-body">
              <div className="card-title">{m.name} {m.quantity > 1 && <span className="qty-badge">×{m.quantity}</span>}</div>
              <div className="card-sub">{m.faction} · {m.unitType}{m.points ? ` · ${m.points}pts` : ''}</div>
              <select className="status-select" value={m.status} onChange={e => updateStatus(m.id!, e.target.value as ModelStatus)}>
                {MODEL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <span className={`status status-${m.status}`}>{m.status}</span>
            <PhotoUpload modelId={m.id!} currentPhoto={m.photoUrl || undefined} />
            <button className="btn btn-danger btn-sm" onClick={() => deleteModel(m.id!)}>🗑</button>
          </div>
        ))
      )}
    </div>
  );
}

function AddModelForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [faction, setFaction] = useState('');
  const [unitType, setUnitType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<ModelStatus>('unbuilt');
  const [manufacturer, setManufacturer] = useState('Games Workshop');
  const [gameSystem, setGameSystem] = useState('Warhammer 40K');
  const [countsAs, setCountsAs] = useState('');
  const [pricePaid, setPricePaid] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [points, setPoints] = useState(0);
  const [forceOrg, setForceOrg] = useState('Other');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePresetSelect = (preset: ModelPreset) => {
    setName(preset.name); setFaction(preset.faction); setUnitType(preset.unitType); setQuantity(preset.defaultQty);
    if (preset.points) setPoints(preset.points);
    if (preset.forceOrg) setForceOrg(preset.forceOrg);
  };

  const save = async () => {
    if (!name.trim() || !faction.trim()) return;
    await db.models.add({ name: name.trim(), faction: faction.trim(), unitType: unitType.trim(), quantity, status: wishlist ? 'unbuilt' : status, notes: '', photoUrl: '', createdAt: Date.now(), manufacturer, gameSystem, countsAs: countsAs.trim(), pricePaid, wishlist, points, forceOrg });
    onDone();
  };

  return (
    <div className="form-overlay">
      <div className="form-title">{wishlist ? '⭐ Add to Wishlist' : 'Add New Model'}</div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 6 }}>
        <button className={`btn btn-sm ${!wishlist ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setWishlist(false)}>📦 Own it</button>
        <button className={`btn btn-sm ${wishlist ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setWishlist(true)}>⭐ Wishlist</button>
      </div>

      {/* Essential fields */}
      <div className="form-grid">
        <div className="field full-width">
          <label>Name * (type to search)</label>
          <ModelAutocomplete value={name} onChange={setName} onSelect={handlePresetSelect} />
        </div>
        <div className="field"><label>Faction *</label><input value={faction} onChange={e => setFaction(e.target.value)} placeholder="e.g. Space Marines" /></div>
        <div className="field"><label>Quantity</label><input type="number" min={1} value={quantity} onChange={e => setQuantity(+e.target.value || 1)} /></div>
        {!wishlist && (
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as ModelStatus)}>
              {MODEL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Advanced toggle */}
      <button className="btn-advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? '▾ Less options' : '▸ More options (points, type, manufacturer...)'}
      </button>

      {showAdvanced && (
        <div className="form-grid" style={{ marginTop: 12 }}>
          <div className="field"><label>Unit Type</label><input value={unitType} onChange={e => setUnitType(e.target.value)} placeholder="e.g. Troops" /></div>
          <div className="field"><label>Points</label><input type="number" min={0} value={points} onChange={e => setPoints(+e.target.value || 0)} /></div>
          <div className="field">
            <label>Force Org</label>
            <select value={forceOrg} onChange={e => setForceOrg(e.target.value)}>
              {FORCE_ORG.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Game System</label>
            <select value={gameSystem} onChange={e => setGameSystem(e.target.value)}>
              {GAME_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Manufacturer</label>
            <select value={manufacturer} onChange={e => setManufacturer(e.target.value)}>
              {MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="field"><label>Price (€)</label><input type="number" min={0} step={0.01} value={pricePaid} onChange={e => setPricePaid(+e.target.value || 0)} /></div>
          <div className="field full-width"><label>Counts As (proxy)</label><input value={countsAs} onChange={e => setCountsAs(e.target.value)} placeholder="e.g. Custodes Captain" /></div>
        </div>
      )}

      <div className="form-actions" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onDone}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={!name.trim() || !faction.trim()}>
          {wishlist ? '⭐ Add to Wishlist' : 'Save'}
        </button>
      </div>
    </div>
  );
}
