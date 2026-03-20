import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Paint } from '../types';

type HarmonyType = 'complementary' | 'triadic' | 'analogous' | 'split-complementary' | 'tetradic';
import { PAINTING_GUIDES, ADVANCED_GUIDES, MORE_GUIDES, type PaintingGuide } from '../db/painting-guides';

type Tab = 'guides' | 'wheel' | 'builder' | 'auto' | 'inspiration';

// ─── Colour Math ───
function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function getHarmony(baseHex: string, type: HarmonyType): string[] {
  const [h, s, l] = hexToHsl(baseHex);
  switch (type) {
    case 'complementary': return [baseHex, hslToHex((h + 180) % 360, s, l)];
    case 'triadic': return [baseHex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
    case 'analogous': return [hslToHex((h - 30 + 360) % 360, s, l), baseHex, hslToHex((h + 30) % 360, s, l)];
    case 'split-complementary': return [baseHex, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)];
    case 'tetradic': return [baseHex, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)];
  }
}

function findClosestPaint(paints: Paint[], hex: string): Paint | null {
  if (!paints.length) return null;
  const [r1, g1, b1] = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  return paints.reduce((best, p) => {
    if (!p.hexColor) return best;
    const [r2, g2, b2] = [parseInt(p.hexColor.slice(1, 3), 16), parseInt(p.hexColor.slice(3, 5), 16), parseInt(p.hexColor.slice(5, 7), 16)];
    const d = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
    if (!best) return { paint: p, dist: d };
    return d < best.dist ? { paint: p, dist: d } : best;
  }, null as { paint: Paint; dist: number } | null)?.paint || null;
}

// ─── Instagram Inspiration Hashtags ───
const INSTA_TAGS = [
  { tag: 'warhammer40k', label: 'Warhammer 40K' },
  { tag: 'killteam', label: 'Kill Team' },
  { tag: 'minipainting', label: 'Mini Painting' },
  { tag: 'paintingwarhammer', label: 'Painting Warhammer' },
  { tag: 'warhammercommunity', label: 'Community' },
  { tag: 'spacemarines', label: 'Space Marines' },
  { tag: 'orks40k', label: 'Orks' },
  { tag: 'necrons', label: 'Necrons' },
  { tag: 'tyranids', label: 'Tyranids' },
  { tag: 'aeldari', label: 'Aeldari' },
  { tag: 'deathguard', label: 'Death Guard' },
  { tag: 'adeptusmechanicus', label: 'Ad Mech' },
  { tag: 'custodes', label: 'Custodes' },
  { tag: 'greyknights', label: 'Grey Knights' },
  { tag: 'thousandsons', label: 'Thousand Sons' },
  { tag: 'contrastpaint', label: 'Contrast Paint' },
  { tag: 'speedpaint', label: 'Speed Paint' },
  { tag: 'nmm', label: 'NMM (Non-Metallic Metal)' },
  { tag: 'oslfreehand', label: 'OSL & Freehand' },
  { tag: 'wip', label: 'Work in Progress' },
];

