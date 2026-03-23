import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import type { ModelStatus } from '../types';
import { MODEL_STATUSES, MANUFACTURERS, GAME_SYSTEMS, FORCE_ORG } from '../types';
import ModelAutocomplete from '../components/ModelAutocomplete';
import type { ModelPreset } from '../db/model-presets';
import { BulkAddModels } from '../components/BulkAdd';
import { getGWSearchUrl } from '../db/external-links';
import { Plus, Package, Search, Filter, ChevronDown, ChevronRight, Grid3X3, List, LayoutGrid, MoreVertical, Trash2, ExternalLink, Star, Camera, X } from 'lucide-react';
import PageBanner from '../components/PageBanner';

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
  const [showFilters, setShowFilters] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const nav = useNavigate();
  const models = useLiveQuery(() => db.models.orderBy('createdAt').reverse().toArray()) ?? [];
  const factions = [...new Set(models.map(m => m.faction))].sort();

  const allCollapsed = collapsed.has('__ALL_COLLAPSED__');

  const toggleGroup = (key: string) => {
    const next = new Set(collapsed);
    if (next.has('__ALL_COLLAPSED__')) {
      next.delete('__ALL_COLLAPSED__');
      factions.forEach(f => { if (f !== key) next.add(f); });
    } else {
      next.has(key) ? next.delete(key) : next.add(key);
    }
    setCollapsed(next);
  };

  const collapseAll = () => setCollapsed(new Set([...factions, '__ALL_COLLAPSED__']));
  const expandAll = () => setCollapsed(new Set());

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
    setOpenMenu(null);
  };

  const updateStatus = async (id: number, status: ModelStatus) => {
    await db.models.update(id, { status });
  };

  const groups: Record<string, typeof filtered> = {};
  for (const m of filtered) (groups[m.faction] ??= []).push(m);

  const activeFilters = [filterFaction, filterStatus, filterSystem].filter(Boolean).length;

  return (
    <div>
      <PageBanner title="My Models" subtitle="Track every miniature by faction and status" icon="models" />
      {/* ─── Header ─── */}
      <div className="page-header">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setShowBulk(!showBulk); setShowForm(false); }}>
            <Package size={16} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); setShowBulk(false); }}>
            {showForm ? <X size={16} /> : <><Plus size={16} /> Add</>}
          </button>
        </div>
      </div>

      {showBulk && <BulkAddModels onDone={() => setShowBulk(false)} />}
      {showForm && <AddModelForm onDone={() => setShowForm(false)} />}

      {/* ─── Status summary — compact pills ─── */}
      <div className="ml-status-pills">
        {MODEL_STATUSES.map(s => (
          <button key={s} className={`ml-pill ${filterStatus === s ? 'active' : ''}`}
            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}>
            <span className="ml-pill-count">{statusCounts[s] || 0}</span>
            <span className="ml-pill-label">{s}</span>
          </button>
        ))}
      </div>

      {/* ─── Search + filter toggle ─── */}
      <div className="ml-search-row">
        <div className="ml-search-wrap">
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search models..." />
        </div>
        <button className={`btn btn-sm ${showWishlist ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setShowWishlist(!showWishlist)}>
          <Star size={14} fill={showWishlist ? 'currentColor' : 'none'} />
        </button>
        <button className={`btn btn-sm btn-ghost ${activeFilters ? 'ml-filter-active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={14} /> {activeFilters ? activeFilters : ''}
        </button>
        <div className="ml-view-toggle">
          <button className={view === 'grouped' ? 'active' : ''} onClick={() => setView('grouped')}><LayoutGrid size={14} /></button>
          <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Grid3X3 size={14} /></button>
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={14} /></button>
        </div>
      </div>

      {/* ─── Collapsible filters ─── */}
      {showFilters && (
        <div className="ml-filters">
          <select value={filterFaction} onChange={e => setFilterFaction(e.target.value)}>
            <option value="">All factions</option>
            {factions.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All statuses</option>
            {MODEL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterSystem} onChange={e => setFilterSystem(e.target.value)}>
            <option value="">All systems</option>
            {GAME_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {activeFilters > 0 && <button className="btn btn-sm btn-ghost" onClick={() => { setFilterFaction(''); setFilterStatus(''); setFilterSystem(''); }}>Clear</button>}
        </div>
      )}

      {/* ─── Results bar ─── */}
      <div className="ml-results">
        <span>{filtered.length} models · {filtered.reduce((s, m) => s + m.quantity, 0)} minis · {filtered.reduce((s, m) => s + (m.points || 0), 0)}pts</span>
        {view === 'grouped' && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-sm btn-ghost" onClick={expandAll}>Expand</button>
            <button className="btn btn-sm btn-ghost" onClick={collapseAll}>Collapse</button>
          </div>
        )}
      </div>

      {/* ─── Empty state ─── */}
      {filtered.length === 0 ? (
        <div className="md-empty-tab" style={{ marginTop: 40 }}>
          <img src="/decor/skull.jpg" alt="" className="md-empty-icon" />
          <p>{models.length === 0 ? 'Add your first model to begin.' : 'No models match your filters.'}</p>
        </div>
      ) : view === 'grid' ? (
        /* ─── Grid view — photo tiles ─── */
        <div className="ml-grid">
          {filtered.map(m => (
            <div key={m.id} className="ml-tile" onClick={() => nav(`/model/${m.id}`)}>
              <div className="ml-tile-img">
                {m.photoUrl ? <img src={m.photoUrl} alt={m.name} /> : <div className="ml-tile-placeholder"><Camera size={24} strokeWidth={1} /></div>}
                <span className={`ml-tile-status status-${m.status}`}>{m.status}</span>
              </div>
              <div className="ml-tile-info">
                <div className="ml-tile-name">{m.name}</div>
                <div className="ml-tile-meta">{m.faction}</div>
              </div>
            </div>
          ))}
        </div>
      ) : view === 'grouped' ? (
        /* ─── Grouped view — clean faction groups ─── */
        Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([faction, items]) => {
          const isCollapsed = allCollapsed || collapsed.has(faction);
          return (
            <div key={faction} className="ml-group">
              <div className="ml-group-header" onClick={() => toggleGroup(faction)}>
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                <span className="ml-group-title">{faction}</span>
                <span className="ml-group-count">{items.length} · {items.reduce((s, m) => s + m.quantity, 0)} minis</span>
              </div>
              {!isCollapsed && (
                <div className="ml-group-items">
                  {items.map(m => (
                    <ModelCard key={m.id} m={m} nav={nav} openMenu={openMenu} setOpenMenu={setOpenMenu}
                      updateStatus={updateStatus} deleteModel={deleteModel} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        /* ─── List view ─── */
        <div className="ml-list">
          {filtered.map(m => (
            <ModelCard key={m.id} m={m} nav={nav} openMenu={openMenu} setOpenMenu={setOpenMenu}
              updateStatus={updateStatus} deleteModel={deleteModel} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Clean model card with overflow menu ─── */
function ModelCard({ m, nav, openMenu, setOpenMenu, updateStatus, deleteModel }: {
  m: any; nav: any; openMenu: number | null; setOpenMenu: (id: number | null) => void;
  updateStatus: (id: number, s: ModelStatus) => void; deleteModel: (id: number) => void;
}) {
  return (
    <div className="ml-card" onClick={() => nav(`/model/${m.id}`)}>
      {m.photoUrl ? (
        <img src={m.photoUrl} alt={m.name} className="ml-card-photo" />
      ) : (
        <div className="ml-card-photo-empty"><Camera size={16} strokeWidth={1} /></div>
      )}
      <div className="ml-card-body">
        <div className="ml-card-name">{m.name} {m.quantity > 1 && <span className="qty-badge">×{m.quantity}</span>}</div>
        <div className="ml-card-sub">{m.unitType}{m.points ? ` · ${m.points}pts` : ''}</div>
      </div>
      <span className={`ml-card-status status-${m.status}`}>{m.status}</span>
      <div className="ml-card-menu-wrap" onClick={e => e.stopPropagation()}>
        <button className="btn-icon-sm" onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}>
          <MoreVertical size={16} />
        </button>
        {openMenu === m.id && (
          <div className="ml-card-menu">
            {MODEL_STATUSES.map(s => (
              <button key={s} className={m.status === s ? 'active' : ''} onClick={() => { updateStatus(m.id!, s as ModelStatus); setOpenMenu(null); }}>{s}</button>
            ))}
            <hr />
            <a href={getGWSearchUrl(m.name)} target="_blank" rel="noreferrer" onClick={() => setOpenMenu(null)}>
              <ExternalLink size={12} /> GW Store
            </a>
            <button className="danger" onClick={() => deleteModel(m.id!)}><Trash2 size={12} /> Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Add Model Form (unchanged logic, cleaner markup) ─── */
function AddModelForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [faction, setFaction] = useState('');
  const [unitType, setUnitType] = useState('Infantry');
  const [quantity, setQuantity] = useState(1);
  const [gameSystem, setGameSystem] = useState('Warhammer 40K');
  const [manufacturer, setManufacturer] = useState('Games Workshop');
  const [points, setPoints] = useState(0);
  const [forceOrg, setForceOrg] = useState('');
  const [proxy, setProxy] = useState('');
  const [wishlist, setWishlist] = useState(false);

  const handlePreset = (preset: ModelPreset) => {
    setName(preset.name);
    setFaction(preset.faction);
    if (preset.unitType) setUnitType(preset.unitType);
    if (preset.points) setPoints(preset.points);
    if (preset.forceOrg) setForceOrg(preset.forceOrg);
  };

  const submit = async () => {
    if (!name.trim()) return;
    await db.models.add({
      name: name.trim(), faction: faction.trim() || 'Unknown', unitType, quantity,
      status: 'unbuilt', gameSystem, manufacturer, points, forceOrg, countsAs: proxy.trim(),
      wishlist, createdAt: Date.now(), notes: '', photoUrl: '', pricePaid: 0,
    });
    onDone();
  };

  return (
    <div className="detail-section" style={{ marginBottom: 20 }}>
      <h3 style={{ marginBottom: 12 }}>Add Model</h3>
      <div className="field"><label>Name</label><ModelAutocomplete value={name} onChange={setName} onSelect={handlePreset} /></div>
      <div className="field"><label>Faction</label><input value={faction} onChange={e => setFaction(e.target.value)} placeholder="e.g. Space Marines" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field"><label>Unit Type</label>
          <select value={unitType} onChange={e => setUnitType(e.target.value)}>
            {['Infantry', 'Vehicle', 'Monster', 'Character', 'Terrain', 'Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field"><label>Quantity</label><input type="number" min={1} value={quantity} onChange={e => setQuantity(+e.target.value)} /></div>
        <div className="field"><label>Game System</label>
          <select value={gameSystem} onChange={e => setGameSystem(e.target.value)}>
            {GAME_SYSTEMS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field"><label>Points</label><input type="number" min={0} value={points} onChange={e => setPoints(+e.target.value)} /></div>
        <div className="field"><label>Manufacturer</label>
          <select value={manufacturer} onChange={e => setManufacturer(e.target.value)}>
            {MANUFACTURERS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="field"><label>Force Org</label>
          <select value={forceOrg} onChange={e => setForceOrg(e.target.value)}>
            <option value="">None</option>
            {FORCE_ORG.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
      </div>
      <div className="field"><label>Proxy for</label><input value={proxy} onChange={e => setProxy(e.target.value)} placeholder="Optional — what this proxies as" /></div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <input type="checkbox" checked={wishlist} onChange={e => setWishlist(e.target.checked)} /> Wishlist (don't own yet)
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn btn-primary" onClick={submit}>Add Model</button>
        <button className="btn btn-ghost" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}

// end of file
