import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { PAINTING_GUIDES, ADVANCED_GUIDES, MORE_GUIDES } from '../db/painting-guides';
import GoldIcon from './GoldIcon';

// ─── Paint Timer ───
export function PaintTimer() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(() => Number(localStorage.getItem('grimdeck_timer') || '0'));
  const [modelName, setModelName] = useState(localStorage.getItem('grimdeck_timer_model') || '');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => { const n = s + 1; localStorage.setItem('grimdeck_timer', String(n)); return n; });
      }, 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const fmt = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
  const reset = () => { setSeconds(0); setRunning(false); localStorage.setItem('grimdeck_timer', '0'); };

  return (
    <div className="tool-card">
      <h3><GoldIcon name="winged-hour" size={18} /> Paint Timer</h3>
      <input value={modelName} onChange={e => { setModelName(e.target.value); localStorage.setItem('grimdeck_timer_model', e.target.value); }} placeholder="What are you painting?" className="tool-input" />
      <div className="timer-display">{fmt(seconds)}</div>
      <div className="tool-actions">
        <button className={`btn btn-sm ${running ? 'btn-danger' : 'btn-primary'}`} onClick={() => setRunning(!running)}>{running ? '⏸ Pause' : '▶ Start'}</button>
        <button className="btn btn-sm btn-ghost" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

// ─── Random Picker ───
export function RandomPicker() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const nav = useNavigate();
  const [picked, setPicked] = useState<typeof models[0] | null>(null);
  const [reason, setReason] = useState('');

  const unpainted = models.filter(m => !m.wishlist && ['unbuilt', 'built', 'primed', 'wip'].includes(m.status));

  const pick = () => {
    if (unpainted.length === 0) return;
    // Weight by: age in pile (older = higher), WIP priority, faction balance
    const now = Date.now();
    const factionCounts: Record<string, number> = {};
    for (const m of models.filter(x => x.status === 'painted' || x.status === 'based')) factionCounts[m.faction] = (factionCounts[m.faction] || 0) + 1;

    const weighted = unpainted.map(m => {
      const ageDays = Math.max(1, (now - (m.createdAt || now)) / 86400000);
      const ageWeight = Math.min(ageDays / 30, 5); // up to 5x for 5+ months old
      const wipBonus = m.status === 'wip' ? 3 : m.status === 'primed' ? 2 : m.status === 'built' ? 1.5 : 1;
      const factionPainted = factionCounts[m.faction] || 0;
      const factionBonus = factionPainted < 3 ? 2 : 1; // boost underrepresented factions
      return { model: m, weight: ageWeight * wipBonus * factionBonus, ageDays: Math.round(ageDays) };
    }).sort((a, b) => b.weight - a.weight);

    // Pick from top 5 weighted
    const top = weighted.slice(0, Math.min(5, weighted.length));
    const totalWeight = top.reduce((s, w) => s + w.weight, 0);
    let r = Math.random() * totalWeight;
    let choice = top[0];
    for (const w of top) { r -= w.weight; if (r <= 0) { choice = w; break; } }

    setPicked(choice.model);
    const reasons = [];
    if (choice.model.status === 'wip') reasons.push("it's already in progress");
    else if (choice.ageDays > 60) reasons.push(`it's been in the pile for ${choice.ageDays} days`);
    if ((factionCounts[choice.model.faction] || 0) < 3) reasons.push(`your ${choice.model.faction} need more painted models`);
    if (choice.model.status === 'primed') reasons.push("it's primed and ready to go");
    setReason(reasons.length > 0 ? reasons.join(' and ') : 'random pick!');
  };

  return (
    <div className="tool-card">
      <h3><GoldIcon name="target" size={18} /> What Should I Paint?</h3>
      <p className="settings-desc">Smart pick from your {unpainted.length} unpainted models — weighted by pile age, progress, and faction balance.</p>
      <button className="btn btn-primary" onClick={pick} disabled={unpainted.length === 0}>Pick for me!</button>
      {picked && (
        <div className="picker-result" onClick={() => nav(`/model/${picked.id}`)}>
          <div className="picker-name">{picked.name}</div>
          <div className="picker-meta">{picked.faction} · {picked.quantity} models · {picked.status}</div>
          {reason && <div style={{ fontSize: '0.72rem', color: 'var(--gold)', marginTop: 4, fontStyle: 'italic' }}>Because {reason}</div>}
          <span className="picker-go">Open →</span>
        </div>
      )}
    </div>
  );
}

