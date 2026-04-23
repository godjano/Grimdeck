import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import type { PaintPreset } from '../../db/paint-presets';
import { PAINT_TYPES } from '../../types';
import PaintAutocomplete from '../PaintAutocomplete';
import { ALL_PAINT_PRESETS } from '../../db/paint-presets';

interface EnhancedAddPaintProps {
  onDone: () => void;
}

export default function EnhancedAddPaint({ onDone }: EnhancedAddPaintProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Citadel');
  const [range, setRange] = useState('');
  const [type, setType] = useState('Base');
  const [hex, setHex] = useState('#888888');

  const paints = useLiveQuery(() => db.paints.toArray()) ?? [];
  const existingNames = useMemo(() => new Set(paints.map(p => p.name.toLowerCase())), [paints]);

  // Smart suggestions — popular paints the user doesn't own yet
  const suggestions = useMemo(() => {
    const popular = [
      'Abaddon Black', 'Corax White', 'Leadbelcher', 'Agrax Earthshade',
      'Nuln Oil', 'Wraithbone', ' Administratum Grey', 'Mechanicus Standard Grey',
      'Rakarth Flesh', 'Reikland Fleshshade', 'Retributor Armour', 'Runefang Steel',
      'Mephiston Red', 'Calgar Blue', 'Eshin Grey', 'Ushabti Bone',
      'Zandri Dust', 'Rhinox Hide', 'Bugmans Glow',
    ];
    return popular.filter(p => !existingNames.has(p.toLowerCase()));
  }, [existingNames]);

  // Recently added (last 5 by id)
  const recentPaints = useMemo(() => {
    return [...paints].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);
  }, [paints]);

  const handlePreset = (preset: PaintPreset) => {
    setName(preset.name); setBrand(preset.brand);
    if (preset.range) setRange(preset.range);
    if (preset.type) setType(preset.type);
    if (preset.hex) setHex(preset.hex);
  };

  const quickAdd = async (name: string) => {
    const preset = ALL_PAINT_PRESETS.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (preset) {
      await db.paints.add({
        name: preset.name, brand: preset.brand, range: preset.range || '',
        type: preset.type as any, hexColor: preset.hex, quantity: 1, owned: true, notes: ''
      });
    } else {
      await db.paints.add({
        name: name.trim(), brand, range: range.trim(), type: type as any,
        hexColor: hex, quantity: 1, owned: true, notes: ''
      });
    }
  };

  const submit = async () => {
    if (!name.trim()) return;
    await quickAdd(name);
    onDone();
  };

  return (
    <div className="paint-add-enhanced">
      <h3 className="paint-add-title">Add Paint</h3>

      {/* Search with autocomplete */}
      <div className="paint-add-search">
        <label className="field-label">Search from {ALL_PAINT_PRESETS.length}+ presets</label>
        <PaintAutocomplete value={name} onChange={setName} onSelect={handlePreset} />
      </div>

      {/* Quick add popular */}
      {suggestions.length > 0 && (
        <div className="paint-add-suggestions">
          <div className="paint-add-suggestions-label">Popular paints you don't own:</div>
          <div className="paint-add-suggestions-chips">
            {suggestions.slice(0, 8).map(s => {
              const preset = ALL_PAINT_PRESETS.find(p => p.name === s);
              return (
                <button
                  key={s}
                  className="paint-suggestion-chip"
                  onClick={() => quickAdd(s)}
                >
                  {preset && <span className="paint-suggestion-dot" style={{ background: preset.hex }} />}
                  <span>{s}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recently added */}
      {recentPaints.length > 0 && (
        <div className="paint-add-recent">
          <div className="paint-add-recent-label">Recently added:</div>
          <div className="paint-add-recent-items">
            {recentPaints.map(p => (
              <div key={p.id} className="paint-recent-item">
                <div className="paint-recent-swatch" style={{ background: p.hexColor }} />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual form */}
      <div className="paint-add-form-grid">
        <div className="field">
          <label>Brand</label>
          <select value={brand} onChange={e => setBrand(e.target.value)}>
            {['Citadel', 'Vallejo', 'Army Painter', 'AK Interactive', 'Scale75', 'ProAcryl', 'Turbo Dork', 'Monument', 'Kimera'].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {PAINT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Range</label>
          <input value={range} onChange={e => setRange(e.target.value)} placeholder="e.g. Contrast, Model Color" />
        </div>
        <div className="field paint-add-colour">
          <label>Colour</label>
          <div className="paint-add-colour-row">
            <input type="color" value={hex} onChange={e => setHex(e.target.value)} />
            <span className="paint-add-hex">{hex}</span>
            {name && <span className="paint-add-preview" style={{ background: hex }}>{name}</span>}
          </div>
        </div>
      </div>

      <div className="paint-add-actions">
        <button className="btn btn-primary" onClick={submit}>Add Paint</button>
        <button className="btn btn-ghost" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}
