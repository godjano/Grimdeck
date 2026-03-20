import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ModelStatus } from '../types';
import { MODEL_STATUSES } from '../types';
import ModelAutocomplete from '../components/ModelAutocomplete';
import type { ModelPreset } from '../db/model-presets';

export default function Models() {
  const [showForm, setShowForm] = useState(false);
  const [filterFaction, setFilterFaction] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const models = useLiveQuery(() => db.models.orderBy('createdAt').reverse().toArray()) ?? [];
  const factions = [...new Set(models.map(m => m.faction))].sort();

  const filtered = models.filter(m =>
    (!filterFaction || m.faction === filterFaction) &&
    (!filterStatus || m.status === filterStatus)
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

  return (
    <div>
      <div className="page-header">
        <h2>My Models</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Model'}
        </button>
      </div>

      {showForm && <AddModelForm onDone={() => setShowForm(false)} />}

      <div className="stats">
        {MODEL_STATUSES.map(s => (
          <div className="stat" key={s}>
            <div className="stat-num">{statusCounts[s] || 0}</div>
            <div className="stat-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="filters">
        <select value={filterFaction} onChange={e => setFilterFaction(e.target.value)}>
          <option value="">All factions</option>
          {factions.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {MODEL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">🛡️</span>
          <p className="empty-text">No models yet. Add your first to start tracking!</p>
        </div>
      ) : (
        filtered.map(m => (
          <div className="card" key={m.id}>
            <div className="card-body">
              <div className="card-title">{m.name}</div>
              <div className="card-sub">
                {m.faction}{m.unitType ? ` · ${m.unitType}` : ''} · Qty: {m.quantity}
              </div>
              <select
                className="status-select"
                value={m.status}
                onChange={e => updateStatus(m.id!, e.target.value as ModelStatus)}
              >
                {MODEL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <span className={`status status-${m.status}`}>{m.status}</span>
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

  const handlePresetSelect = (preset: ModelPreset) => {
    setName(preset.name);
    setFaction(preset.faction);
    setUnitType(preset.unitType);
    setQuantity(preset.defaultQty);
  };

  const save = async () => {
    if (!name.trim() || !faction.trim()) return;
    await db.models.add({
      name: name.trim(), faction: faction.trim(), unitType: unitType.trim(),
      quantity, status, notes: '', photoUrl: '', createdAt: Date.now(),
    });
    onDone();
  };

  return (
    <div className="form-overlay">
      <div className="form-title">Add New Model</div>
      <div className="form-grid">
        <div className="field full-width">
          <label>Name * (type to search units or factions)</label>
          <ModelAutocomplete value={name} onChange={setName} onSelect={handlePresetSelect} />
        </div>
        <div className="field">
          <label>Faction *</label>
          <input value={faction} onChange={e => setFaction(e.target.value)} placeholder="e.g. Space Marines" />
        </div>
        <div className="field">
          <label>Unit Type</label>
          <input value={unitType} onChange={e => setUnitType(e.target.value)} placeholder="e.g. Troops" />
        </div>
        <div className="field">
          <label>Quantity</label>
          <input type="number" min={1} value={quantity} onChange={e => setQuantity(+e.target.value || 1)} />
        </div>
        <div className="field">
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as ModelStatus)}>
            {MODEL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field full-width form-actions" style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>
          <button className="btn btn-ghost" onClick={onDone}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={!name.trim() || !faction.trim()}>
            Save Model
          </button>
        </div>
      </div>
    </div>
  );
}