export default function PaintSuggestions() {
  const paints = useLiveQuery(() => db.paints.toArray()) ?? [];
  const [tab, setTab] = useState<Tab>('guides');
  const [baseColor, setBaseColor] = useState('#c62828');
  const [harmony, setHarmony] = useState<HarmonyType>('triadic');
  const [customScheme, setCustomScheme] = useState<string[]>(['#c62828', '#f5c518', '#1a1a1a']);
  const [schemeName, setSchemeName] = useState('');

  const harmonyColors = getHarmony(baseColor, harmony);

  const addColorToScheme = () => {
    if (customScheme.length < 8) setCustomScheme([...customScheme, '#888888']);
  };

  const removeColor = (i: number) => {
    if (customScheme.length > 2) setCustomScheme(customScheme.filter((_, j) => j !== i));
  };

  const updateSchemeColor = (i: number, hex: string) => {
    const next = [...customScheme];
    next[i] = hex;
    setCustomScheme(next);
  };

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 48 }}>
        <h2>💡 Paint Suggestions</h2>
      </div>

      <div className="game-tabs" style={{ marginBottom: 24 }}>
        {([['guides', '📖 Guides'], ['wheel', '🎡 Colour Wheel'], ['builder', '🔧 Scheme Builder'], ['auto', '⚡ Auto Suggest'], ['inspiration', '📸 Inspiration']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} className={`game-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{label}</button>
        ))}
      </div>

      {/* ─── Painting Guides ─── */}
      {tab === 'guides' && <GuidesTab paints={paints} />}

      {/* ─── Colour Wheel ─── */}
      {tab === 'wheel' && (
        <div>
          <div className="settings-section">
            <h3 className="settings-title">Colour Harmony Generator</h3>
            <p className="settings-desc">Pick a base colour and generate harmonious palettes using colour theory.</p>

            <div className="wheel-controls">
              <div className="wheel-picker">
                <label className="field-label">Base Colour</label>
                <div className="color-picker-row">
                  <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)} />
                  <input value={baseColor} onChange={e => setBaseColor(e.target.value)} style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontFamily: 'monospace' }} />
                </div>
              </div>
              <div className="harmony-select">
                <label className="field-label">Harmony Type</label>
                <div className="harmony-buttons">
                  {(['complementary', 'triadic', 'analogous', 'split-complementary', 'tetradic'] as HarmonyType[]).map(h => (
                    <button key={h} className={`btn btn-sm ${harmony === h ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setHarmony(h)}>{h}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="harmony-result">
              <div className="harmony-swatches">
                {harmonyColors.map((c, i) => (
                  <div key={i} className="harmony-swatch-card">
                    <div className="harmony-swatch-big" style={{ background: c }} />
                    <div className="harmony-swatch-hex">{c}</div>
                    {paints.length > 0 && (
                      <div className="harmony-match">
                        Closest: <strong>{findClosestPaint(paints, c)?.name || 'N/A'}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Scheme Builder ─── */}
      {tab === 'builder' && (
        <div>
          <div className="settings-section">
            <h3 className="settings-title">Custom Scheme Builder</h3>
            <p className="settings-desc">Build your own colour scheme. Pick colours and see which paints you own match closest.</p>

            <div className="field" style={{ maxWidth: 300, marginBottom: 16 }}>
              <label>Scheme Name</label>
              <input value={schemeName} onChange={e => setSchemeName(e.target.value)} placeholder="e.g. Ultramarines 5th Company" />
            </div>

            <div className="scheme-builder-grid">
              {customScheme.map((c, i) => (
                <div key={i} className="builder-swatch-card">
                  <input type="color" value={c} onChange={e => updateSchemeColor(i, e.target.value)} className="builder-color-input" />
                  <div className="builder-swatch-info">
                    <div className="builder-swatch-hex">{c}</div>
                    {paints.length > 0 && (
                      <div className="builder-match">→ {findClosestPaint(paints, c)?.name || 'No match'}</div>
                    )}
                  </div>
                  {customScheme.length > 2 && (
                    <button className="builder-remove" onClick={() => removeColor(i)}>✕</button>
                  )}
                </div>
              ))}
              {customScheme.length < 8 && (
                <button className="builder-add" onClick={addColorToScheme}>+ Add Colour</button>
              )}
            </div>

            <div className="scheme-preview">
              <div className="scheme-preview-label">{schemeName || 'Preview'}</div>
              <div className="scheme-preview-bar">
                {customScheme.map((c, i) => (
                  <div key={i} style={{ flex: 1, background: c, height: 48 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Auto Suggest ─── */}
      {tab === 'auto' && (
        <div>
          <div className="settings-section">
            <h3 className="settings-title">Auto Suggestions</h3>
            <p className="settings-desc">Schemes generated from your {paints.length} owned paints.</p>
            {paints.length < 2 ? (
              <div className="empty"><span className="empty-icon">🎨</span><p className="empty-text">Add at least 2 paints to get suggestions.</p></div>
            ) : (
              <AutoSchemes paints={paints} />
            )}
          </div>
        </div>
      )}

      {/* ─── Inspiration ─── */}
      {tab === 'inspiration' && (
        <div>
          <div className="settings-section">
            <h3 className="settings-title">📸 Instagram Inspiration</h3>
            <p className="settings-desc">Browse the best miniature painting on Instagram. Click a tag to open it in a new tab.</p>
            <div className="insta-grid">
              {INSTA_TAGS.map(t => (
                <a key={t.tag} href={`https://www.instagram.com/explore/tags/${t.tag}/`} target="_blank" rel="noreferrer" className="insta-card">
                  <div className="insta-tag">#{t.tag}</div>
                  <div className="insta-label">{t.label}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-title">🎥 Recommended Painters</h3>
            <p className="settings-desc">Top miniature painting accounts to follow for inspiration and tutorials.</p>
            <div className="insta-grid">
              {[
                { handle: 'warhammer', label: 'Official Warhammer' },
                { handle: 'darren_latham_miniature_painting', label: 'Darren Latham' },
                { handle: 'trovarion', label: 'Trovarion' },
                { handle: 'miniaturesden', label: 'Miniatures Den' },
                { handle: 'squidmar', label: 'Squidmar' },
                { handle: 'ninjon', label: 'Ninjon' },
                { handle: 'juanhiblanco', label: 'Juan Hi Blanco' },
                { handle: 'flameonminiatures', label: 'Flame On' },
                { handle: 'richardgray_art', label: 'Richard Gray' },
                { handle: 'zatcaskagoon', label: 'Zatcaskagoon' },
                { handle: 'plasticcraic', label: 'Plastic Craic' },
                { handle: 'thearmypainter', label: 'Army Painter' },
              ].map(p => (
                <a key={p.handle} href={`https://www.instagram.com/${p.handle}/`} target="_blank" rel="noreferrer" className="insta-card painter-card">
                  <div className="insta-tag">@{p.handle}</div>
                  <div className="insta-label">{p.label}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Auto-generated schemes from owned paints
function AutoSchemes({ paints }: { paints: Paint[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const byType = (types: string[]) => paints.filter(p => types.includes(p.type));
  const bases = byType(['base']);
  const shades = byType(['shade']);
  const contrasts = byType(['contrast']);
  const all = paints.filter(p => p.hexColor);

  const schemes: { name: string; desc: string; steps: { label: string; paint: string; color: string }[] }[] = [];

  // Classic
  for (const base of bases.slice(0, 6)) {
    const shade = findClosestPaint(shades, base.hexColor);
    const lighter = all.find(p => p.id !== base.id && parseInt(p.hexColor?.slice(1, 3) || '0', 16) > parseInt(base.hexColor?.slice(1, 3) || 'ff', 16));
    if (shade) schemes.push({ name: `${base.name} Classic`, desc: 'Base → shade → highlight', steps: [
      { label: 'Base coat', paint: base.name, color: base.hexColor },
      { label: 'Shade', paint: shade.name, color: shade.hexColor },
      ...(lighter ? [{ label: 'Highlight', paint: lighter.name, color: lighter.hexColor }] : []),
    ]});
  }

  // Contrast
  for (const c of contrasts.slice(0, 4)) {
    const primer = findClosestPaint(bases, '#ffffff');
    schemes.push({ name: `Quick ${c.name}`, desc: 'Speed paint over primer', steps: [
      ...(primer ? [{ label: 'Prime', paint: primer.name, color: primer.hexColor }] : []),
      { label: 'Contrast', paint: c.name, color: c.hexColor },
    ]});
  }

  // Metallic
  const metals = all.filter(p => ['silver', 'gold', 'copper', 'bronze', 'steel', 'metal', 'iron'].some(m => p.name.toLowerCase().includes(m)));
  for (const m of metals.slice(0, 3)) {
    const shade = shades.length ? findClosestPaint(shades, m.hexColor) || shades[0] : null;
    schemes.push({ name: `${m.name} Armour`, desc: 'Metallic + shade', steps: [
      { label: 'Metallic base', paint: m.name, color: m.hexColor },
      ...(shade ? [{ label: 'Shade', paint: shade.name, color: shade.hexColor }] : []),
    ]});
  }

  return schemes.length === 0 ? (
    <p className="settings-desc">Add more paint types (bases, shades, layers) for better suggestions.</p>
  ) : (
    <div>
      <div className="results-count">{schemes.length} schemes</div>
      {schemes.map((s, i) => (
        <div key={i} className="scheme-card" onClick={() => setExpanded(expanded === i ? null : i)}>
          <div className="scheme-header">
            <div className="scheme-swatches">
              {s.steps.map((st, j) => <div key={j} className="scheme-swatch" style={{ background: st.color }} title={st.paint} />)}
            </div>
            <div className="card-body">
              <div className="card-title">{s.name}</div>
              <div className="card-sub">{s.desc} · {s.steps.length} steps</div>
            </div>
            <span className="scheme-toggle">{expanded === i ? '▲' : '▼'}</span>
          </div>
          {expanded === i && (
            <div className="scheme-steps">
              {s.steps.map((st, j) => (
                <div key={j} className="scheme-step">
                  <span className="scheme-step-num">{j + 1}</span>
                  <div className="scheme-swatch-sm" style={{ background: st.color }} />
                  <div><div className="scheme-step-label">{st.label}</div><div className="scheme-step-paint">{st.paint}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GuidesTab({ paints }: { paints: Paint[] }) {
  const [selectedGuide, setSelectedGuide] = useState<PaintingGuide | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [diffFilter, setDiffFilter] = useState('');
  const allGuides = [...PAINTING_GUIDES, ...ADVANCED_GUIDES, ...MORE_GUIDES];
  const filtered = diffFilter ? allGuides.filter(g => g.difficulty === diffFilter) : allGuides;

  if (selectedGuide) {
    const step = selectedGuide.steps[activeStep];
    const totalSteps = selectedGuide.steps.length;

    return (
      <div>
        <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedGuide(null); setActiveStep(0); }}>← Back to Guides</button>

        <div className="guide-header">
          <h3 className="guide-title">{selectedGuide.title}</h3>
          <div className="guide-meta">{selectedGuide.faction} · {selectedGuide.difficulty} · ~{selectedGuide.timeEstimate}</div>
        </div>

        {/* Progress bar */}
        <div className="guide-progress">
          <div className="guide-progress-bar">
            <div className="guide-progress-fill" style={{ width: `${((activeStep + 1) / totalSteps) * 100}%` }} />
          </div>
          <div className="guide-progress-text">Step {activeStep + 1} of {totalSteps}</div>
        </div>

        {/* Step dots */}
        <div className="guide-dots">
          {selectedGuide.steps.map((_s, i) => (
            <button key={i} className={`guide-dot ${i === activeStep ? 'active' : i < activeStep ? 'done' : ''}`} onClick={() => setActiveStep(i)}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current step */}
        <div className="guide-step-card">
          <div className="guide-step-header">
            <span className="guide-step-technique">{step.technique}</span>
            <span className="guide-step-area">📍 {step.area}</span>
          </div>
          <h4 className="guide-step-title">{step.title}</h4>

          <div className="guide-step-paints">
            {step.paints.map((p, i) => {
              const owned = paints.find(op => op.name.toLowerCase() === p.name.toLowerCase());
              return (
                <div key={i} className="guide-paint-chip">
                  <div className="guide-paint-swatch" style={{ background: p.hex }} />
                  <div>
                    <div className="guide-paint-name">{p.name}</div>
                    <div className={`guide-paint-owned ${owned ? 'yes' : 'no'}`}>{owned ? '✓ You own this' : '✕ Not in collection'}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="guide-step-instructions">{step.instructions}</div>

          {step.tip && (
            <div className="guide-step-tip">💡 <strong>Tip:</strong> {step.tip}</div>
          )}
        </div>

        {/* Navigation */}
        <div className="guide-nav">
          <button className="btn btn-ghost" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}>← Previous</button>
          {activeStep < totalSteps - 1 ? (
            <button className="btn btn-primary" onClick={() => setActiveStep(activeStep + 1)}>Next Step →</button>
          ) : (
            <button className="btn btn-primary" onClick={() => { setSelectedGuide(null); setActiveStep(0); }}>🏆 Complete!</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="settings-section">
        <h3 className="settings-title">📖 Step-by-Step Painting Guides</h3>
        <p className="settings-desc">Detailed tutorials with techniques, paints, and tips. Checks which paints you already own.</p>
        <div className="harmony-buttons" style={{ marginBottom: 16 }}>
          <button className={`btn btn-sm ${!diffFilter ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDiffFilter('')}>All ({allGuides.length})</button>
          <button className={`btn btn-sm ${diffFilter === 'beginner' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDiffFilter('beginner')}>🟢 Beginner</button>
          <button className={`btn btn-sm ${diffFilter === 'intermediate' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDiffFilter('intermediate')}>🟠 Intermediate</button>
          <button className={`btn btn-sm ${diffFilter === 'advanced' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDiffFilter('advanced')}>🔴 Advanced</button>
        </div>
        <div className="guides-grid">
          {filtered.map(g => {
            const ownedCount = g.steps.reduce((s, step) => s + step.paints.filter(p => paints.some(op => op.name.toLowerCase() === p.name.toLowerCase())).length, 0);
            const totalPaints = g.steps.reduce((s, step) => s + step.paints.length, 0);
            return (
              <div key={g.id} className="guide-card" onClick={() => setSelectedGuide(g)}>
                <div className="guide-card-swatches">
                  {g.steps.slice(0, 6).map((s, i) => s.paints[0] && (
                    <div key={i} className="guide-card-swatch" style={{ background: s.paints[0].hex }} />
                  ))}
                </div>
                <div className="guide-card-title">{g.title}</div>
                <div className="guide-card-meta">{g.faction} · {g.steps.length} steps · ~{g.timeEstimate}</div>
                <div className="guide-card-footer">
                  <span className={`guide-diff diff-${g.difficulty}`}>{g.difficulty}</span>
                  <span className="guide-owned">{ownedCount}/{totalPaints} paints owned</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