// ─── Shopping List ───
export function ShoppingList() {
  const paints = useLiveQuery(() => db.paints.toArray()) ?? [];
  const ownedNames = new Set(paints.map(p => p.name.toLowerCase()));
  const allGuides = [...PAINTING_GUIDES, ...ADVANCED_GUIDES, ...MORE_GUIDES];
  const [selectedGuide, setSelectedGuide] = useState('');

  const guide = allGuides.find(g => g.id === selectedGuide);
  const needed = guide ? guide.steps.flatMap(s => s.paints).filter(p => !ownedNames.has(p.name.toLowerCase())) : [];
  const unique = [...new Map(needed.map(p => [p.name, p])).values()];

  const copyList = () => {
    const text = `Shopping list for "${guide?.title}":\n` + unique.map(p => `• ${p.name}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="tool-card">
      <h3>🛒 Shopping List</h3>
      <p className="settings-desc">See which paints you need to buy for a painting guide.</p>
      <select value={selectedGuide} onChange={e => setSelectedGuide(e.target.value)} className="tool-input">
        <option value="">Select a painting guide...</option>
        {allGuides.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
      </select>
      {guide && (
        <div style={{ marginTop: 12 }}>
          {unique.length === 0 ? (
            <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>✓ You own all the paints for this guide!</p>
          ) : (
            <>
              <p className="settings-desc">{unique.length} paints needed:</p>
              {unique.map(p => (
                <div key={p.name} className="recipe-item" style={{ marginBottom: 4 }}>
                  <div className="swatch" style={{ width: 24, height: 24, background: p.hex }} />
                  <div className="recipe-paint-name">{p.name}</div>
                </div>
              ))}
              <button className="btn btn-sm btn-ghost" onClick={copyList} style={{ marginTop: 8 }}>Copy list</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CSV Import ───
export function CsvImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) { setStatus('❌ File is empty'); return; }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const nameIdx = headers.findIndex(h => h === 'name' || h === 'model');
    const factionIdx = headers.findIndex(h => h === 'faction' || h === 'army');
    const qtyIdx = headers.findIndex(h => h === 'quantity' || h === 'qty');
    const statusIdx = headers.findIndex(h => h === 'status');

    if (nameIdx === -1) { setStatus('❌ CSV must have a "name" column'); return; }

    let count = 0;
    for (const line of lines.slice(1)) {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const name = cols[nameIdx];
      if (!name) continue;
      await db.models.add({
        name, faction: cols[factionIdx] || 'Unknown', unitType: '', quantity: Number(cols[qtyIdx]) || 1,
        status: (cols[statusIdx] as any) || 'unbuilt', notes: '', photoUrl: '', createdAt: Date.now(),
        manufacturer: 'Games Workshop', gameSystem: 'Warhammer 40K', countsAs: '', pricePaid: 0, wishlist: false, points: 0, forceOrg: 'Other',
      });
      count++;
    }
    setStatus(`Imported ${count} models!`);
  };

  return (
    <div className="tool-card">
      <h3>📄 CSV Import</h3>
      <p className="settings-desc">Import models from a spreadsheet. CSV must have a "name" column. Optional: faction, quantity, status.</p>
      <button className="btn btn-sm btn-primary" onClick={() => fileRef.current?.click()}>Choose CSV File</button>
      <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
      {status && <p style={{ marginTop: 8, fontSize: '0.85rem' }}>{status}</p>}
    </div>
  );
}

// ─── Share Collection ───
export function ShareCollection() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const [copied, setCopied] = useState(false);

  const share = () => {
    const factions: Record<string, number> = {};
    models.filter(m => !m.wishlist).forEach(m => { factions[m.faction] = (factions[m.faction] || 0) + m.quantity; });
    const total = models.filter(m => !m.wishlist).reduce((s, m) => s + m.quantity, 0);
    const painted = models.filter(m => ['painted', 'based'].includes(m.status)).reduce((s, m) => s + m.quantity, 0);
    const pts = models.filter(m => !m.wishlist).reduce((s, m) => s + (m.points || 0), 0);

    const text = [
      `My Grimdeck Collection`,
      `${total} models · ${painted} painted · ${pts}pts`,
      '',
      ...Object.entries(factions).sort((a, b) => b[1] - a[1]).map(([f, n]) => `${f}: ${n} models`),
      '',
      'Tracked with Grimdeck — grimdeck.app',
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tool-card">
      <h3>📤 Share Collection</h3>
      <p className="settings-desc">Copy a summary of your collection to share on Reddit, Discord, or with friends.</p>
      <button className="btn btn-sm btn-primary" onClick={share}>{copied ? '✓ Copied!' : 'Copy Summary'}</button>
    </div>
  );
}

// ─── Glossary ───
export function Glossary() {
  const terms = [
    { term: 'Base coat', def: 'The first solid layer of colour applied over primer.' },
    { term: 'Wash / Shade', def: 'Thin, dark paint that flows into recesses to create shadows.' },
    { term: 'Drybrush', def: 'Wiping most paint off the brush, then dragging across raised surfaces to highlight texture.' },
    { term: 'Edge highlight', def: 'Painting thin lines of lighter colour along armour edges.' },
    { term: 'Contrast paint', def: 'Special paint that acts as base, shade, and highlight in one coat over light primer.' },
    { term: 'Zenithal', def: 'Priming technique: black all over, then white from above, creating a natural light map.' },
    { term: 'NMM', def: 'Non-Metallic Metal — painting the illusion of metal using regular matte paints.' },
    { term: 'OSL', def: 'Object Source Lighting — painting the glow effect from a light source on the model.' },
    { term: 'Wet palette', def: 'A palette that keeps paints wet longer. DIY: tupperware + wet paper towel + baking paper.' },
    { term: 'Primer', def: 'A special undercoat that helps paint stick to plastic. Always prime before painting.' },
    { term: 'Thin your paints', def: 'Mix paint with water (~1:1) for smoother coverage. Two thin coats > one thick coat.' },
    { term: 'Grey pile / Pile of shame', def: 'Unpainted models. Every hobbyist has one.' },
    { term: 'Kitbash', def: 'Combining parts from different kits to create a unique model.' },
    { term: 'Proxy', def: 'Using one model to represent a different unit in a game.' },
    { term: 'APL', def: 'Action Point Limit — how many actions a Kill Team operative can take per turn.' },
    { term: 'Force Org', def: 'Force Organisation — how units are categorised: HQ, Troops, Elites, Fast Attack, Heavy Support.' },
    { term: 'Points', def: 'A value assigned to each unit. Armies are built to a points limit (e.g. 2000pts).' },
    { term: 'Battleline', def: 'Core troops that form the backbone of your army. Required in most lists.' },
    { term: 'Kill Team', def: 'A small-scale skirmish game using 5-10 models per side.' },
    { term: 'Combat Patrol', def: 'A starter box containing a small army, designed for the Combat Patrol game mode.' },
    { term: 'Wet palette', def: 'A palette that keeps paints wet longer. DIY: tupperware + wet paper towel + baking paper.' },
    { term: 'Stippling', def: 'Dabbing paint vertically with the brush tip to create texture. Great for rust and organic surfaces.' },
    { term: 'Feathering', def: 'Creating blends by applying thin parallel lines of progressively lighter paint.' },
    { term: 'Glazing', def: 'Applying extremely thin transparent paint layers to tint or smooth colour transitions.' },
    { term: 'Airbrush', def: 'A tool that sprays paint using compressed air. Great for smooth gradients and priming.' },
    { term: 'Varnish', def: 'A protective clear coat applied after painting. Matte, satin, or gloss finish.' },
    { term: 'Sprue', def: 'The plastic frame that model parts are attached to in the box. You clip parts off the sprue.' },
    { term: 'Mould line', def: 'A thin line on the model where the two halves of the mould met. Scrape off before priming.' },
    { term: 'Pinning', def: 'Drilling holes and inserting wire to strengthen joints on heavy or metal models.' },
    { term: 'Green stuff', def: 'Two-part epoxy putty used to sculpt details, fill gaps, or convert models.' },
    { term: 'Detachment', def: 'A structured way to organise your army with specific rules and bonuses.' },
    { term: 'Turning Point', def: 'A round in Kill Team. Each game has 4 turning points.' },
    { term: 'Operative', def: 'A single model in Kill Team. Each has its own datacard with stats and abilities.' },
    { term: 'Battleline', def: 'Core troops that form the backbone of your army. Required in most lists.' },
  ];

  const [search, setSearch] = useState('');
  const filtered = terms.filter(t => !search || t.term.toLowerCase().includes(search.toLowerCase()) || t.def.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="tool-card">
      <h3>📚 Glossary</h3>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search terms..." className="tool-input" />
      <div className="glossary-list">
        {filtered.map(t => (
          <div key={t.term} className="glossary-item">
            <span className="glossary-term">{t.term}</span>
            <span className="glossary-def">{t.def}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

