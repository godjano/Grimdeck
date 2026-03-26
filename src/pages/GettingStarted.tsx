import GoldIcon from '../components/GoldIcon';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { ALL_MODEL_PRESETS } from '../db/model-presets';

const STARTER_SETS: Record<string, string[]> = {
  'Space Marines Combat Patrol': ['Captain in Terminator Armour (CP)', 'Infernus Squad (CP)', 'Terminator Squad (CP)', 'Impulsor (CP)'],
  'Tyranids Combat Patrol': ['Winged Tyranid Prime (CP)', 'Termagants (CP)', 'Von Ryan Leapers (CP)', 'Psychophage (CP)'],
  'Necrons Combat Patrol': ['Overlord (CP)', 'Necron Warriors (CP)', 'Immortals (CP)', 'Skorpekh Destroyers (CP)', 'Canoptek Scarab Swarms (CP)', 'Canoptek Doomstalker (CP)'],
  'Orks Combat Patrol': ['Warboss (CP)', 'Boyz (CP)', 'Deffkoptas (CP)', 'Deff Dread (CP)'],
  'Death Guard Combat Patrol': ['Typhus (CP)', 'Plague Marines (CP)', 'Poxwalkers (CP)', 'Biologus Putrifier (CP)'],
};

export default function GettingStarted() {
  const [step, setStep] = useState(0);
  const [selectedSet, setSelectedSet] = useState('');
  const nav = useNavigate();

  const addSet = async () => {
    const names = STARTER_SETS[selectedSet] || [];
    for (const name of names) {
      const preset = ALL_MODEL_PRESETS.find(p => p.name === name);
      if (preset) {
        await db.models.add({ name: preset.name, faction: preset.faction, unitType: preset.unitType, quantity: preset.defaultQty, status: 'unbuilt', notes: '', photoUrl: '', createdAt: Date.now(), manufacturer: 'Games Workshop', gameSystem: 'Warhammer 40K', countsAs: '', pricePaid: 0, wishlist: false, points: preset.points || 0, forceOrg: preset.forceOrg || 'Other' });
      }
    }
  };

  return (
    <div>
      <section className="hero" style={{ padding: '60px 0 40px' }}>
        <p className="hero-eyebrow">Welcome to Grimdeck</p>
        <h1 className="hero-title">Let's get you<br /><span>started</span></h1>
      </section>

      {step === 0 && (
        <div className="wizard-card">
          <div className="wizard-step-num">1 of 3</div>
          <h3>What did you get?</h3>
          <p className="settings-desc">Select your starter set and we'll add all the models for you.</p>
          <div className="wizard-options">
            {Object.keys(STARTER_SETS).map(s => (
              <button key={s} className={`wizard-option ${selectedSet === s ? 'selected' : ''}`} onClick={() => setSelectedSet(s)}>{s}</button>
            ))}
            <button className={`wizard-option ${selectedSet === 'other' ? 'selected' : ''}`} onClick={() => setSelectedSet('other')}>Something else</button>
          </div>
          <button className="btn btn-primary btn-lg" style={{ marginTop: 20 }} onClick={() => { if (selectedSet && selectedSet !== 'other') addSet(); setStep(1); }} disabled={!selectedSet}>
            Next →
          </button>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 8 }}>Just want to explore first?</p>
            <button className="btn btn-ghost" onClick={async () => {
              const demo = [
                { name: 'Intercessor Sergeant', faction: 'Ultramarines', status: 'painted', qty: 1, pts: 160 },
                { name: 'Assault Intercessors', faction: 'Blood Angels', status: 'wip', qty: 5, pts: 160 },
                { name: 'Terminators', faction: 'Dark Angels', status: 'primed', qty: 5, pts: 200 },
                { name: 'Plague Marines', faction: 'Death Guard', status: 'built', qty: 5, pts: 180 },
                { name: 'Necron Warriors', faction: 'Necrons', status: 'unbuilt', qty: 10, pts: 120 },
                { name: 'Hive Tyrant', faction: 'Tyranids', status: 'wip', qty: 1, pts: 250 },
                { name: 'Alpharius', faction: 'Alpha Legion', status: 'painted', qty: 1, pts: 0 },
                { name: 'Leman Russ Battle Tank', faction: 'Astra Militarum', status: 'based', qty: 1, pts: 195 },
              ];
              for (const d of demo) {
                await db.models.add({ name: d.name, faction: d.faction, unitType: 'Infantry', quantity: d.qty, status: d.status as any, notes: 'Demo', photoUrl: '', createdAt: Date.now() - Math.random() * 86400000 * 30, manufacturer: 'Games Workshop', gameSystem: 'Warhammer 40K', countsAs: '', pricePaid: 0, wishlist: false, points: d.pts, forceOrg: 'Other' });
              }
              const paints = [
                { name: 'Macragge Blue', brand: 'Citadel', range: 'Base', type: 'base', hex: '#0D407F' },
                { name: 'Retributor Armour', brand: 'Citadel', range: 'Base', type: 'base', hex: '#C39E3A' },
                { name: 'Nuln Oil', brand: 'Citadel', range: 'Shade', type: 'shade', hex: '#14100E' },
                { name: 'Mephiston Red', brand: 'Citadel', range: 'Base', type: 'base', hex: '#9A1115' },
                { name: 'Death Guard Green', brand: 'Citadel', range: 'Base', type: 'base', hex: '#6D8537' },
              ];
              for (const p of paints) await db.paints.add({ ...p, owned: true, quantity: 1, notes: '' } as any);
              nav('/');
            }}>Load demo collection (8 models + 5 paints)</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="wizard-card">
          <div className="wizard-step-num">2 of 3</div>
          <h3>Do you have paints?</h3>
          <p className="settings-desc">If you have a starter paint set, we can add those too.</p>
          <div className="wizard-options">
            <button className="wizard-option" onClick={async () => {
              const starterPaints = ['Abaddon Black', 'Corax White', 'Mephiston Red', 'Macragge Blue', 'Retributor Armour', 'Leadbelcher', 'Nuln Oil', 'Agrax Earthshade', 'Wraithbone'];
              const { ALL_PAINT_PRESETS } = await import('../db/paint-presets');
              for (const name of starterPaints) {
                const p = ALL_PAINT_PRESETS.find(pp => pp.name === name);
                if (p) await db.paints.add({ name: p.name, brand: p.brand, range: p.range, type: p.type, hexColor: p.hex, owned: true, quantity: 1, notes: '' });
              }
              setStep(2);
            }}><GoldIcon name="paints" size={14} /> Yes, add a basic Citadel starter set</button>
            <button className="wizard-option" onClick={() => setStep(2)}>I'll add my paints later</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard-card" style={{ textAlign: 'center' }}>
          <div className="wizard-step-num">3 of 3</div>
          <div style={{ marginBottom: 16 }}><GoldIcon name="medal" size={64} /></div>
          <h3>You're all set!</h3>
          <p className="settings-desc">Your collection is ready. Here's what to do next:</p>
          <div className="wizard-next-steps">
            <button className="btn btn-primary btn-lg" onClick={() => nav('/grey-pile')}>🪦 See your Grey Pile</button>
            <button className="btn btn-outline btn-lg" onClick={() => nav('/suggestions')}><GoldIcon name="guides" size={14} /> Browse Painting Guides</button>
            <button className="btn btn-ghost btn-lg" onClick={() => nav('/')}><GoldIcon name="home" size={14} /> Go to Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
