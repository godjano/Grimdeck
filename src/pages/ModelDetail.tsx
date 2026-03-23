import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ModelStatus } from '../types';
import PaintAutocomplete from '../components/PaintAutocomplete';
import type { PaintPreset } from '../db/paint-presets';
import { FACTION_ROSTERS } from '../db/killteam-data';
import { getGWSearchUrl } from '../db/external-links';
import { ChevronLeft, Camera, Image, ExternalLink, Trash2, Copy, Plus, X } from 'lucide-react';
import GoldIcon from '../components/GoldIcon';

const STATUS_FLOW: ModelStatus[] = ['unbuilt', 'built', 'primed', 'wip', 'painted', 'based'];

// Map faction names to faction-art filenames
const FACTION_ART_MAP: Record<string, string> = {
  'Angels of Death': 'angels-of-death-13-1.jpeg', 'Battleclade': 'battleclade-10-2.jpeg',
  'Brood Brothers': 'brood-brothers-0-32.jpeg', 'Canoptek Circle': 'canoptek-circle-0-22.jpeg',
  'Celestian Insidiants': 'celestian-insidiants-10-2.jpeg', 'Death Korps': 'death-korps-0-31.jpeg',
  'Deathwatch': 'deathwatch-12-10.jpeg', 'Exaction Squad': 'exaction-squad-0-30.jpeg',
  'Farstalker Kinband': 'farstalker-kinband-0-32.jpeg', 'Hearthkyn Salvagers': 'hearthkyn-salvagers-14-18.jpeg',
  'Hierotek Circle': 'hierotek-circle-15-3.jpeg', 'Hunter Clade': 'hunter-clade-14-8.jpeg',
  'Imperial Navy Breachers': 'imperial-navy-breachers-14-1.jpeg', 'Inquisitorial Agents': 'inquisitorial-agents-0-31.jpeg',
  'Mandrakes': 'mandrakes-0-31.jpeg', 'Murderwing': 'murderwing-11-2.jpeg',
  'Nemesis Claw': 'nemesis-claw-0-30.jpeg', 'Pathfinders': 'pathfinders-0-32.jpeg',
  'Plague Marines': 'plague-marines-10-2.jpeg', 'Sanctifiers': 'sanctifiers-0-30.jpeg',
  'Scout Squad': 'scout-squad-0-32.jpeg', 'Wolf Scouts': 'wolf-scouts-10-0.jpeg',
  'XV26 Stealth Battlesuits': 'xv26-stealth-battlesuits-10-2.jpeg',
  // Common 40K factions mapped to closest art
  'Space Marines': 'angels-of-death-13-1.jpeg', 'Adeptus Astartes': 'angels-of-death-13-1.jpeg',
  'Blood Angels': 'angels-of-death-13-1.jpeg', 'Dark Angels': 'murderwing-11-2.jpeg',
  'Space Wolves': 'wolf-scouts-10-0.jpeg', 'Astra Militarum': 'death-korps-0-31.jpeg',
  'Imperial Guard': 'death-korps-0-31.jpeg', 'Genestealer Cults': 'brood-brothers-0-32.jpeg',
  'Necrons': 'canoptek-circle-0-22.jpeg', 'Adepta Sororitas': 'celestian-insidiants-10-2.jpeg',
  'Sisters of Battle': 'celestian-insidiants-10-2.jpeg', 'Adeptus Mechanicus': 'hunter-clade-14-8.jpeg',
  "T'au Empire": 'pathfinders-0-32.jpeg', 'Tau': 'pathfinders-0-32.jpeg',
  'Drukhari': 'mandrakes-0-31.jpeg', 'Chaos Space Marines': 'nemesis-claw-0-30.jpeg',
  'Death Guard': 'plague-marines-10-2.jpeg', 'Inquisition': 'inquisitorial-agents-0-31.jpeg',
  'Leagues of Votann': 'hearthkyn-salvagers-14-18.jpeg',
};

function getFactionArt(faction: string): string | null {
  const file = FACTION_ART_MAP[faction];
  if (file) return `/faction-art/${file}`;
  const lower = faction.toLowerCase();
  for (const [key, val] of Object.entries(FACTION_ART_MAP)) {
    if (lower.includes(key.toLowerCase().split(' ')[0])) return `/faction-art/${val}`;
  }
  return null;
}

type Tab = 'stats' | 'recipe' | 'journal' | 'inspiration';

