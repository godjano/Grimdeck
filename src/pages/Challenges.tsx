import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import PageBanner from '../components/PageBanner';
import GoldIcon from '../components/GoldIcon';

interface Challenge {
  id: string; title: string; desc: string; icon: string;
  check: (models: any[], logs: any[]) => boolean;
  month?: number; // 0=Jan, 11=Dec. undefined = evergreen
}

const MONTHLY: Challenge[] = [
  { id: 'jan', title: 'New Year, New Army', desc: 'Paint 3 models from a faction you haven\'t painted before', icon: 'star-shield2', month: 0, check: (m) => { const factions = [...new Set(m.filter(x => x.status === 'painted' || x.status === 'based').map(x => x.faction))]; return factions.length >= 2; } },
  { id: 'feb', title: 'Speed Painting February', desc: 'Paint 5 models this month', icon: 'lightning', month: 1, check: (m) => monthPainted(m) >= 5 },
  { id: 'mar', title: 'March of the Machines', desc: 'Paint a vehicle or walker', icon: 'gear', month: 2, check: (m) => m.some(x => (x.status === 'painted' || x.status === 'based') && (x.unitType === 'Vehicle' || x.unitType === 'Walker')) },
  { id: 'apr', title: 'April Technique Challenge', desc: 'Try a new technique — tag a model with one you haven\'t used', icon: 'brushes', month: 3, check: (m) => m.some(x => (x.techniques || []).length > 0) },
  { id: 'may', title: 'May the Pile Shrink', desc: 'Reduce your grey pile by 10 models', icon: 'skull', month: 4, check: (m) => monthPainted(m) >= 10 },
  { id: 'jun', title: 'June Character Month', desc: 'Paint a Character model', icon: 'crown', month: 5, check: (m) => m.some(x => (x.status === 'painted' || x.status === 'based') && x.unitType === 'Character') },
  { id: 'jul', title: 'Summer Batch Paint', desc: 'Paint 10 models of the same unit', icon: 'models', month: 6, check: (m) => monthPainted(m) >= 10 },
  { id: 'aug', title: 'Augmented August', desc: 'Paint something with metallics — tag it NMM or use metallic paints', icon: 'chalice', month: 7, check: (m) => m.some(x => (x.techniques || []).includes('NMM')) },
  { id: 'sep', title: 'September Showcase', desc: 'Add photos to 5 painted models', icon: 'lens', month: 8, check: (m) => m.filter(x => (x.status === 'painted' || x.status === 'based') && x.photoUrl).length >= 5 },
  { id: 'oct', title: 'Orktober', desc: 'Paint something green — Orks, Nurgle, Salamanders, anything!', icon: 'skull-bones', month: 9, check: (m) => monthPainted(m) >= 1 },
  { id: 'nov', title: 'Novembattle', desc: 'Play 3 games and log them in Battle Log', icon: 'campaigns', month: 10, check: () => false }, // checked separately
  { id: 'dec', title: 'Decembuild', desc: 'Build and prime 5 models — get ready for the new year', icon: 'hammer', month: 11, check: (m) => m.filter(x => x.status === 'primed').length >= 5 },
];

const EVERGREEN: Challenge[] = [
  { id: 'first_10', title: 'First Squad', desc: 'Paint 10 models total', icon: 'star-shield2', check: (m) => m.filter(x => x.status === 'painted' || x.status === 'based').length >= 10 },
  { id: 'multi_faction', title: 'Faction Hopper', desc: 'Paint models from 3 different factions', icon: 'cog-eye', check: (m) => new Set(m.filter(x => x.status === 'painted' || x.status === 'based').map(x => x.faction)).size >= 3 },
  { id: 'recipe_master', title: 'Recipe Master', desc: 'Create a recipe with 5+ steps on any model', icon: 'paints', check: () => false }, // checked via links
  { id: 'photographer', title: 'Photographer', desc: 'Add photos to 10 models', icon: 'lens', check: (m) => m.filter(x => x.photoUrl).length >= 10 },
  { id: 'centurion', title: 'Centurion', desc: 'Paint 100 models', icon: 'medal', check: (m) => m.filter(x => x.status === 'painted' || x.status === 'based').reduce((s, x) => s + x.quantity, 0) >= 100 },
  { id: 'technique_5', title: 'Technique Explorer', desc: 'Use 5 different techniques across your models', icon: 'brushes', check: (m) => new Set(m.flatMap(x => x.techniques || [])).size >= 5 },
  { id: 'no_grey', title: 'Grey Pile Slayer', desc: 'Have zero unpainted models', icon: 'chain-skull', check: (m) => m.length > 0 && m.every(x => x.status === 'painted' || x.status === 'based') },
];

function monthPainted(models: any[]) {
  const now = new Date();
  return models.filter(m => (m.status === 'painted' || m.status === 'based') && m.lastPaintedAt && new Date(m.lastPaintedAt).getMonth() === now.getMonth() && new Date(m.lastPaintedAt).getFullYear() === now.getFullYear()).reduce((s, m) => s + m.quantity, 0);
}

export default function Challenges() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const logs = useLiveQuery(() => db.paintingLogs.toArray()) ?? [];
  const [tab, setTab] = useState<'monthly' | 'evergreen'>('monthly');
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentChallenge = MONTHLY.find(c => c.month === currentMonth);
  const completed = JSON.parse(localStorage.getItem('grimdeck_challenges') || '[]') as string[];
  const markDone = (id: string) => { const next = [...new Set([...completed, id])]; localStorage.setItem('grimdeck_challenges', JSON.stringify(next)); };

  const challenges = tab === 'monthly' ? MONTHLY : EVERGREEN;

  return (
    <div>
      <PageBanner title="Painting Challenges" subtitle="Push your hobby further" icon="lightning" />

      {/* Current month highlight */}
      {currentChallenge && (
        <div style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.1), rgba(184,134,11,0.05))', border: '1px solid rgba(184,134,11,0.2)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>This Month's Challenge</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <GoldIcon name={currentChallenge.icon} size={32} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: "'Cinzel', serif", color: 'var(--gold)' }}>{currentChallenge.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{currentChallenge.desc}</div>
            </div>
            {(currentChallenge.check(models, logs) || completed.includes(currentChallenge.id)) ? (
              <span style={{ color: '#2ecc71', fontWeight: 700, fontSize: '0.85rem' }}>✓ Done!</span>
            ) : (
              <button className="btn btn-sm btn-ghost" onClick={() => { if (currentChallenge.check(models, logs)) markDone(currentChallenge.id); }}>Check</button>
            )}
          </div>
        </div>
      )}

      <div className="game-tabs" style={{ marginBottom: 16 }}>
        <button className={`game-tab ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>Monthly</button>
        <button className={`game-tab ${tab === 'evergreen' ? 'active' : ''}`} onClick={() => setTab('evergreen')}>Evergreen</button>
      </div>

      {challenges.map(c => {
        const done = c.check(models, logs) || completed.includes(c.id);
        return (
          <div key={c.id} className="card" style={{ cursor: 'default', opacity: done ? 0.6 : 1 }}>
            <GoldIcon name={c.icon} size={20} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.title} {done && <span style={{ color: '#2ecc71' }}>✓</span>}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.desc}{c.month !== undefined && <span> · {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][c.month]}</span>}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
