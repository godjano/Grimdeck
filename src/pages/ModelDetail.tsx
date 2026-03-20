import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ModelStatus } from '../types';
import PaintAutocomplete from '../components/PaintAutocomplete';
import type { PaintPreset } from '../db/paint-presets';
import { FACTION_ROSTERS } from '../db/killteam-data';
import { getGWSearchUrl } from '../db/external-links';

const STATUS_FLOW: ModelStatus[] = ['unbuilt', 'built', 'primed', 'wip', 'painted', 'based'];

export default function ModelDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const modelId = Number(id);

  const model = useLiveQuery(() => db.models.get(modelId), [modelId]);
  const linkedPaints = useLiveQuery(() =>
    db.modelPaintLinks.where('modelId').equals(modelId).toArray().then(async links => {
      const results = [];
      for (const link of links) {
        const paint = await db.paints.get(link.paintId);
        if (paint) results.push({ link, paint });
      }
      return results;
    }), [modelId]) ?? [];
  const logs = useLiveQuery(() => db.paintingLogs.where('modelId').equals(modelId).reverse().sortBy('timestamp'), [modelId]) ?? [];

  const [paintSearch, setPaintSearch] = useState('');
  const [usageNote, setUsageNote] = useState('');
  const [logText, setLogText] = useState('');
  const [showAddPaint, setShowAddPaint] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const logPhotoRef = useRef<HTMLInputElement>(null);

  if (!model) return <div className="empty">Loading...</div>;

  const setStatus = async (status: ModelStatus) => { await db.models.update(modelId, { status }); };
  const currentIdx = STATUS_FLOW.indexOf(model.status);

  const addPaintToRecipe = async (paintId: number) => {
    await db.modelPaintLinks.add({ modelId, paintId, usageNote: usageNote.trim() });
    setPaintSearch(''); setUsageNote(''); setShowAddPaint(false);
  };

  const removePaint = async (linkId: number) => { await db.modelPaintLinks.delete(linkId); };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(600 / img.width, 600 / img.height, 1);
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        await db.models.update(modelId, { photoUrl: canvas.toDataURL('image/jpeg', 0.75) });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addLog = async (photoUrl = '') => {
    if (!logText.trim() && !photoUrl) return;
    await db.paintingLogs.add({ modelId, text: logText.trim(), timestamp: Date.now(), photoUrl });
    setLogText('');
  };

  const handleLogPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(400 / img.width, 400 / img.height, 1);
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        await addLog(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Find matching datacard
  const roster = FACTION_ROSTERS[model.faction];
  const datacard = roster?.find(op => model.name.toLowerCase().includes(op.name.toLowerCase().split(' ')[0]));

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => nav('/models')} style={{ marginBottom: 16 }}>← Back to Models</button>

      {/* ─── Header — RPG Character Sheet Style ─── */}
      <div className="rpg-sheet">
        <div className="rpg-stats-left">
          <h2 className="rpg-name">{model.name}</h2>
          <div className="rpg-meta">{model.faction}{model.points ? ` · ${model.points}pts` : ''}</div>
          <a href={getGWSearchUrl(model.name)} target="_blank" rel="noreferrer" className="gw-link">View on Games Workshop ↗</a>

          {datacard ? (
            <div className="rpg-stat-list">
              <div className="rpg-stat-row"><span className="rpg-stat-abbr">M</span><span className="rpg-stat-name">Move</span><span className="rpg-stat-val">{datacard.movement}"</span></div>
              <div className="rpg-stat-row"><span className="rpg-stat-abbr">APL</span><span className="rpg-stat-name">Actions</span><span className="rpg-stat-val">{datacard.apl}</span></div>
              <div className="rpg-stat-row"><span className="rpg-stat-abbr">SV</span><span className="rpg-stat-name">Save</span><span className="rpg-stat-val">{datacard.save}+</span></div>
              <div className="rpg-wounds-block">
                <span className="rpg-wounds-icon">❤️</span>
                <span className="rpg-wounds-label">Wounds</span>
                <span className="rpg-wounds-val">{datacard.wounds}</span>
              </div>
            </div>
          ) : (
            <div className="rpg-stat-list">
              <div className="rpg-stat-row"><span className="rpg-stat-abbr">QTY</span><span className="rpg-stat-name">Quantity</span><span className="rpg-stat-val">{model.quantity}</span></div>
              <div className="rpg-stat-row"><span className="rpg-stat-abbr">SYS</span><span className="rpg-stat-name">System</span><span className="rpg-stat-val rpg-stat-text">{model.gameSystem}</span></div>
            </div>
          )}
        </div>

        <div className="rpg-portrait" onClick={() => photoRef.current?.click()}>
          {model.photoUrl ? <img src={model.photoUrl} alt={model.name} /> : <div className="rpg-portrait-empty">📷<br />Add Photo</div>}
          <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
          <div className="rpg-portrait-frame" />
        </div>

        <div className="rpg-weapons-right">
          <div className="status-pipeline">
            {STATUS_FLOW.map((s, i) => (
              <button key={s} className={`pipeline-step ${model.status === s ? 'active' : i < currentIdx ? 'done' : ''}`} onClick={() => setStatus(s)}>
                {i < currentIdx ? '✓' : ''} {s}
              </button>
            ))}
          </div>

          {datacard && datacard.weapons.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="rpg-section-label">Weapons</div>
              {datacard.weapons.map(w => (
                <div key={w.name} className="rpg-weapon">
                  <div className="rpg-weapon-header">
                    <span className="rpg-weapon-icon">{w.type === 'ranged' ? '🔫' : '⚔️'}</span>
                    <span className="rpg-weapon-name">{w.name}</span>
                  </div>
                  <div className="rpg-weapon-stats">
                    <span>{w.attacks}A</span><span>{w.skill}+</span><span>{w.normalDmg}/{w.critDmg}dmg</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Paint Recipe ─── */}
      <div className="detail-section">
        <div className="detail-section-header">
          <h3>🎨 Paint Recipe</h3>
          <button className="btn btn-sm btn-ghost" onClick={() => setShowAddPaint(!showAddPaint)}>
            {showAddPaint ? '✕' : '+ Add Paint'}
          </button>
        </div>

        {showAddPaint && (
          <div className="recipe-add">
            <div className="field">
              <label>Search your paints</label>
              <PaintAutocomplete value={paintSearch} onChange={setPaintSearch} onSelect={async (preset: PaintPreset) => {
                const paint = await db.paints.where('name').equals(preset.name).first();
                if (paint?.id) { await addPaintToRecipe(paint.id); }
                else { setPaintSearch(preset.name); }
              }} />
            </div>
            <div className="field">
              <label>Usage (e.g. "base coat armour")</label>
              <input value={usageNote} onChange={e => setUsageNote(e.target.value)} placeholder="Where/how you use this paint" />
            </div>
          </div>
        )}

        {linkedPaints.length === 0 ? (
          <p className="detail-empty">No paints assigned yet. Add paints to build a recipe.</p>
        ) : (
          <>
            <div className="recipe-list">
              {linkedPaints.map(({ link, paint }) => (
                <div key={link.id} className="recipe-item">
                  <div className="swatch" style={{ width: 28, height: 28, background: paint.hexColor || '#555' }} />
                  <div className="recipe-item-info">
                    <div className="recipe-paint-name">{paint.name}</div>
                    <div className="recipe-usage">{link.usageNote || paint.brand + ' · ' + paint.type}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removePaint(link.id!)}>✕</button>
                </div>
              ))}
            </div>
            <button className="btn btn-sm btn-ghost" style={{ marginTop: 10 }} onClick={() => {
              const text = `Paint recipe for ${model.name} (${model.faction}):\n` + linkedPaints.map(({ link, paint }) => `• ${paint.name} (${paint.brand}) — ${link.usageNote || paint.type}`).join('\n');
              navigator.clipboard.writeText(text);
            }}>📋 Copy recipe as text</button>
          </>
        )}
      </div>

      {/* ─── Painting Journal ─── */}
      <div className="detail-section">
        <h3>📝 Painting Journal</h3>
        <div className="journal-add">
          <textarea value={logText} onChange={e => setLogText(e.target.value)} placeholder="What did you work on today?" rows={2} />
          <div className="journal-actions">
            <button className="btn btn-sm btn-ghost" onClick={() => logPhotoRef.current?.click()}>📷 Photo</button>
            <button className="btn btn-sm btn-primary" onClick={() => addLog()} disabled={!logText.trim()}>Add Entry</button>
            <input ref={logPhotoRef} type="file" accept="image/*" capture="environment" onChange={handleLogPhoto} style={{ display: 'none' }} />
          </div>
        </div>
        {logs.length === 0 ? (
          <p className="detail-empty">No journal entries yet. Track your painting sessions here.</p>
        ) : (
          <div className="journal-list">
            {logs.map(log => (
              <div key={log.id} className="journal-entry">
                <div className="journal-time">{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                {log.text && <div className="journal-text">{log.text}</div>}
                {log.photoUrl && <img src={log.photoUrl} alt="Progress" className="journal-photo" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Inspiration Board ─── */}
      <div className="detail-section">
        <h3>📸 Inspiration Board</h3>
        <p className="detail-empty" style={{ marginBottom: 12 }}>Save reference images from Instagram, Reddit, or anywhere. Right-click → Copy Image, then paste here.</p>
        <InspirationBoard modelId={modelId} />
      </div>

      {/* Datacard stats are now in the RPG sheet header above */}
    </div>
  );
}

function InspirationBoard({ modelId }: { modelId: number }) {
  const [images, setImages] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(`inspo_${modelId}`) || '[]'); } catch { return []; }
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const save = (imgs: string[]) => { setImages(imgs); localStorage.setItem(`inspo_${modelId}`, JSON.stringify(imgs)); };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(500 / img.width, 500 / img.height, 1);
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        save([...images, canvas.toDataURL('image/jpeg', 0.7)]);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-active');
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.currentTarget.classList.add('drag-active'); };
  const handleDragLeave = (e: React.DragEvent) => { e.currentTarget.classList.remove('drag-active'); };

  const removeImage = (i: number) => save(images.filter((_, j) => j !== i));

  return (
    <div>
      {/* Drag & drop zone */}
      <div className="inspo-drop-zone" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
        <div className="inspo-drop-icon">📸</div>
        <div className="inspo-drop-text">Drag & drop an image here</div>
        <div className="inspo-drop-or">or</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn btn-sm btn-primary" onClick={() => fileRef.current?.click()}>📁 Choose File</button>
          <button className="btn btn-sm btn-ghost" onClick={() => { if (fileRef.current) { fileRef.current.setAttribute('capture', 'environment'); fileRef.current.click(); fileRef.current.removeAttribute('capture'); } }}>📷 Take Photo</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>

      <p className="inspo-help">💡 <strong>From Instagram:</strong> Screenshot the post (Win+Shift+S) → save → drag here. Or right-click image → "Save image as" → drag/upload.</p>

      {images.length > 0 && (
        <div className="inspo-grid">
          {images.map((img, i) => (
            <div key={i} className="inspo-item">
              <img src={img} alt={`Inspiration ${i + 1}`} />
              <button className="inspo-remove" onClick={() => removeImage(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