export default function ModelDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const modelId = Number(id);
  const [tab, setTab] = useState<Tab>('stats');

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
  const factionArt = getFactionArt(model.faction);
  const roster = FACTION_ROSTERS[model.faction];
  const datacard = roster?.find(op => model.name.toLowerCase().includes(op.name.toLowerCase().split(' ')[0]));

  const addPaintToRecipe = async (paintId: number) => {
    await db.modelPaintLinks.add({ modelId, paintId, usageNote: usageNote.trim() });
    setPaintSearch(''); setUsageNote(''); setShowAddPaint(false);
  };
  const removePaint = async (linkId: number) => { await db.modelPaintLinks.delete(linkId); };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const img = new window.Image();
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
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const img = new window.Image();
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

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'stats', label: 'Datacard', icon: <GoldIcon name="campaigns" size={18} /> },
    { key: 'recipe', label: 'Recipe', icon: <GoldIcon name="paints" size={18} /> , count: linkedPaints.length },
    { key: 'journal', label: 'Journal', icon: <GoldIcon name="guides" size={18} />, count: logs.length },
    { key: 'inspiration', label: 'Inspo', icon: <GoldIcon name="inspiration" size={18} /> },
  ];

  return (
    <div className="model-detail-v2">
      {/* ─── HERO BANNER with faction art ─── */}
      <div className="md-hero" style={factionArt ? { backgroundImage: `url(${factionArt})` } : {}}>
        <div className="md-hero-overlay" />
        <button className="btn btn-ghost btn-sm md-back" onClick={() => nav('/models')}>
          <ChevronLeft size={16} /> Back
        </button>
        <div className="md-hero-content">
          <div className="md-portrait" onClick={() => photoRef.current?.click()}>
            {model.photoUrl ? <img src={model.photoUrl} alt={model.name} /> : <Camera size={28} strokeWidth={1.5} />}
            <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
          </div>
          <div className="md-hero-info">
            <h1 className="md-name">{model.name}</h1>
            <div className="md-faction">{model.faction}{model.points ? ` · ${model.points}pts` : ''}</div>
            <div className="md-status-row">
              {STATUS_FLOW.map((s, i) => (
                <button key={s} className={`md-status-pip ${model.status === s ? 'active' : i < currentIdx ? 'done' : ''}`} onClick={() => setStatus(s)} title={s}>
                  <span className="md-pip-dot" />
                  <span className="md-pip-label">{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <a href={getGWSearchUrl(model.name)} target="_blank" rel="noreferrer" className="md-gw-link">
          <ExternalLink size={14} /> GW Store
        </a>
      </div>

      {/* ─── TAB BAR ─── */}
      <div className="md-tabs">
        {tabs.map(t => (
          <button key={t.key} className={`md-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.icon}
            <span>{t.label}</span>
            {t.count ? <span className="md-tab-count">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {/* ─── TAB CONTENT ─── */}
      <div className="md-content">
        {tab === 'stats' && (
          <div className="md-stats-tab">
            {datacard ? (
              <>
                <div className="md-stat-grid">
                  <div className="md-stat-card"><div className="md-stat-label">Move</div><div className="md-stat-value">{datacard.movement}"</div></div>
                  <div className="md-stat-card"><div className="md-stat-label">APL</div><div className="md-stat-value">{datacard.apl}</div></div>
                  <div className="md-stat-card"><div className="md-stat-label">Save</div><div className="md-stat-value">{datacard.save}+</div></div>
                  <div className="md-stat-card md-stat-wounds"><div className="md-stat-label">Wounds</div><div className="md-stat-value">{datacard.wounds}</div></div>
                </div>
                {datacard.weapons.length > 0 && (
                  <div className="md-weapons">
                    <h3 className="md-section-title"><GoldIcon name="campaigns" size={16} /> Weapons</h3>
                    {datacard.weapons.map(w => (
                      <div key={w.name} className="md-weapon">
                        <div className="md-weapon-name">{w.type === 'ranged' ? '🔫' : '⚔️'} {w.name}</div>
                        <div className="md-weapon-stats">
                          <span>{w.attacks}A</span><span>BS {w.skill}+</span><span>{w.normalDmg}/{w.critDmg} dmg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="md-stat-grid">
                <div className="md-stat-card"><div className="md-stat-label">Quantity</div><div className="md-stat-value">{model.quantity}</div></div>
                <div className="md-stat-card"><div className="md-stat-label">System</div><div className="md-stat-value md-stat-text">{model.gameSystem}</div></div>
                <div className="md-stat-card"><div className="md-stat-label">Type</div><div className="md-stat-value md-stat-text">{model.unitType}</div></div>
                <div className="md-stat-card"><div className="md-stat-label">Status</div><div className="md-stat-value md-stat-text">{model.status}</div></div>
              </div>
            )}
            {/* Decorative skull divider */}
            <div className="md-divider"><img src="/decor/skull.jpg" alt="" /></div>
          </div>
        )}

        {tab === 'recipe' && (
          <div className="md-recipe-tab">
            <div className="md-section-header">
              <h3 className="md-section-title"><GoldIcon name="paints" size={16} /> Paint Recipe</h3>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowAddPaint(!showAddPaint)}>
                {showAddPaint ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Paint</>}
              </button>
            </div>
            {showAddPaint && (
              <div className="md-add-paint">
                <PaintAutocomplete value={paintSearch} onChange={setPaintSearch} onSelect={async (preset: PaintPreset) => {
                  const paint = await db.paints.where('name').equals(preset.name).first();
                  if (paint?.id) await addPaintToRecipe(paint.id);
                  else setPaintSearch(preset.name);
                }} />
                <input value={usageNote} onChange={e => setUsageNote(e.target.value)} placeholder="Usage (e.g. base coat armour)" className="md-usage-input" />
              </div>
            )}
            {linkedPaints.length === 0 ? (
              <div className="md-empty-tab">
                <img src="/decor/gear.png" alt="" className="md-empty-icon" />
                <p>No paints assigned yet</p>
              </div>
            ) : (
              <>
                <div className="md-recipe-list">
                  {linkedPaints.map(({ link, paint }) => (
                    <div key={link.id} className="md-recipe-item">
                      <div className="md-swatch" style={{ background: paint.hexColor || '#555' }} />
                      <div className="md-recipe-info">
                        <div className="md-recipe-name">{paint.name}</div>
                        <div className="md-recipe-note">{link.usageNote || `${paint.brand} · ${paint.type}`}</div>
                      </div>
                      <button className="btn-icon-sm" onClick={() => removePaint(link.id!)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
                <button className="btn btn-sm btn-ghost" style={{ marginTop: 12 }} onClick={() => {
                  const text = `Paint recipe for ${model.name} (${model.faction}):\n` + linkedPaints.map(({ link, paint }) => `• ${paint.name} (${paint.brand}) — ${link.usageNote || paint.type}`).join('\n');
                  navigator.clipboard.writeText(text);
                }}><Copy size={14} /> Copy recipe</button>
              </>
            )}
          </div>
        )}

        {tab === 'journal' && (
          <div className="md-journal-tab">
            <h3 className="md-section-title"><GoldIcon name="guides" size={16} /> Painting Journal</h3>
            <div className="md-journal-add">
              <textarea value={logText} onChange={e => setLogText(e.target.value)} placeholder="What did you work on?" rows={2} />
              <div className="md-journal-actions">
                <button className="btn btn-sm btn-ghost" onClick={() => logPhotoRef.current?.click()}><Camera size={14} /> Photo</button>
                <button className="btn btn-sm btn-primary" onClick={() => addLog()} disabled={!logText.trim()}><Plus size={14} /> Add</button>
                <input ref={logPhotoRef} type="file" accept="image/*" capture="environment" onChange={handleLogPhoto} style={{ display: 'none' }} />
              </div>
            </div>
            {logs.length === 0 ? (
              <div className="md-empty-tab">
                <img src="/decor/key.png" alt="" className="md-empty-icon" />
                <p>No entries yet. Track your progress here.</p>
              </div>
            ) : (
              <div className="md-journal-list">
                {logs.map(log => (
                  <div key={log.id} className="md-journal-entry">
                    <div className="md-journal-time">{new Date(log.timestamp).toLocaleDateString()}</div>
                    {log.text && <div className="md-journal-text">{log.text}</div>}
                    {log.photoUrl && <img src={log.photoUrl} alt="Progress" className="md-journal-photo" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'inspiration' && (
          <div className="md-inspo-tab">
            <h3 className="md-section-title"><Image size={16} /> Inspiration Board</h3>
            <p className="md-inspo-hint">Save reference images — right-click → Copy Image, then paste here.</p>
            <InspirationBoard modelId={modelId} />
          </div>
        )}
      </div>
    </div>
  );
}

function InspirationBoard({ modelId }: { modelId: number }) {
  const [images, setImages] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(`inspo-${modelId}`) || '[]'); } catch { return []; }
  });

  const save = (imgs: string[]) => { setImages(imgs); localStorage.setItem(`inspo-${modelId}`, JSON.stringify(imgs)); };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile(); if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => {
          const img = new window.Image();
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
      }
    }
  };

  return (
    <div className="md-inspo-board" onPaste={handlePaste} tabIndex={0}>
      {images.length === 0 ? (
        <div className="md-inspo-empty">
          <img src="/decor/heart.png" alt="" className="md-empty-icon" />
          <p>Paste images here (Ctrl+V)</p>
        </div>
      ) : (
        <div className="md-inspo-grid">
          {images.map((src, i) => (
            <div key={i} className="md-inspo-img">
              <img src={src} alt={`Ref ${i + 1}`} />
              <button className="md-inspo-remove" onClick={() => save(images.filter((_, j) => j !== i))}><X size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
